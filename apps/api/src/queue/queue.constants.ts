import type { DefaultJobOptions } from 'bullmq';

/** Cola donde el relay del outbox publica los eventos de dominio. */
export const DOMAIN_EVENTS_QUEUE = 'domain-events';

/**
 * Política de los jobs de `domain-events` (el relay solo fija el jobId):
 * 5 intentos con backoff exponencial (2s, 4s, 8s, 16s). Los que agotan intentos
 * quedan en el set `failed` de BullMQ (nuestra dead-letter) 7 días.
 * OJO: al limpiar un job completado su jobId se libera; la deduplicación del
 * relay cubre la ventana corta de reintento, no para siempre → handlers idempotentes.
 */
export const DOMAIN_EVENTS_JOB_OPTIONS: DefaultJobOptions = {
  attempts: 5,
  backoff: { type: 'exponential', delay: 2_000 },
  removeOnComplete: { age: 24 * 3600, count: 1_000 },
  removeOnFail: { age: 7 * 24 * 3600 },
};

/** ¿Hay Redis configurado? (sin él, colas y consumidores quedan deshabilitados). */
export function hasRedis(env: NodeJS.ProcessEnv): boolean {
  return Boolean(env.REDIS_URL?.trim());
}
