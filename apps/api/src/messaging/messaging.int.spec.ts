import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { MessageChannelAdapter } from './channels/message-channel.interface';
import { MessagingService, type SendMessageInput } from './messaging.service';

/**
 * MessagingService contra Postgres REAL: la idempotencia vive en el UNIQUE de
 * `dedupe_key`, así que se prueba en la DB, no con mocks. El canal es un fake.
 */
let prisma: PrismaService;

beforeAll(async () => {
  prisma = new PrismaService();
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

function fakeEmail(behavior: 'ok' | 'fail' = 'ok') {
  const send = jest.fn(async () => {
    if (behavior === 'fail') throw new Error('SMTP caído');
    return { providerRef: `ref_${randomUUID()}` };
  });
  const adapter: MessageChannelAdapter = { channel: 'email', provider: 'fake', send };
  return { adapter, send };
}

const input = (over: Partial<SendMessageInput> = {}): SendMessageInput => ({
  channel: 'email',
  recipient: 'taller@mail.do',
  template: 'payment_received',
  subject: 'Pago recibido',
  body: 'Recibiste RD$1,000.00',
  payload: { amount_cents: '100000' },
  dedupeKey: `evt-${randomUUID()}:payment_received:email:taller@mail.do`,
  ...over,
});

describe('MessagingService (integración, Postgres real)', () => {
  it('envía y registra: status sent, 1 intento, provider_ref y sent_at', async () => {
    const { adapter, send } = fakeEmail();
    const service = new MessagingService(prisma, [adapter]);

    const msg = await service.send(input());

    expect(send).toHaveBeenCalledWith({
      to: 'taller@mail.do',
      subject: 'Pago recibido',
      body: 'Recibiste RD$1,000.00',
    });
    expect(msg).toMatchObject({ status: 'sent', attempts: 1, last_error: null });
    expect(msg.provider_ref).toMatch(/^ref_/);
    expect(msg.sent_at).not.toBeNull();
  });

  it('idempotente: la misma dedupeKey no reenvía ni duplica la fila', async () => {
    const { adapter, send } = fakeEmail();
    const service = new MessagingService(prisma, [adapter]);
    const same = input();

    const first = await service.send(same);
    const second = await service.send(same);

    expect(second.id).toBe(first.id);
    expect(send).toHaveBeenCalledTimes(1);
    expect(await prisma.message.count({ where: { dedupe_key: same.dedupeKey } })).toBe(1);
  });

  it('si el canal falla: queda failed con el error, cuenta el intento y relanza', async () => {
    const data = input();
    const broken = new MessagingService(prisma, [fakeEmail('fail').adapter]);

    await expect(broken.send(data)).rejects.toThrow('SMTP caído');
    const failed = await prisma.message.findUniqueOrThrow({ where: { dedupe_key: data.dedupeKey } });
    expect(failed).toMatchObject({ status: 'failed', attempts: 1, last_error: 'SMTP caído' });

    // El reintento (BullMQ) reusa la fila y la completa.
    const healed = await new MessagingService(prisma, [fakeEmail().adapter]).send(data);
    expect(healed).toMatchObject({ id: failed.id, status: 'sent', attempts: 2, last_error: null });
  });

  it('reintento con otro contenido: envía el guardado la primera vez (no re-renderiza)', async () => {
    const data = input();
    await expect(new MessagingService(prisma, [fakeEmail('fail').adapter]).send(data)).rejects.toThrow();

    const { adapter, send } = fakeEmail();
    await new MessagingService(prisma, [adapter]).send({ ...data, body: 'otro texto' });
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ body: 'Recibiste RD$1,000.00' }));
  });

  it('concurrencia: dos envíos simultáneos con la misma clave dejan UNA fila', async () => {
    const service = new MessagingService(prisma, [fakeEmail().adapter]);
    const same = input();

    const [a, b] = await Promise.all([service.send(same), service.send(same)]);

    expect(a.id).toBe(b.id);
    expect(await prisma.message.count({ where: { dedupe_key: same.dedupeKey } })).toBe(1);
  });

  it('canal sin adaptador: lanza sin marcar el mensaje como enviado', async () => {
    const service = new MessagingService(prisma, [fakeEmail().adapter]);
    const data = input({ channel: 'whatsapp', recipient: '+18095551234' });

    await expect(service.send(data)).rejects.toThrow('Sin adaptador para el canal whatsapp');
    const row = await prisma.message.findUniqueOrThrow({ where: { dedupe_key: data.dedupeKey } });
    expect(row.status).toBe('queued');
  });
});
