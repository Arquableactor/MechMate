import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import type { Payment, Prisma } from '@prisma/client';
import type { PaymentCapturedPayload, PaymentMethod } from '@repo/types';
import { commissionCents } from '../common/money';
import { LedgerAccountsService } from '../ledger/ledger-accounts.service';
import { LedgerService } from '../ledger/ledger.service';
import { recordOutboxEvents } from '../outbox/outbox.writer';
import { PAYMENT_PROVIDER, type PaymentProvider } from './providers/payment-provider.interface';

export interface InvoiceChargeInput {
  idempotencyKey: string;
  shopId: string;
  workOrderId: string;
  invoiceId: string;
  customerId: string;
  amountCents: bigint;
  currency: string;
  method: PaymentMethod;
}

/** Cuentas del ledger del cobro (se provisionan FUERA de la tx, como en capture()). */
export interface ChargeAccounts {
  payer: string;
  shopAvailable: string;
  platformCommission: string;
}

/**
 * Cobro de facturas de OT, en tres pasos que orquesta el llamador:
 *   1. begin()     — en SU tx (OT bloqueada): idempotencia + un solo cobro activo por factura.
 *   2. authorize() — FUERA de tx: el procesador (CardNet) no retiene la base.
 *   3. finalize()  — en SU tx: pago captured + asiento en el ledger + eventos.
 * Dueño de `payments` (como PaymentsService, que sigue siendo el del marketplace).
 */
@Injectable()
export class InvoicePaymentsService {
  private readonly logger = new Logger(InvoicePaymentsService.name);

  constructor(
    private readonly ledger: LedgerService,
    private readonly ledgerAccounts: LedgerAccountsService,
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
  ) {}

  /** Provisiona (o encuentra) las cuentas del ledger del cobro. Fuera de tx. */
  async accounts(shopId: string, customerId: string, currency: string): Promise<ChargeAccounts> {
    const [payer, shopAvailable, platformCommission] = await Promise.all([
      this.ledgerAccounts.getOrCreateOwned('buyer', customerId, 'available', currency),
      this.ledgerAccounts.getOrCreateOwned('seller', shopId, 'available', currency),
      this.ledgerAccounts.getOrCreateSingleton('platform', 'commission_revenue', currency),
    ]);
    return { payer, shopAvailable, platformCommission };
  }

  /**
   * Paso 1. Misma Idempotency-Key ⇒ devuelve ese pago (replay) sin cobrar de
   * nuevo; con otro cobro/método ⇒ 409. Otra key para una factura que ya tiene
   * un cobro activo (en curso o capturado) ⇒ 409: nunca dos cobros.
   */
  async begin(tx: Prisma.TransactionClient, input: InvoiceChargeInput): Promise<{ payment: Payment; replay: boolean }> {
    const existing = await tx.payment.findUnique({ where: { idempotency_key: input.idempotencyKey } });
    if (existing) {
      if (existing.invoice_id !== input.invoiceId || existing.method !== input.method) {
        throw new ConflictException('Idempotency-Key reutilizada con un cobro distinto.');
      }
      return { payment: existing, replay: true };
    }
    const active = await tx.payment.findFirst({
      where: { invoice_id: input.invoiceId, status: { in: ['requires_action', 'captured'] } },
    });
    if (active) {
      throw new ConflictException(
        active.status === 'captured' ? 'La factura ya está pagada.' : 'Hay un cobro en curso para esta factura.',
      );
    }
    const payment = await tx.payment.create({
      data: {
        provider: input.method === 'card' ? 'cardnet' : 'offline',
        method: input.method,
        amount_cents: input.amountCents,
        currency: input.currency,
        status: 'requires_action',
        idempotency_key: input.idempotencyKey,
        shop_id: input.shopId,
        work_order_id: input.workOrderId,
        invoice_id: input.invoiceId,
        payer_customer_id: input.customerId,
      },
    });
    return { payment, replay: false };
  }

  /**
   * Paso 2. Tarjeta: intent + captura en el procesador (hoy CardNet sandbox,
   * por la interfaz PaymentProvider). Efectivo/transferencia: el taller ya
   * recibió el dinero, no hay procesador.
   */
  async authorize(payment: Payment): Promise<{ captured: boolean; providerRef: string | null }> {
    if (payment.method !== 'card') return { captured: true, providerRef: null };
    try {
      const intent = await this.provider.createIntent({
        amountCents: payment.amount_cents,
        currency: payment.currency,
        idempotencyKey: payment.idempotency_key,
      });
      const result = await this.provider.capture({ providerRef: intent.providerRef, amountCents: payment.amount_cents });
      return { captured: result.status === 'captured', providerRef: result.providerRef };
    } catch (error) {
      // OJO: un timeout NO prueba que no se cobró. Queda failed para no cobrar
      // doble por aquí; la conciliación con el procesador (Día 13) lo resuelve.
      this.logger.error(`Cobro ${payment.id}: el procesador falló: ${error instanceof Error ? error.message : String(error)}`);
      return { captured: false, providerRef: null };
    }
  }

  /**
   * Comisión REALMENTE asentada para un cobro (fuente de verdad: el ledger, no
   * la tasa actual del taller, que pudo cambiar). 0 si no hubo asiento.
   */
  async commissionOf(paymentId: string, platformCommissionAccount: string, db: Prisma.TransactionClient): Promise<bigint> {
    const posting = await db.ledgerPosting.findFirst({
      where: { account_id: platformCommissionAccount, entry: { external_ref: `payment:${paymentId}` } },
      select: { amount_cents: true },
    });
    return posting?.amount_cents ?? 0n;
  }

  async markFailed(tx: Prisma.TransactionClient, paymentId: string, providerRef: string | null): Promise<Payment> {
    return tx.payment.update({ where: { id: paymentId }, data: { status: 'failed', provider_ref: providerRef } });
  }

  /**
   * Paso 3. Pago captured + asiento (suma 0) + eventos, en la tx del llamador.
   *  - Tarjeta:           cliente −total / taller +neto / plataforma +comisión.
   *  - Efectivo/transfer: taller −comisión / plataforma +comisión (el dinero no
   *    pasó por la plataforma: la comisión queda como DEUDA del taller y se
   *    descuenta de su próximo payout).
   */
  async finalize(
    tx: Prisma.TransactionClient,
    payment: Payment,
    providerRef: string | null,
    commissionBps: number,
    accounts: ChargeAccounts,
  ): Promise<{ payment: Payment; commission: bigint; net: bigint }> {
    const total = payment.amount_cents;
    const commission = commissionCents(total, commissionBps);
    const net = total - commission;
    const currency = payment.currency;

    const captured = await tx.payment.update({
      where: { id: payment.id },
      data: { status: 'captured', provider_ref: providerRef },
    });

    const events = [
      {
        topic: 'PaymentCaptured' as const,
        payload: {
          paymentId: payment.id,
          amount_cents: total.toString(),
          commission_cents: commission.toString(),
          net_cents: net.toString(),
          currency,
          shopId: payment.shop_id!,
          buyerAccountId: null,
          orderId: null,
          workOrderId: payment.work_order_id!,
          invoiceId: payment.invoice_id!,
          customerId: payment.payer_customer_id!,
          method: payment.method,
        } satisfies PaymentCapturedPayload,
      },
      {
        topic: 'CommissionAccrued' as const,
        payload: {
          paymentId: payment.id,
          commission_cents: commission.toString(),
          net_cents: net.toString(),
          currency,
          shopId: payment.shop_id!,
        },
      },
    ];

    const postings =
      payment.method === 'card'
        ? [
            { accountId: accounts.payer, amountCents: -total, currency },
            { accountId: accounts.shopAvailable, amountCents: net, currency },
            { accountId: accounts.platformCommission, amountCents: commission, currency },
          ]
        : [
            { accountId: accounts.shopAvailable, amountCents: -commission, currency },
            { accountId: accounts.platformCommission, amountCents: commission, currency },
          ];

    if (commission === 0n && payment.method !== 'card') {
      // Comisión 0 en efectivo: no hay nada que asentar, pero el hecho sí se publica.
      await recordOutboxEvents(tx, events);
    } else {
      await this.ledger.postEntry(
        {
          externalRef: `payment:${payment.id}`,
          description: `Cobro ${payment.method} de factura ${payment.invoice_id}`,
          postings: postings.filter((p) => p.amountCents !== 0n),
          outboxEvents: events,
        },
        tx,
      );
    }
    return { payment: captured, commission, net };
  }
}
