import { Injectable, Logger } from '@nestjs/common';
import type { HealthStatus } from '@repo/types';
import { PrismaService } from '../prisma/prisma.service';
import { QueueHealthService } from '../queue/queue-health.service';

/** Construye el `HealthStatus` y comprueba la conectividad a Postgres y Redis. */
@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly queueHealth: QueueHealthService,
  ) {}

  /** `SELECT 1` contra la DB; nunca lanza, devuelve 'up' | 'down'. */
  async checkDb(): Promise<HealthStatus['db']> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'up';
    } catch (error) {
      this.logger.warn(
        `Health DB check falló: ${error instanceof Error ? error.message : String(error)}`,
      );
      return 'down';
    }
  }

  async getStatus(): Promise<HealthStatus> {
    const [db, redis] = await Promise.all([this.checkDb(), this.queueHealth.check()]);
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      db,
      redis,
    };
  }
}
