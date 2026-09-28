import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import type { MessageChannel } from '@prisma/client';
import type { CustomerView, WorkOrderStatusChangedPayload } from '@repo/types';
import { CustomersService } from '../customers/customers.service';
import { DomainEventsRegistry } from '../domain-events/domain-events.registry';
import { MessagingService } from '../messaging/messaging.service';
import type { DomainEventJob } from '../outbox/outbox-relay.service';
import { ShopsService } from '../shops/shops.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { workOrderReady } from './work-order-templates';

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
  ) {}

  onModuleInit(): void {
    this.registry.on('WorkOrderStatusChanged', (e) => this.onStatusChanged(e));
  }

  async onStatusChanged(event: DomainEventJob): Promise<void> {
    const p = event.payload as WorkOrderStatusChangedPayload;
    if (p.to !== 'completed') return;

    const [customer, vehicles, shop] = await Promise.all([
      this.customers.get(p.shopId, p.customerId),
      this.vehicles.getSummaries(p.shopId, [p.vehicleId]),
      this.shops.getOwnerContact(p.shopId),
    ]);
    const v = vehicles.get(p.vehicleId);
    const vehicle = v
      ? [v.make, v.model, v.year].filter(Boolean).join(' ') + (v.plate ? ` (${v.plate})` : '')
      : 'vehículo';
    const message = workOrderReady({
      customerName: customer.full_name,
      shopName: shop?.shopName ?? 'el taller',
      code: p.code,
      vehicle,
      totalCents: BigInt(p.total_cents),
      currency: p.currency,
    });

    const targets = channelsFor(customer);
    if (targets.length === 0) {
      this.logger.warn(`${p.code}: el cliente ${customer.id} no tiene email ni teléfono; no se avisa`);
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
          payload: { workOrderId: p.workOrderId, code: p.code },
          dedupeKey: `${event.id}:${message.template}:${channel}:${recipient.toLowerCase()}`,
        });
      } catch (error) {
        errors.push(`${channel}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    if (errors.length > 0) {
      throw new Error(`${errors.length} envío(s) fallaron (${p.code} ${event.id}): ${errors.join('; ')}`);
    }
  }
}

function channelsFor(c: Pick<CustomerView, 'email' | 'phone'>): [MessageChannel, string][] {
  const targets: [MessageChannel, string][] = [];
  if (c.email) targets.push(['email', c.email]);
  if (c.phone) targets.push(['whatsapp', c.phone]);
  return targets;
}
