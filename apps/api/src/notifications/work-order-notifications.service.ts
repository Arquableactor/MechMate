import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import type { MessageChannel } from '@prisma/client';
import type {
  CustomerView,
  PaymentCapturedPayload,
  WorkOrderApprovalRequestedPayload,
  WorkOrderStatusChangedPayload,
} from '@repo/types';
import { InvoicesService } from '../invoices/invoices.service';
import { ApprovalsService } from '../approvals/approvals.service';
import { CustomersService } from '../customers/customers.service';
import { DomainEventsRegistry } from '../domain-events/domain-events.registry';
import { MessagingService } from '../messaging/messaging.service';
import type { DomainEventJob } from '../outbox/outbox-relay.service';
import { ShopsService } from '../shops/shops.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { approvalRequested, workOrderReady, workOrderReceipt } from './work-order-templates';
import type { RenderedMessage } from './payment-templates';

/**
 * Avisos de órdenes de trabajo al CLIENTE DEL TALLER (no necesita cuenta en la
 * app): su contacto sale de Customers. Hoy: "tu vehículo está listo" al
 * completar. Email si tiene email; WhatsApp (stub) si tiene teléfono.
 * Idempotente por evento; intenta todos los canales y relanza si alguno falló
 * (BullMQ reintenta solo lo pendiente).
 */
@Injectable()
export class WorkOrderNotificationsService implements OnModuleInit {
  private readonly logger = new Logger(WorkOrderNotificationsService.name);

  constructor(
    private readonly registry: DomainEventsRegistry,
    private readonly messaging: MessagingService,
    private readonly customers: CustomersService,
    private readonly vehicles: VehiclesService,
    private readonly shops: ShopsService,
    private readonly approvals: ApprovalsService,
    private readonly invoices: InvoicesService,
  ) {}

  onModuleInit(): void {
    this.registry.on('WorkOrderStatusChanged', (e) => this.onStatusChanged(e));
    this.registry.on('WorkOrderApprovalRequested', (e) => this.onApprovalRequested(e));
    this.registry.on('PaymentCaptured', (e) => this.onPaymentCaptured(e));
  }

  async onStatusChanged(event: DomainEventJob): Promise<void> {
    const p = event.payload as WorkOrderStatusChangedPayload;
    if (p.to !== 'completed') return;
    const ctx = await this.context(p.shopId, p.customerId, p.vehicleId);
    const message = workOrderReady({
      customerName: ctx.customer.full_name,
      shopName: ctx.shopName,
      code: p.code,
      vehicle: ctx.vehicle,
      totalCents: BigInt(p.total_cents),
      currency: p.currency,
    });
    await this.deliver(event, ctx.customer, message, { workOrderId: p.workOrderId, code: p.code });
  }

  /** Enlace para aprobar el presupuesto. El evento no trae el token: se recalcula. */
  async onApprovalRequested(event: DomainEventJob): Promise<void> {
    const p = event.payload as WorkOrderApprovalRequestedPayload;
    const ctx = await this.context(p.shopId, p.customerId, p.vehicleId);
    const message = approvalRequested({
      customerName: ctx.customer.full_name,
      shopName: ctx.shopName,
      code: p.code,
      vehicle: ctx.vehicle,
      link: this.approvals.linkFor(p.approvalId),
    });
    await this.deliver(event, ctx.customer, message, { workOrderId: p.workOrderId, approvalId: p.approvalId });
  }

  /**
   * Recibo al CLIENTE del taller cuando se cobra su OT (tarjeta, efectivo o
   * transferencia). Los pagos del marketplace (sin workOrderId) no son de aquí.
   */
  async onPaymentCaptured(event: DomainEventJob): Promise<void> {
    const p = event.payload as PaymentCapturedPayload;
    if (!p.workOrderId || !p.invoiceId || !p.customerId || !p.method) return;
    const invoice = await this.invoices.get(p.shopId, p.invoiceId);
    const customer = await this.customers.get(p.shopId, p.customerId);
    const message = workOrderReceipt({
      customerName: customer.full_name,
      shopName: invoice.shop_name,
      workOrderCode: invoice.work_order_code,
      invoiceCode: invoice.code,
      ncf: invoice.ncf,
      // Del snapshot de la factura: lo que quedó facturado, no la ficha actual.
      vehicle: invoice.vehicle_description,
      totalCents: BigInt(p.amount_cents),
      currency: p.currency,
      method: p.method,
      paidAt: invoice.paid_at ?? event.occurredAt,
    });
    await this.deliver(event, customer, message, { workOrderId: p.workOrderId, invoiceId: p.invoiceId, paymentId: p.paymentId });
  }

  private async context(shopId: string, customerId: string, vehicleId: string) {
    const [customer, vehicles, shop] = await Promise.all([
      this.customers.get(shopId, customerId),
      this.vehicles.getSummaries(shopId, [vehicleId]),
      this.shops.getOwnerContact(shopId),
    ]);
    const v = vehicles.get(vehicleId);
    const vehicle = v
      ? [v.make, v.model, v.year].filter(Boolean).join(' ') + (v.plate ? ` (${v.plate})` : '')
      : 'vehículo';
    return { customer, vehicle, shopName: shop?.shopName ?? 'el taller' };
  }

  /** Email y/o WhatsApp según el contacto; intenta todos y relanza si alguno falló. */
  private async deliver(
    event: DomainEventJob,
    customer: CustomerView,
    message: RenderedMessage,
    payload: Record<string, string>,
  ): Promise<void> {
    const targets = channelsFor(customer);
    if (targets.length === 0) {
      this.logger.warn(`${message.template}: el cliente ${customer.id} no tiene email ni teléfono; no se avisa`);
      return;
    }
    const errors: string[] = [];
    for (const [channel, recipient] of targets) {
      try {
        await this.messaging.send({
          accountId: customer.account_id,
          channel,
          recipient,
          template: message.template,
          subject: message.subject,
          body: message.body,
          payload,
          dedupeKey: `${event.id}:${message.template}:${channel}:${recipient.toLowerCase()}`,
        });
      } catch (error) {
        errors.push(`${channel}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    if (errors.length > 0) {
      throw new Error(`${errors.length} envío(s) fallaron (${message.template} ${event.id}): ${errors.join('; ')}`);
    }
  }
}

function channelsFor(c: Pick<CustomerView, 'email' | 'phone'>): [MessageChannel, string][] {
  const targets: [MessageChannel, string][] = [];
  if (c.email) targets.push(['email', c.email]);
  if (c.phone) targets.push(['whatsapp', c.phone]);
  return targets;
}
