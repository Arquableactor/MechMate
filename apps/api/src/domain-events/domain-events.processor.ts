import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ACTIVE_OUTBOX_TOPICS, type OutboxTopic, RESERVED_OUTBOX_TOPICS } from '@repo/types';
import * as Sentry from '@sentry/nestjs';
import { type Job, UnrecoverableError } from 'bullmq';
import type { DomainEventJob } from '../outbox/outbox-relay.service';
import { DOMAIN_EVENTS_QUEUE } from '../queue/queue.constants';
import { DomainEventsRegistry } from './domain-events.registry';

const ACTIVE = new Set<string>(ACTIVE_OUTBOX_TOPICS);
const RESERVED = new Set<string>(RESERVED_OUTBOX_TOPICS);

/**
 * Consumidor de la cola `domain-events`: reparte cada evento a sus suscriptores.
 * - Si un suscriptor lanza, el job falla y BullMQ lo reintenta con backoff
 *   (DOMAIN_EVENTS_JOB_OPTIONS); agotados los intentos queda en `failed`.
 * - Tópicos de courier (Fase 3): reservados, se descartan sin fallar.
 * - Tópico desconocido: UnrecoverableError → directo a `failed`, sin reintentos
 *   (reintentar no lo va a arreglar).
 */
@Processor(DOMAIN_EVENTS_QUEUE)
export class DomainEventsProcessor extends WorkerHost {
  private readonly logger = new Logger(DomainEventsProcessor.name);

  constructor(private readonly registry: DomainEventsRegistry) {
    super();
  }

  async process(job: Job<DomainEventJob>): Promise<void> {
    const event = job.data;

    if (RESERVED.has(event.topic)) {
      this.logger.log(`Evento reservado (Fase 3, sin lógica): ${event.topic} ${event.id}`);
      return;
    }
    if (!ACTIVE.has(event.topic)) {
      throw new UnrecoverableError(`Tópico desconocido: ${String(event.topic)}`);
    }

    const handlers = this.registry.handlersFor(event.topic as OutboxTopic);
    if (handlers.length === 0) {
      this.logger.debug(`Sin suscriptores para ${event.topic} ${event.id}`);
      return;
    }
    for (const handler of handlers) {
      await handler(event);
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<DomainEventJob> | undefined, error: Error): void {
    if (!job) return;
    const max = job.opts.attempts ?? 1;
    const final = job.attemptsMade >= max || error instanceof UnrecoverableError;
    const where = `${job.data.topic} ${job.data.id} (intento ${job.attemptsMade}/${max})`;
    if (final) {
      this.logger.error(`Evento a dead-letter: ${where}: ${error.message}`);
      // Un evento en dead-letter pide intervención humana: va a Sentry.
      Sentry.captureException(error, {
        tags: { topic: job.data.topic, queue: DOMAIN_EVENTS_QUEUE },
        extra: { eventId: job.data.id, attemptsMade: job.attemptsMade },
      });
    } else {
      this.logger.warn(`Evento falló, se reintenta: ${where}: ${error.message}`);
    }
  }
}
