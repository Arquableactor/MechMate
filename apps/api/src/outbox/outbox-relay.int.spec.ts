import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import type { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { type DomainEventJob, OutboxRelayService } from './outbox-relay.service';

/**
 * Relay del outbox contra Postgres REAL: prueba `FOR UPDATE SKIP LOCKED` y el
 * rollback en la DB, no en mocks. La cola es un fake en memoria (sin Redis).
 * Otros archivos de test escriben en outbox en paralelo: las aserciones se
 * escopan a las filas de ESTE test (marcadas con `runId`).
 */
let prisma: PrismaService;
const config = new ConfigService({});

beforeAll(async () => {
  prisma = new PrismaService();
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

type Job = { name: string; data: DomainEventJob; opts: { jobId: string } };

/** Cola fake: registra los jobs; `delayMs` mantiene la tx abierta (locks tomados). */
function fakeQueue(sink: Job[], delayMs = 0, fail = false): Queue {
  return {
    addBulk: async (jobs: Job[]) => {
      await new Promise((r) => setTimeout(r, delayMs));
      if (fail) throw new Error('redis caído');
      sink.push(...jobs);
      return jobs;
    },
  } as unknown as Queue;
}

async function insertEvents(n: number) {
  const runId = randomUUID();
  await prisma.outboxEvent.createMany({
    data: Array.from({ length: n }, (_, i) => ({
      topic: 'PaymentCaptured',
      payload: { runId, i },
    })),
  });
  const rows = await prisma.outboxEvent.findMany({
    where: { payload: { path: ['runId'], equals: runId } },
  });
  return rows.map((r) => r.id);
}

async function drain(relay: OutboxRelayService) {
  while ((await relay.relayBatch()) > 0);
}

describe('OutboxRelay (integración, Postgres real)', () => {
  it('dos relays concurrentes no publican el mismo evento dos veces (SKIP LOCKED)', async () => {
    await drain(new OutboxRelayService(prisma, config, fakeQueue([])));
    const ids = await insertEvents(6);
    const sinkA: Job[] = [];
    const sinkB: Job[] = [];
    // Lotes de 3 + 300 ms dentro de la tx: B corre mientras A tiene los locks.
    const a = new OutboxRelayService(prisma, config, fakeQueue(sinkA, 300));
    const b = new OutboxRelayService(prisma, config, fakeQueue(sinkB, 300));

    await Promise.all([
      (async () => {
        while ((await a.relayBatch(3)) > 0);
      })(),
      (async () => {
        while ((await b.relayBatch(3)) > 0);
      })(),
    ]);

    // Hubo concurrencia real: los dos relays publicaron algo.
    expect(sinkA.length).toBeGreaterThan(0);
    expect(sinkB.length).toBeGreaterThan(0);

    const mine = [...sinkA, ...sinkB].map((j) => j.opts.jobId).filter((id) => ids.includes(id));
    expect([...mine].sort()).toEqual([...ids].sort()); // cada uno exactamente una vez

    const rows = await prisma.outboxEvent.findMany({ where: { id: { in: ids } } });
    for (const r of rows) {
      expect(r.published_at).not.toBeNull();
      expect(r.updated_at.getTime()).toBeGreaterThanOrEqual(r.created_at.getTime());
    }
  });

  it('si encolar falla, hace rollback: los eventos quedan pendientes y se publican después', async () => {
    await drain(new OutboxRelayService(prisma, config, fakeQueue([])));
    const [id] = await insertEvents(1);

    const broken = new OutboxRelayService(prisma, config, fakeQueue([], 0, true));
    await expect(broken.relayBatch()).rejects.toThrow('redis caído');
    expect((await prisma.outboxEvent.findUniqueOrThrow({ where: { id } })).published_at).toBeNull();

    const sink: Job[] = [];
    await drain(new OutboxRelayService(prisma, config, fakeQueue(sink)));
    expect(sink.map((j) => j.opts.jobId)).toContain(id);
    expect((await prisma.outboxEvent.findUniqueOrThrow({ where: { id } })).published_at).not.toBeNull();
  });
});
