import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';
import { Prisma, type Payment, type PaymentStatus } from '@prisma/client';
import type { PaymentView } from '@repo/types';
import { commissionCents } from '../common/money';
import { LedgerAccountsService } from '../ledger/ledger-accounts.service';
import { LedgerService } from '../ledger/ledger.service';
import { PrismaService } from '../prisma/prisma.service';
import { PAYMENT_PROVIDER, type PaymentProvider } from './providers/payment-provider.interface';

export interface CaptureInput {
  idempotencyKey: string;
  totalCents: bigint;
  currency: string;
  shopId: string;
  buyerAccountId: string;
  orderId?: string;
}

export interface WebhookEvent {
  paymentId?: string;
  providerRef?: string;
  status?: PaymentStatus;
}

export interface WebhookResult {
  received: true;
  paymentId: string | null;
  applied: boolean;
}

/** Máquina de estados de un pago. Solo estas transiciones están permitidas. */
const ALLOWED_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  requires_action: ['captured', 'failed'],
  captured: ['refunded'],
  failed: [],
  refunded: [],
};

/** Mapea la entidad Payment al contrato público (montos como string). */
export function toPaymentView(p: Payment): PaymentView {
  return {
    id: p.id,
    order_id: p.order_id,
    provider: 'cardnet',
    status: p.status,
    amount_cents: p.amount_cents.toString(),
    currency: p.currency,
    created_at: p.created_at.toISOString(),
  };
}

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: LedgerService,
    private readonly ledgerAccounts: LedgerAccountsService,
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
  ) {}

  /**
   * Captura un cobro de `totalCents` para un `shop`. Idempotente por
   * `idempotencyKey`. En UNA tx: marca el pago `captured`, postea el asiento de
   * 3 líneas (buyer −total / seller +net / platform +commission) y escribe los
   * eventos al outbox. (Escrow real = Fase 2; aquí el neto va directo a available.)
   */
  async capture(input: CaptureInput): Promise<PaymentView> {
    if (input.totalCents <= 0n) {
      throw new BadRequestException('totalCents debe ser > 0');
    }

    // 1) Idempotencia: misma key ⇒ no re-postea. Payload distinto ⇒ 409.
    const existing = await this.prisma.payment.findUnique({
      where: { idempotency_key: input.idempotencyKey },
    });
    if (existing) {
      const samePayload =
        existing.amount_cents === input.totalCents &&
        existing.currency === input.currency &&
        (existing.order_id ?? null) === (input.orderId ?? null);
      if (!samePayload) {
        throw new ConflictException('Idempotency-Key reutilizada con un payload distinto');
      }
      return toPaymentView(existing);
    }

    // 2) Comisión (BigInt puro). net = total - commission ⇒ el asiento balancea.
    const shop = await this.prisma.shop.findUniqueOrThrow({ where: { id: input.shopId } });
    const commission = commissionCents(input.totalCents, shop.commission_bps);
    const net = input.totalCents - commission;

    // 3) Provisiona las cuentas FUERA de la tx (no envenenar la captura).
    const buyerAccount = await this.ledgerAccounts.getOrCreateOwned(
      'buyer',
      input.buyerAccountId,
      'available',
      input.currency,
    );
    const sellerAccount = await this.ledgerAccounts.getOrCreateOwned(
      'seller',
      input.shopId,
      'available',
      input.currency,
    );
    const commissionAccount = await this.ledgerAccounts.getOrCreateSingleton(
      'platform',
      'commission_revenue',
      input.currency,
    );

    // 4) Una sola tx: payment + asiento + outbox.
    try {
      const payment = await this.prisma.$transaction(async (tx) => {
        const created = await tx.payment.create({
          data: {
            order_id: input.orderId ?? null,
            provider: 'cardnet',
            amount_cents: input.totalCents,
            currency: input.currency,
            status: 'captured',
            idempotency_key: input.idempotencyKey,
          },
        });

        await this.ledger.postEntry(
          {
            externalRef: `payment:${created.id}`,
            description: `Captura de pago ${created.id}`,
            postings: [
              { accountId: buyerAccount, amountCents: -input.totalCents, currency: input.currency },
              { accountId: sellerAccount, amountCents: net, currency: input.currency },
              {
                accountId: commissionAccount,
                amountCents: commission,
                currency: input.currency,
              },
            ],
            outboxEvents: [
              {
                topic: 'PaymentCaptured',
                payload: {
                  paymentId: created.id,
                  amount_cents: input.totalCents.toString(),
                  currency: input.currency,
                  shopId: input.shopId,
                  orderId: input.orderId ?? null,
                },
              },
              {
                topic: 'CommissionAccrued',
                payload: {
                  paymentId: created.id,
                  commission_cents: commission.toString(),
                  net_cents: net.toString(),
                  currency: input.currency,
                  shopId: input.shopId,
                },
              },
            ],
          },
          tx,
        );

        return created;
      });

      return toPaymentView(payment);
    } catch (error) {
      // Carrera: otra petición con la misma key ganó. Devuelve el ganador.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const winner = await this.prisma.payment.findUniqueOrThrow({
          where: { idempotency_key: input.idempotencyKey },
        });
        return toPaymentView(winner);
      }
      throw error;
    }
  }

  /**
   * Procesa un webhook del PSP (ya verificado en firma por el controller).
   * Transiciona el estado del pago respetando la máquina de estados, de forma
   * idempotente (re-entregas del mismo estado son no-op). Un `refunded` NO solo
   * cambia el enum: postea el **asiento de reversa** (líneas invertidas) en la
   * misma tx, para mantener el ledger consistente con el pago (invariante de
   * inmutabilidad: correcciones por INSERT, nunca UPDATE/DELETE).
   */
  async handleWebhook(event: WebhookEvent): Promise<WebhookResult> {
    if (!event.status) return { received: true, paymentId: null, applied: false };

    const where = event.paymentId
      ? { id: event.paymentId }
      : event.providerRef
        ? { provider_ref: event.providerRef }
        : null;
    if (!where) return { received: true, paymentId: null, applied: false };

    const payment = await this.prisma.payment.findFirst({ where });
    if (!payment) return { received: true, paymentId: null, applied: false };

    // Idempotente: el mismo estado no se re-aplica.
    if (payment.status === event.status) {
      return { received: true, paymentId: payment.id, applied: false };
    }

    const allowed = ALLOWED_TRANSITIONS[payment.status] ?? [];
    if (!allowed.includes(event.status)) {
      throw new ConflictException(
        `Transición de pago inválida: ${payment.status} → ${event.status}`,
      );
    }

    if (event.status === 'refunded') {
      await this.refundCapture(payment);
    } else {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: event.status },
      });
    }
    return { received: true, paymentId: payment.id, applied: true };
  }

  /** Marca el pago `refunded` y postea el asiento de reversa en una sola tx. */
  private async refundCapture(payment: Payment): Promise<void> {
    const original = await this.prisma.ledgerPosting.findMany({
      where: { entry: { external_ref: `payment:${payment.id}` } },
      select: { account_id: true, amount_cents: true, currency: true },
    });
    if (original.length === 0) {
      throw new ConflictException('No existe asiento de captura para revertir');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({ where: { id: payment.id }, data: { status: 'refunded' } });
      await this.ledger.postEntry(
        {
          externalRef: `reversal:payment:${payment.id}`,
          description: `Reversa de captura ${payment.id}`,
          postings: original.map((p) => ({
            accountId: p.account_id,
            amountCents: -p.amount_cents,
            currency: p.currency,
          })),
          outboxEvents: [
            {
              topic: 'PaymentRefunded',
              payload: { paymentId: payment.id, currency: payment.currency },
            },
          ],
        },
        tx,
      );
    });
  }
}
