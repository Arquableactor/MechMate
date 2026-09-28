import { getQueueToken } from '@nestjs/bullmq';
import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import type { HealthStatus } from '@repo/types';
import type { Queue } from 'bullmq';
import { DOMAIN_EVENTS_QUEUE } from './queue.constants';

/** Tiempo máximo del ping: con Redis caído ioredis encola y el await no vuelve. */
const PING_TIMEOUT_MS = 1_000;

@Injectable()
export class QueueHealthService {
  private readonly logger = new Logger(QueueHealthService.name);

  constructor(
    // Ausente cuando REDIS_URL no está definido (colas deshabilitadas en dev).
    @Optional() @Inject(getQueueToken(DOMAIN_EVENTS_QUEUE)) private readonly queue?: Queue,
  ) {}

  /** Nunca lanza: 'up' | 'down' | 'disabled'. */
  async check(): Promise<HealthStatus['redis']> {
    if (!this.queue) return 'disabled';
    let timer: NodeJS.Timeout | undefined;
    try {
      await Promise.race([
        this.queue.getVersion(),
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error('timeout')), PING_TIMEOUT_MS);
        }),
      ]);
      return 'up';
    } catch (error) {
      this.logger.warn(
        `Health Redis check falló: ${error instanceof Error ? error.message : String(error)}`,
      );
      return 'down';
    } finally {
      clearTimeout(timer);
    }
  }
}
