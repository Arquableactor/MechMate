import { getQueueToken } from '@nestjs/bullmq';
import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OutboxTopic } from '@repo/types';
import type { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { DOMAIN_EVENTS_QUEUE } from '../queue/queue.constants';

/** Dato de cada job de la cola `domain-events` (lo consume el processor, T3). */
export interface DomainEventJob {
  /** id de la fila de outbox; también es el jobId (dedupe en BullMQ). */
  id: string;
  topic: OutboxTopic;
  payload: unknown;
  /** Cuándo ocurrió el hecho (created_at del outbox), ISO-8601. */
  occurredAt: string;
}

interface OutboxRow {
  id: string;
  topic: OutboxTopic;
  payload: unknown;
  created_at: Date;
}

export const OUTBOX_BATCH_SIZE = 100;
const DEFAULT_POLL_MS = 5_000;
/** Con Redis caído ioredis encola y el await no vuelve: cortamos para liberar los locks. */
const ENQUEUE_TIMEOUT_MS = 5_000;

/**
 * Relay del outbox transaccional: publica en BullMQ los eventos que el dominio
 * escribió en `outbox` (misma tx que el cambio de estado).
 *
 * Garantía: at-least-once, sin pérdida.
 * - `FOR UPDATE SKIP LOCKED`: varias instancias no toman la misma fila.
 * - Encolar y marcar `published_at` van en la MISMA tx de DB: si encolar falla,
 *   rollback y el evento se reintenta en el siguiente ciclo.
 * - `jobId = outbox.id`: si el commit falla después de encolar, el re-encolado
 *   no duplica el job. Aun así los consumidores deben ser idempotentes.
 */
@Injectable()
export class OutboxRelayService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(OutboxRelayService.name);
  private readonly pollMs: number;
  private readonly enabled: boolean;
  private timer: NodeJS.Timeout | undefined;
  private running: Promise<void> | undefined;
  private stopped = false;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
    // Ausente sin REDIS_URL (colas deshabilitadas en dev/test).
    @Optional() @Inject(getQueueToken(DOMAIN_EVENTS_QUEUE)) private readonly queue?: Queue,
  ) {
    const poll = Number(config.get<string>('OUTBOX_POLL_MS') ?? DEFAULT_POLL_MS);
    this.pollMs = Number.isFinite(poll) && poll >= 500 ? poll : DEFAULT_POLL_MS;
    this.enabled = config.get<string>('OUTBOX_RELAY_ENABLED') !== 'false';
  }

  onApplicationBootstrap(): void {
    if (!this.queue) {
      this.logger.warn('Sin cola (REDIS_URL no definido): el relay del outbox NO corre');
      return;
    }
    if (!this.enabled) {
      this.logger.log('OUTBOX_RELAY_ENABLED=false: el relay del outbox NO corre en esta instancia');
      return;
    }
    this.logger.log(`Relay del outbox activo (cada ${this.pollMs} ms)`);
    this.schedule(0);
  }

  async onModuleDestroy(): Promise<void> {
    this.stopped = true;
    clearTimeout(this.timer);
    await this.running;
  }

  /**
   * Publica un lote de eventos pendientes. Devuelve cuántos publicó (0 si no
   * había). Lanza si no pudo encolar; en ese caso no marca nada.
   */
  async relayBatch(limit = OUTBOX_BATCH_SIZE): Promise<number> {
    const queue = this.queue;
    if (!queue) return 0;

    return this.prisma.$transaction(
      async (tx) => {
        const rows = await tx.$queryRaw<OutboxRow[]>`
          SELECT id, topic, payload, created_at
          FROM outbox
          WHERE published_at IS NULL
          ORDER BY created_at, id
          LIMIT ${limit}
          FOR UPDATE SKIP LOCKED`;
        if (rows.length === 0) return 0;

        await withTimeout(
          queue.addBulk(
            rows.map((r) => ({
              name: r.topic,
              data: {
                id: r.id,
                topic: r.topic,
                payload: r.payload,
                occurredAt: r.created_at.toISOString(),
              } satisfies DomainEventJob,
              opts: { jobId: r.id },
            })),
          ),
          ENQUEUE_TIMEOUT_MS,
          'encolar en BullMQ',
        );

        const ids = rows.map((r) => r.id);
        await tx.$executeRaw`
          UPDATE outbox SET published_at = now(), updated_at = now()
          WHERE id = ANY(${ids}::uuid[])`;
        return rows.length;
      },
      { maxWait: 5_000, timeout: 15_000 },
    );
  }

  private schedule(delayMs: number): void {
    if (this.stopped) return;
    this.timer = setTimeout(() => {
      this.running = this.tick().finally(() => {
        this.running = undefined;
        this.schedule(this.pollMs);
      });
    }, delayMs);
  }

  /** Vacía lo pendiente: si un lote vino lleno, sigue sin esperar el intervalo. */
  private async tick(): Promise<void> {
    try {
      let published: number;
      do {
        published = await this.relayBatch();
        if (published > 0) this.logger.debug(`Outbox: ${published} evento(s) publicados`);
      } while (published === OUTBOX_BATCH_SIZE && !this.stopped);
    } catch (error) {
      this.logger.warn(
        `Relay del outbox falló; se reintenta en ${this.pollMs} ms: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number, what: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Timeout (${ms} ms) al ${what}`)), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
