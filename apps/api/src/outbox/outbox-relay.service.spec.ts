import { ConfigService } from '@nestjs/config';
import type { Queue } from 'bullmq';
import type { PrismaService } from '../prisma/prisma.service';
import { OutboxRelayService } from './outbox-relay.service';

const row = (id: string, topic = 'PaymentCaptured') => ({
  id,
  topic,
  payload: { paymentId: `pay-${id}` },
  created_at: new Date('2026-09-28T12:00:00.000Z'),
});

function build(rows: ReturnType<typeof row>[], addBulk?: jest.Mock) {
  const tx = {
    $queryRaw: jest.fn().mockResolvedValue(rows),
    $executeRaw: jest.fn().mockResolvedValue(rows.length),
  };
  const prisma = {
    $transaction: jest.fn((fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
  } as unknown as PrismaService;
  const queue = addBulk ? ({ addBulk } as unknown as Queue) : undefined;
  const relay = new OutboxRelayService(prisma, new ConfigService({}), queue);
  return { relay, tx, prisma };
}

describe('OutboxRelayService.relayBatch', () => {
  it('sin cola (REDIS_URL ausente) no toca la DB', async () => {
    const { relay, prisma } = build([row('a')]);
    await expect(relay.relayBatch()).resolves.toBe(0);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('sin pendientes no encola ni marca nada', async () => {
    const addBulk = jest.fn();
    const { relay, tx } = build([], addBulk);
    await expect(relay.relayBatch()).resolves.toBe(0);
    expect(addBulk).not.toHaveBeenCalled();
    expect(tx.$executeRaw).not.toHaveBeenCalled();
  });

  it('encola cada fila con jobId = outbox.id y luego las marca publicadas', async () => {
    const addBulk = jest.fn().mockResolvedValue([]);
    const { relay, tx } = build([row('a'), row('b', 'CommissionAccrued')], addBulk);

    await expect(relay.relayBatch()).resolves.toBe(2);

    expect(addBulk).toHaveBeenCalledWith([
      {
        name: 'PaymentCaptured',
        data: {
          id: 'a',
          topic: 'PaymentCaptured',
          payload: { paymentId: 'pay-a' },
          occurredAt: '2026-09-28T12:00:00.000Z',
        },
        opts: { jobId: 'a' },
      },
      expect.objectContaining({ name: 'CommissionAccrued', opts: { jobId: 'b' } }),
    ]);
    expect(tx.$executeRaw).toHaveBeenCalledTimes(1);
    expect(addBulk.mock.invocationCallOrder[0]).toBeLessThan(
      tx.$executeRaw.mock.invocationCallOrder[0],
    );
  });

  it('si encolar falla, lanza y NO marca (rollback → se reintenta)', async () => {
    const addBulk = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    const { relay, tx } = build([row('a')], addBulk);

    await expect(relay.relayBatch()).rejects.toThrow('ECONNREFUSED');
    expect(tx.$executeRaw).not.toHaveBeenCalled();
  });

  it('si Redis no responde, corta por timeout y NO marca (libera los locks)', async () => {
    jest.useFakeTimers();
    try {
      const addBulk = jest.fn(() => new Promise(() => {}));
      const { relay, tx } = build([row('a')], addBulk);

      const result = relay.relayBatch();
      const assertion = expect(result).rejects.toThrow(/Timeout/);
      await jest.advanceTimersByTimeAsync(5_000);
      await assertion;
      expect(tx.$executeRaw).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('OutboxRelayService (ciclo de vida)', () => {
  afterEach(() => jest.useRealTimers());

  it('no arranca el ciclo si no hay cola', () => {
    jest.useFakeTimers();
    const { relay } = build([]);
    relay.onApplicationBootstrap();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('no arranca el ciclo con OUTBOX_RELAY_ENABLED=false', () => {
    jest.useFakeTimers();
    const prisma = { $transaction: jest.fn() } as unknown as PrismaService;
    const relay = new OutboxRelayService(
      prisma,
      new ConfigService({ OUTBOX_RELAY_ENABLED: 'false' }),
      { addBulk: jest.fn() } as unknown as Queue,
    );
    relay.onApplicationBootstrap();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('con cola arranca el ciclo y onModuleDestroy lo detiene', async () => {
    jest.useFakeTimers();
    const { relay, prisma } = build([], jest.fn());
    relay.onApplicationBootstrap();
    await jest.advanceTimersByTimeAsync(0);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);

    await relay.onModuleDestroy();
    await jest.advanceTimersByTimeAsync(60_000);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
