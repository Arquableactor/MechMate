import type { AccountContact, AccountsService, ShopOwnerContact } from '../accounts/accounts.service';
import { DomainEventsRegistry } from '../domain-events/domain-events.registry';
import type { MessagingService, SendMessageInput } from '../messaging/messaging.service';
import type { DomainEventJob } from '../outbox/outbox-relay.service';
import { PaymentNotificationsService } from './payment-notifications.service';
import { paymentReceipt, paymentReceived, paymentRefunded } from './payment-templates';

const owner: AccountContact = {
  accountId: 'acc-owner',
  email: 'taller@mail.do',
  phone: null,
  fullName: 'Ana Taller',
};
const buyer: AccountContact = {
  accountId: 'acc-buyer',
  email: 'Cliente@Mail.do',
  phone: '+18095551234',
  fullName: null,
};
const shop: ShopOwnerContact = { shopName: 'Taller Ana', owner };

const captured: DomainEventJob = {
  id: 'evt-1',
  topic: 'PaymentCaptured',
  occurredAt: '2026-09-28T16:30:00.000Z',
  payload: {
    paymentId: 'pay-1',
    amount_cents: '100000',
    commission_cents: '8000',
    net_cents: '92000',
    currency: 'DOP',
    shopId: 'shop-1',
    buyerAccountId: 'acc-buyer',
    orderId: null,
  },
};

const refunded: DomainEventJob = {
  id: 'evt-2',
  topic: 'PaymentRefunded',
  occurredAt: '2026-09-28T17:00:00.000Z',
  payload: {
    paymentId: 'pay-1',
    amount_cents: '100000',
    currency: 'DOP',
    shopId: 'shop-1',
    buyerAccountId: 'acc-buyer',
  },
};

function build(opts: {
  shop?: ShopOwnerContact | null;
  buyer?: AccountContact | null;
  failOn?: (input: SendMessageInput) => boolean;
} = {}) {
  const sent: SendMessageInput[] = [];
  const messaging = {
    send: jest.fn(async (input: SendMessageInput) => {
      if (opts.failOn?.(input)) throw new Error('Resend 500');
      sent.push(input);
    }),
  } as unknown as MessagingService;
  const accounts = {
    getShopOwnerContact: jest.fn().mockResolvedValue(opts.shop === undefined ? shop : opts.shop),
    getContact: jest.fn().mockResolvedValue(opts.buyer === undefined ? buyer : opts.buyer),
  } as unknown as AccountsService;
  const registry = new DomainEventsRegistry();
  const service = new PaymentNotificationsService(registry, messaging, accounts);
  return { service, registry, sent, messaging };
}

describe('PaymentNotificationsService', () => {
  it('se suscribe a PaymentCaptured y PaymentRefunded (y a nada más)', () => {
    const { service, registry } = build();
    service.onModuleInit();
    expect(registry.handlersFor('PaymentCaptured')).toHaveLength(1);
    expect(registry.handlersFor('PaymentRefunded')).toHaveLength(1);
    expect(registry.handlersFor('CommissionAccrued')).toHaveLength(0);
  });

  it('pago capturado: aviso al taller + recibo al cliente, por cada canal disponible', async () => {
    const { service, sent } = build();
    await service.onPaymentCaptured(captured);

    expect(sent.map((s) => [s.template, s.channel, s.recipient])).toEqual([
      ['payment_received', 'email', 'taller@mail.do'],
      ['payment_receipt', 'email', 'Cliente@Mail.do'],
      ['payment_receipt', 'whatsapp', '+18095551234'],
    ]);
    expect(sent[0]).toMatchObject({ accountId: 'acc-owner', subject: 'Pago recibido: RD$1,000.00' });
    // dedupeKey: evento + plantilla + canal + destinatario (en minúsculas).
    expect(sent[1].dedupeKey).toBe('evt-1:payment_receipt:email:cliente@mail.do');
    expect(sent.every((s) => s.payload && (s.payload as { paymentId: string }).paymentId === 'pay-1')).toBe(true);
  });

  it('reembolso: variante para el taller y para el cliente', async () => {
    const { service, sent } = build();
    await service.onPaymentRefunded(refunded);

    expect(sent.map((s) => `${s.template}:${s.channel}`)).toEqual([
      'payment_refunded_shop:email',
      'payment_refunded_buyer:email',
      'payment_refunded_buyer:whatsapp',
    ]);
  });

  it('cuenta sin email ni teléfono: se omite sin fallar', async () => {
    const { service, sent } = build({ buyer: { ...buyer, email: null, phone: null } });
    await expect(service.onPaymentCaptured(captured)).resolves.toBeUndefined();
    expect(sent.map((s) => s.template)).toEqual(['payment_received']);
  });

  it('taller inexistente: igual se envía el recibo al cliente', async () => {
    const { service, sent } = build({ shop: null });
    await service.onPaymentCaptured(captured);
    expect(sent.map((s) => s.template)).toEqual(['payment_receipt', 'payment_receipt']);
    expect(sent[0].body).toContain('el taller');
  });

  it('si un envío falla, intenta los demás y al final lanza (BullMQ reintenta lo pendiente)', async () => {
    const { service, sent, messaging } = build({ failOn: (i) => i.template === 'payment_received' });

    await expect(service.onPaymentCaptured(captured)).rejects.toThrow(
      /1 envío\(s\) fallaron \(PaymentCaptured evt-1\): payment_received\/email: Resend 500/,
    );
    expect(messaging.send).toHaveBeenCalledTimes(3);
    expect(sent.map((s) => s.template)).toEqual(['payment_receipt', 'payment_receipt']);
  });
});

describe('plantillas de pago', () => {
  it('pago recibido: monto, comisión y neto formateados', () => {
    const m = paymentReceived({
      ownerName: 'Ana',
      shopName: 'Taller Ana',
      amountCents: 100000n,
      commissionCents: 8000n,
      netCents: 92000n,
      currency: 'DOP',
      paymentId: 'pay-1',
    });
    expect(m.body).toContain('Hola Ana,');
    expect(m.body).toContain('Monto cobrado: RD$1,000.00');
    expect(m.body).toContain('Comisión MechMate: RD$80.00');
    expect(m.body).toContain('Neto a tu favor: RD$920.00');
  });

  it('recibo: fecha en hora de Santo Domingo y saludo genérico sin nombre', () => {
    const m = paymentReceipt({
      buyerName: null,
      shopName: 'Taller Ana',
      amountCents: 100000n,
      currency: 'DOP',
      paymentId: 'pay-1',
      occurredAt: '2026-09-28T16:30:00.000Z', // 12:30 en RD (UTC-4)
    });
    expect(m.body.startsWith('Hola,')).toBe(true);
    expect(m.body).toMatch(/28\/9\/26.*12:30/);
  });

  it('reembolso: texto distinto para taller y cliente', () => {
    const base = { name: null, shopName: 'T', amountCents: 500n, currency: 'DOP', paymentId: 'p' };
    expect(paymentRefunded({ ...base, audience: 'shop' }).body).toContain('se descuenta de tu saldo');
    expect(paymentRefunded({ ...base, audience: 'buyer' }).body).toContain('Te reembolsamos RD$5.00');
  });
});
