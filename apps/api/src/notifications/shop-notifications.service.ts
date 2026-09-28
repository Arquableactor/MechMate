import { Injectable, type OnModuleInit } from '@nestjs/common';
import type { ShopMemberInvitedPayload } from '@repo/types';
import { DomainEventsRegistry } from '../domain-events/domain-events.registry';
import { MessagingService } from '../messaging/messaging.service';
import type { DomainEventJob } from '../outbox/outbox-relay.service';
import { shopInvitation } from './shop-templates';

/**
 * Avisos de talleres. La invitación va SOLO por email: es la identidad con que
 * la persona debe iniciar sesión para reclamarla. Sale una sola vez por
 * invitación (dedupeKey con el id del evento).
 */
@Injectable()
export class ShopNotificationsService implements OnModuleInit {
  constructor(
    private readonly registry: DomainEventsRegistry,
    private readonly messaging: MessagingService,
  ) {}

  onModuleInit(): void {
    this.registry.on('ShopMemberInvited', (e) => this.onMemberInvited(e));
  }

  async onMemberInvited(event: DomainEventJob): Promise<void> {
    const p = event.payload as ShopMemberInvitedPayload;
    const message = shopInvitation(p);
    await this.messaging.send({
      accountId: null,
      channel: 'email',
      recipient: p.email,
      template: message.template,
      subject: message.subject,
      body: message.body,
      payload: { shopId: p.shopId, memberId: p.memberId },
      dedupeKey: `${event.id}:${message.template}:email:${p.email}`,
    });
  }
}
