import { Injectable } from '@nestjs/common';
import type { OutboxTopic } from '@repo/types';
import type { DomainEventJob } from '../outbox/outbox-relay.service';

/**
 * Suscriptor de un evento de dominio. DEBE ser idempotente: la entrega es
 * at-least-once y, si otro suscriptor del mismo evento falla, el job se
 * reintenta completo (este se vuelve a llamar).
 */
export type DomainEventHandler = (event: DomainEventJob) => Promise<void>;

/**
 * Registro topic → suscriptores. Los módulos que reaccionan a eventos (p. ej.
 * mensajería) se suscriben en su `onModuleInit` con `registry.on(...)`, sin
 * acoplarse a BullMQ.
 */
@Injectable()
export class DomainEventsRegistry {
  private readonly handlers = new Map<OutboxTopic, DomainEventHandler[]>();

  on(topic: OutboxTopic, handler: DomainEventHandler): void {
    this.handlers.set(topic, [...this.handlersFor(topic), handler]);
  }

  handlersFor(topic: OutboxTopic): readonly DomainEventHandler[] {
    return this.handlers.get(topic) ?? [];
  }
}
