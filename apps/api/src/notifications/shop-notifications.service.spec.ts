import type { ShopMemberInvitedPayload } from '@repo/types';
import { DomainEventsRegistry } from '../domain-events/domain-events.registry';
import type { MessagingService, SendMessageInput } from '../messaging/messaging.service';
import type { DomainEventJob } from '../outbox/outbox-relay.service';
import { ShopNotificationsService } from './shop-notifications.service';
import { shopInvitation } from './shop-templates';

const payload: ShopMemberInvitedPayload = {
  memberId: 'mem-1',
  shopId: 'shop-1',
  shopName: 'Taller Ana',
  email: 'pedro@mail.do',
  role: 'mechanic',
  status: 'invited',
  invitedByName: 'Ana',
};

const eventOf = (p: ShopMemberInvitedPayload): DomainEventJob => ({
  id: 'evt-9',
  topic: 'ShopMemberInvited',
  payload: p,
  occurredAt: '2026-09-28T16:00:00.000Z',
});

describe('ShopNotificationsService', () => {
  const build = () => {
    const sent: SendMessageInput[] = [];
    const messaging = { send: jest.fn(async (i: SendMessageInput) => void sent.push(i)) } as unknown as MessagingService;
    const registry = new DomainEventsRegistry();
    return { service: new ShopNotificationsService(registry, messaging), registry, sent };
  };

  it('se suscribe a ShopMemberInvited', () => {
    const { service, registry } = build();
    service.onModuleInit();
    expect(registry.handlersFor('ShopMemberInvited')).toHaveLength(1);
  });

  it('envía la invitación SOLO por email, al email invitado, con dedupe por evento', async () => {
    const { service, sent } = build();
    await service.onMemberInvited(eventOf(payload));

    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      channel: 'email',
      recipient: 'pedro@mail.do',
      accountId: null,
      template: 'shop_invitation',
      subject: 'Te invitaron a Taller Ana en MechMate',
      dedupeKey: 'evt-9:shop_invitation:email:pedro@mail.do',
    });
  });
});

describe('shopInvitation', () => {
  it('invitado: explica que debe iniciar sesión con ese email verificado', () => {
    const m = shopInvitation(payload);
    expect(m.body).toContain('Ana te invitó a unirte a Taller Ana como mecánico');
    expect(m.body).toContain('inicia sesión con este mismo email (pedro@mail.do)');
  });

  it('ya tenía cuenta: le avisa que ya tiene acceso', () => {
    const m = shopInvitation({ ...payload, status: 'active', role: 'advisor', invitedByName: null });
    expect(m.template).toBe('shop_member_added');
    expect(m.body).toContain('El dueño del taller te agregó a Taller Ana como asesor de servicio');
  });
});
