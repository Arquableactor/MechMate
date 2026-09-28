import { type DynamicModule, Module } from '@nestjs/common';
import { hasRedis } from '../queue/queue.constants';
import { DomainEventsProcessor } from './domain-events.processor';
import { DomainEventsRegistry } from './domain-events.registry';

/**
 * Consumo de eventos de dominio. El registro siempre existe (los módulos se
 * suscriben aunque no haya Redis); el processor (worker BullMQ) solo se
 * registra con REDIS_URL: sin conexión raíz, BullMQ no puede crear el worker.
 */
@Module({})
export class DomainEventsModule {
  static forRoot(env: NodeJS.ProcessEnv = process.env): DynamicModule {
    return {
      module: DomainEventsModule,
      global: true,
      providers: [DomainEventsRegistry, ...(hasRedis(env) ? [DomainEventsProcessor] : [])],
      exports: [DomainEventsRegistry],
    };
  }
}
