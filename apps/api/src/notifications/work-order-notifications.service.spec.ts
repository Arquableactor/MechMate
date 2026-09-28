import type { CustomerView, WorkOrderStatusChangedPayload } from '@repo/types';
import type { CustomersService } from '../customers/customers.service';
import { DomainEventsRegistry } from '../domain-events/domain-events.registry';
import type { MessagingService, SendMessageInput } from '../messaging/messaging.service';
import type { DomainEventJob } from '../outbox/outbox-relay.service';
import type { ShopsService } from '../shops/shops.service';
import type { VehiclesService } from '../vehicles/vehicles.service';
import { WorkOrderNotificationsService } from './work-order-notifications.service';

const customer = {
  id: 'cus-1',
  full_name: 'María Gómez',
  email: 'maria@mail.do',
  phone: '+18295550177',
  account_id: null,
} as CustomerView;

const payload: WorkOrderStatusChangedPayload = {
  workOrderId: 'wo-1',
  shopId: 'shop-1',
  code: 'OT-0007',
  from: 'in_progress',
  to: 'completed',
  customerId: 'cus-1',
  vehicleId: 'veh-1',
  total_cents: '212400',
  currency: 'DOP',
  changedByAccountId: 'acc-1',
  reason: null,
};

const eventOf = (p: WorkOrderStatusChangedPayload): DomainEventJob => ({
  id: 'evt-3',
  topic: 'WorkOrderStatusChanged',
  payload: p,
  occurredAt: '2026-09-28T20:00:00.000Z',
});

function build(c: Partial<CustomerView> = {}, failOn?: string) {
  const sent: SendMessageInput[] = [];
  const messaging = {
    send: jest.fn(async (i: SendMessageInput) => {
      if (i.channel === failOn) throw new Error('caído');
      sent.push(i);
    }),
  } as unknown as MessagingService;
  const customers = { get: jest.fn().mockResolvedValue({ ...customer, ...c }) } as unknown as CustomersService;
  const vehicles = {
    getSummaries: jest.fn().mockResolvedValue(
      new Map([['veh-1', { id: 'veh-1', make: 'Toyota', model: 'Corolla', year: 2019, plate: 'A482901' }]]),
    ),
  } as unknown as VehiclesService;
  const shops = { getOwnerContact: jest.fn().mockResolvedValue({ shopName: 'Taller Pérez' }) } as unknown as ShopsService;
  const registry = new DomainEventsRegistry();
  const service = new WorkOrderNotificationsService(registry, messaging, customers, vehicles, shops);
  return { service, registry, sent, messaging };
}

describe('WorkOrderNotificationsService', () => {
  it('se suscribe a WorkOrderStatusChanged', () => {
    const { service, registry } = build();
    service.onModuleInit();
    expect(registry.handlersFor('WorkOrderStatusChanged')).toHaveLength(1);
  });

  it('al completar: "Tu vehículo está listo" por email y WhatsApp al cliente del taller', async () => {
    const { service, sent } = build();
    await service.onStatusChanged(eventOf(payload));

    expect(sent.map((s) => [s.channel, s.recipient])).toEqual([
      ['email', 'maria@mail.do'],
      ['whatsapp', '+18295550177'],
    ]);
    expect(sent[0]).toMatchObject({
      template: 'work_order_ready',
      subject: 'Tu vehículo está listo — Taller Pérez',
      dedupeKey: 'evt-3:work_order_ready:email:maria@mail.do',
    });
    expect(sent[0].body).toContain('Tu Toyota Corolla 2019 (A482901) ya está listo en Taller Pérez.');
    expect(sent[0].body).toContain('Orden: OT-0007');
    expect(sent[0].body).toContain('Total: RD$2,124.00');
  });

  it('otras transiciones no avisan', async () => {
    const { service, messaging } = build();
    for (const to of ['in_progress', 'cancelled'] as const) {
      await service.onStatusChanged(eventOf({ ...payload, to }));
    }
    expect(messaging.send).not.toHaveBeenCalled();
  });

  it('cliente sin email ni teléfono: no falla', async () => {
    const { service, messaging } = build({ email: null, phone: null });
    await expect(service.onStatusChanged(eventOf(payload))).resolves.toBeUndefined();
    expect(messaging.send).not.toHaveBeenCalled();
  });

  it('si un canal falla, intenta el otro y relanza (para reintentar)', async () => {
    const { service, sent } = build({}, 'email');
    await expect(service.onStatusChanged(eventOf(payload))).rejects.toThrow(/1 envío\(s\) fallaron \(OT-0007/);
    expect(sent.map((s) => s.channel)).toEqual(['whatsapp']);
  });
});
