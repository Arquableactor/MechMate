import { type Job, UnrecoverableError } from 'bullmq';
import type { DomainEventJob } from '../outbox/outbox-relay.service';
import { DOMAIN_EVENTS_JOB_OPTIONS } from '../queue/queue.constants';
import { DomainEventsModule } from './domain-events.module';
import { DomainEventsProcessor } from './domain-events.processor';
import { DomainEventsRegistry } from './domain-events.registry';

const event = (topic: string, id = 'evt-1'): DomainEventJob =>
  ({
    id,
    topic,
    payload: { paymentId: 'pay-1' },
    occurredAt: '2026-09-28T12:00:00.000Z',
  }) as DomainEventJob;

const jobOf = (data: DomainEventJob, attemptsMade = 0) =>
  ({ data, attemptsMade, opts: { attempts: 5 } }) as unknown as Job<DomainEventJob>;

describe('DomainEventsProcessor.process', () => {
  let registry: DomainEventsRegistry;
  let processor: DomainEventsProcessor;

  beforeEach(() => {
    registry = new DomainEventsRegistry();
    processor = new DomainEventsProcessor(registry);
  });

  it('entrega el evento a todos sus suscriptores, en orden', async () => {
    const calls: string[] = [];
    registry.on('PaymentCaptured', async (e) => void calls.push(`a:${e.id}`));
    registry.on('PaymentCaptured', async (e) => void calls.push(`b:${e.id}`));
    registry.on('PaymentRefunded', async () => void calls.push('otro-topic'));

    await processor.process(jobOf(event('PaymentCaptured')));

    expect(calls).toEqual(['a:evt-1', 'b:evt-1']);
  });

  it('sin suscriptores completa sin error (el evento no se pierde ni reintenta)', async () => {
    await expect(processor.process(jobOf(event('CommissionAccrued')))).resolves.toBeUndefined();
  });

  it('si un suscriptor falla, propaga el error para que BullMQ reintente', async () => {
    registry.on('PaymentCaptured', async () => {
      throw new Error('SMTP caído');
    });
    await expect(processor.process(jobOf(event('PaymentCaptured')))).rejects.toThrow('SMTP caído');
  });

  it.each(['DeliveryRequested', 'CourierAssigned', 'DeliveryInTransit', 'DeliveryCompleted'])(
    'tópico reservado de courier (%s): se descarta sin llamar suscriptores ni fallar',
    async (topic) => {
      const handler = jest.fn();
      registry.on(topic as never, handler);
      await expect(processor.process(jobOf(event(topic)))).resolves.toBeUndefined();
      expect(handler).not.toHaveBeenCalled();
    },
  );

  it('tópico desconocido: UnrecoverableError (a dead-letter sin reintentos)', async () => {
    await expect(processor.process(jobOf(event('Inventado')))).rejects.toBeInstanceOf(
      UnrecoverableError,
    );
  });
});

describe('DomainEventsProcessor.onFailed', () => {
  const processor = new DomainEventsProcessor(new DomainEventsRegistry());
  const logger = (processor as unknown as { logger: { warn: jest.Mock; error: jest.Mock } }).logger;

  beforeEach(() => {
    logger.warn = jest.fn();
    logger.error = jest.fn();
  });

  it('intento intermedio: warning (se reintenta)', () => {
    processor.onFailed(jobOf(event('PaymentCaptured'), 2), new Error('x'));
    expect(logger.warn).toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('último intento o error irrecuperable: error (dead-letter)', () => {
    processor.onFailed(jobOf(event('PaymentCaptured'), 5), new Error('x'));
    processor.onFailed(jobOf(event('Inventado'), 1), new UnrecoverableError('y'));
    expect(logger.error).toHaveBeenCalledTimes(2);
  });
});

describe('DomainEventsModule.forRoot', () => {
  it('sin Redis expone el registro pero NO registra el worker', () => {
    const mod = DomainEventsModule.forRoot({});
    expect(mod.providers).toEqual([DomainEventsRegistry]);
    expect(mod.exports).toEqual([DomainEventsRegistry]);
  });

  it('con Redis registra también el worker', () => {
    const mod = DomainEventsModule.forRoot({ REDIS_URL: 'redis://localhost:6379' });
    expect(mod.providers).toEqual([DomainEventsRegistry, DomainEventsProcessor]);
  });
});

describe('DOMAIN_EVENTS_JOB_OPTIONS', () => {
  it('5 intentos con backoff exponencial y retención de fallidos (dead-letter)', () => {
    expect(DOMAIN_EVENTS_JOB_OPTIONS).toMatchObject({
      attempts: 5,
      backoff: { type: 'exponential', delay: 2_000 },
      removeOnFail: { age: 7 * 24 * 3600 },
    });
  });
});
