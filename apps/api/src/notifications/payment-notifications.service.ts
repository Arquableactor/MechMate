import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import type { MessageChannel } from '@prisma/client';
import type { PaymentCapturedPayload, PaymentRefundedPayload } from '@repo/types';
import { type AccountContact, AccountsService } from '../accounts/accounts.service';
import { DomainEventsRegistry } from '../domain-events/domain-events.registry';
import { MessagingService } from '../messaging/messaging.service';
import type { DomainEventJob } from '../outbox/outbox-relay.service';
import { ShopsService } from '../shops/shops.service';
import {
  paymentReceipt,
  paymentReceived,
  paymentRefunded,
  type RenderedMessage,
} from './payment-templates';

interface Delivery {
  contact: AccountContact;
  message: RenderedMessage;
}

/**
 * Traduce eventos de pagos en avisos al taller y al cliente.
 * - Canales por contacto: email si tiene email; WhatsApp (stub) si tiene
 *   teléfono. Push llega con el móvil (Día 8).
 * - Idempotente: la dedupeKey incluye el id del evento; un reintento no
 *   reenvía lo que ya salió (MessagingService).
 * - Intenta TODOS los envíos aunque uno falle, y al final relanza para que
 *   BullMQ reintente solo lo pendiente.
 */
@Injectable()
export class PaymentNotificationsService implements OnModuleInit {
  private readonly logger = new Logger(PaymentNotificationsService.name);

  constructor(
    private readonly registry: DomainEventsRegistry,
    private readonly messaging: MessagingService,
    private readonly accounts: AccountsService,
    private readonly shops: ShopsService,
  ) {}

  onModuleInit(): void {
    this.registry.on('PaymentCaptured', (e) => this.onPaymentCaptured(e));
    this.registry.on('PaymentRefunded', (e) => this.onPaymentRefunded(e));
  }

  async onPaymentCaptured(event: DomainEventJob): Promise<void> {
    const p = event.payload as PaymentCapturedPayload;
    const [shop, buyer] = await Promise.all([
      this.shops.getOwnerContact(p.shopId),
      // Cobro de OT: paga un cliente del taller (sin cuenta); su recibo lo manda
      // WorkOrderNotificationsService.
      p.buyerAccountId ? this.accounts.getContact(p.buyerAccountId) : null,
    ]);
    const shopName = shop?.shopName ?? 'el taller';
    const amountCents = BigInt(p.amount_cents);
    const deliveries: Delivery[] = [];

    if (shop) {
      deliveries.push({
        contact: shop.owner,
        message: paymentReceived({
          ownerName: shop.owner.fullName,
          shopName,
          amountCents,
          commissionCents: BigInt(p.commission_cents),
          netCents: BigInt(p.net_cents),
          currency: p.currency,
          paymentId: p.paymentId,
        }),
      });
    } else {
      this.logger.warn(`PaymentCaptured ${event.id}: taller ${p.shopId} no existe; no se avisa`);
    }
    if (buyer) {
      deliveries.push({
        contact: buyer,
        message: paymentReceipt({
          buyerName: buyer.fullName,
          shopName,
          amountCents,
          currency: p.currency,
          paymentId: p.paymentId,
          occurredAt: event.occurredAt,
        }),
      });
    }
    await this.deliver(event, deliveries, { paymentId: p.paymentId });
  }

  async onPaymentRefunded(event: DomainEventJob): Promise<void> {
    const p = event.payload as PaymentRefundedPayload;
    const [shop, buyer] = await Promise.all([
      this.shops.getOwnerContact(p.shopId),
      this.accounts.getContact(p.buyerAccountId),
    ]);
    const shopName = shop?.shopName ?? 'el taller';
    const base = {
      shopName,
      amountCents: BigInt(p.amount_cents),
      currency: p.currency,
      paymentId: p.paymentId,
    };
    const deliveries: Delivery[] = [];

    if (shop) {
      deliveries.push({
        contact: shop.owner,
        message: paymentRefunded({ ...base, audience: 'shop', name: shop.owner.fullName }),
      });
    }
    if (buyer) {
      deliveries.push({
        contact: buyer,
        message: paymentRefunded({ ...base, audience: 'buyer', name: buyer.fullName }),
      });
    }
    await this.deliver(event, deliveries, { paymentId: p.paymentId });
  }

  private async deliver(
    event: DomainEventJob,
    deliveries: Delivery[],
    payload: Record<string, string>,
  ): Promise<void> {
    const errors: string[] = [];

    for (const { contact, message } of deliveries) {
      const targets = channelsFor(contact);
      if (targets.length === 0) {
        this.logger.warn(
          `${message.template}: la cuenta ${contact.accountId} no tiene email ni teléfono; se omite`,
        );
      }
      for (const [channel, recipient] of targets) {
        try {
          await this.messaging.send({
            accountId: contact.accountId,
            channel,
            recipient,
            template: message.template,
            subject: message.subject,
            body: message.body,
            payload,
            dedupeKey: `${event.id}:${message.template}:${channel}:${recipient.toLowerCase()}`,
          });
        } catch (error) {
          errors.push(
            `${message.template}/${channel}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(`${errors.length} envío(s) fallaron (${event.topic} ${event.id}): ${errors.join('; ')}`);
    }
  }
}

/** Canales disponibles para un contacto. */
function channelsFor(contact: AccountContact): [MessageChannel, string][] {
  const targets: [MessageChannel, string][] = [];
  if (contact.email) targets.push(['email', contact.email]);
  if (contact.phone) targets.push(['whatsapp', contact.phone]);
  return targets;
}
