import { BullModule } from '@nestjs/bullmq';
import { type DynamicModule, Logger, Module } from '@nestjs/common';
import { DOMAIN_EVENTS_QUEUE } from './queue.constants';
import { QueueHealthService } from './queue-health.service';

/**
 * Resuelve `REDIS_URL`. Fail-closed en producción (sin Redis los eventos del
 * outbox se acumularían sin publicarse, en silencio). En dev/test devuelve
 * `null` y las colas quedan deshabilitadas, para poder arrancar sin Redis.
 */
export function resolveRedisUrl(env: NodeJS.ProcessEnv): string | null {
  const url = env.REDIS_URL?.trim();
  if (url) return url;
  if (env.NODE_ENV === 'production') {
    throw new Error('REDIS_URL es obligatorio en producción');
  }
  new Logger('QueueModule').warn(
    'REDIS_URL no definido; colas deshabilitadas (el outbox no se publicará)',
  );
  return null;
}

/**
 * Conexión a Redis + registro de colas BullMQ. Global: el relay del outbox y
 * los consumidores inyectan la cola con `@InjectQueue(DOMAIN_EVENTS_QUEUE)`.
 * Lee `process.env` al definirse, así que main.ts debe cargar el entorno antes
 * (lo hace `./config/load-env`).
 */
@Module({})
export class QueueModule {
  static forRoot(env: NodeJS.ProcessEnv = process.env): DynamicModule {
    const url = resolveRedisUrl(env);
    const bull = url
      ? [BullModule.forRoot({ connection: { url } }), BullModule.registerQueue({ name: DOMAIN_EVENTS_QUEUE })]
      : [];

    return {
      module: QueueModule,
      global: true,
      imports: bull,
      providers: [QueueHealthService],
      exports: url ? [BullModule, QueueHealthService] : [QueueHealthService],
    };
  }
}
