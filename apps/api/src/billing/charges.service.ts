import { ConflictException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { Invoice, Payment, Payout } from '@prisma/client';
import type { ChargeView, PaymentMethod } from '@repo/types';
import { addBusinessDays } from '../common/business-days';
import { invoiceCode, InvoicesService } from '../invoices/invoices.service';
import { InvoicePaymentsService } from '../payments/invoice-payments.service';
import { PayoutsService } from '../payouts/payouts.service';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';
import { TX_OPTIONS, workOrderCode, WorkOrdersService } from '../work-orders/work-orders.service';

const PAYOUT_BUSINESS_DAYS = 2;

/** 402: el procesador rechazó la tarjeta. */
class PaymentDeclinedException extends HttpException {
  constructor() {
    super('El cobro con tarjeta fue rechazado. Prueba con otra tarjeta o método.', HttpStatus.PAYMENT_REQUIRED);
  }
}

/**
 * Cobro de una OT facturada (orquesta Pagos + Facturas + OT + Payouts).
 *   1. tx (OT bloqueada): factura emitida y OT invoiced; pago en curso (idempotente).
 *   2. procesador (fuera de tx).
 *   3. tx (OT bloqueada): pago captured + ledger + factura paid + OT paid +
 *      eventos + payout T+2 hábiles del saldo del taller — todo o nada.
 * El MONTO sale de la factura, nunca del cliente HTTP.
 */
@Injectable()
export class ChargesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workOrders: WorkOrdersService,
    private readonly invoices: InvoicesService,
    private readonly payments: InvoicePaymentsService,
    private readonly payouts: PayoutsService,
    private readonly shops: ShopsService,
  ) {}

  async charge(
    shopId: string,
    workOrderId: string,
    input: { method: PaymentMethod; idempotencyKey: string; accountId: string },
  ): Promise<ChargeView> {
    const wo = await this.workOrders.get(shopId, workOrderId); // 404 si no es de este taller
    const invoice = await this.invoices.findIssuable(shopId, workOrderId);
    if (!invoice) throw new ConflictException(`Factura la orden ${wo.code} antes de cobrarla.`);

    // Fuera de tx: cuentas del ledger y comisión del taller.
    const [accounts, payoutAccounts, commissionBps] = await Promise.all([
      this.payments.accounts(shopId, wo.customer.id, invoice.currency),
      this.payouts.accounts(shopId, invoice.currency),
      this.shops.getCommissionBps(shopId),
    ]);

    // 1) Abrir el cobro.
    const begun = await this.prisma.$transaction(async (tx) => {
      const locked = await this.workOrders.lockForUpdate(tx, shopId, workOrderId);
      const result = await this.payments.begin(tx, {
        idempotencyKey: input.idempotencyKey,
        shopId,
        workOrderId,
        invoiceId: invoice.id,
        customerId: wo.customer.id,
        amountCents: invoice.total_cents,
        currency: invoice.currency,
        method: input.method,
      });
      if (!result.replay) {
        const current = await tx.invoice.findUniqueOrThrow({ where: { id: invoice.id } });
        if (locked.status !== 'invoiced' || current.status !== 'issued') {
          throw new ConflictException(`La orden ${workOrderCode(locked.number)} está ${locked.status}: no se puede cobrar.`);
        }
      }
      return result;
    }, TX_OPTIONS);

    if (begun.replay) return this.replay(begun.payment, shopId, workOrderId, accounts.platformCommission);

    // 2) Procesador (fuera de tx).
    const auth = await this.payments.authorize(begun.payment);
    if (!auth.captured) {
      await this.prisma.$transaction((tx) => this.payments.markFailed(tx, begun.payment.id, auth.providerRef));
      throw new PaymentDeclinedException();
    }

    // 3) Asentar todo o nada.
    const done = await this.prisma.$transaction(async (tx) => {
      const locked = await this.workOrders.lockForUpdate(tx, shopId, workOrderId);
      const finalized = await this.payments.finalize(tx, begun.payment, auth.providerRef, commissionBps, accounts);
      const paidInvoice = await this.invoices.markPaid(tx, invoice.id);
      await this.workOrders.changeStatus(tx, shopId, locked, 'paid', { accountId: input.accountId });
      const payout =
        input.method === 'card'
          ? await this.payouts.scheduleAvailableBalance(tx, {
              shopId,
              currency: invoice.currency,
              scheduledFor: addBusinessDays(new Date(), PAYOUT_BUSINESS_DAYS),
              sourcePaymentId: begun.payment.id,
              accounts: payoutAccounts,
            })
          : null;
      return { ...finalized, invoice: paidInvoice, payout, woNumber: locked.number };
    }, TX_OPTIONS);

    return this.toView(done.payment, done.commission, done.invoice, done.woNumber, 'paid', workOrderId, done.payout, false);
  }

  /** Misma Idempotency-Key: se responde con lo que ya pasó, sin volver a cobrar. */
  private async replay(
    payment: Payment,
    shopId: string,
    workOrderId: string,
    platformCommissionAccount: string,
  ): Promise<ChargeView> {
    if (payment.status === 'failed') throw new PaymentDeclinedException();
    if (payment.status !== 'captured') {
      throw new ConflictException('Este cobro todavía está en curso: reintenta en unos segundos.');
    }
    const [wo, invoice, payout, commission] = await Promise.all([
      this.workOrders.get(shopId, workOrderId),
      this.prisma.invoice.findUniqueOrThrow({ where: { id: payment.invoice_id! } }),
      this.prisma.payout.findFirst({ where: { source_payment_id: payment.id } }),
      this.payments.commissionOf(payment.id, platformCommissionAccount, this.prisma),
    ]);
    return this.toView(payment, commission, invoice, wo.number, wo.status, workOrderId, payout, true);
  }

  private toView(
    payment: Payment,
    commission: bigint,
    invoice: Invoice,
    woNumber: number,
    woStatus: ChargeView['work_order']['status'],
    workOrderId: string,
    payout: Payout | null,
    replayed: boolean,
  ): ChargeView {
    return {
      payment: {
        id: payment.id,
        method: payment.method,
        status: payment.status,
        amount_cents: payment.amount_cents.toString(),
        commission_cents: commission.toString(),
        currency: payment.currency,
        provider_ref: payment.provider_ref,
      },
      invoice: { id: invoice.id, code: invoiceCode(invoice.number), status: invoice.status },
      work_order: { id: workOrderId, code: workOrderCode(woNumber), status: woStatus },
      payout: payout
        ? { id: payout.id, amount_cents: payout.amount_cents.toString(), scheduled_for: payout.scheduled_for.toISOString().slice(0, 10) }
        : null,
      replayed,
    };
  }
}
