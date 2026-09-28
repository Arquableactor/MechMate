import type { Prisma } from '@prisma/client';
import type { OutboxTopic } from '@repo/types';

export interface OutboxEventToRecord {
  topic: OutboxTopic;
  payload: Prisma.InputJsonValue;
}

/**
 * Escribe eventos de dominio en `outbox` usando la tx del llamador: el evento
 * se guarda SOLO si el cambio de estado se confirma (outbox transaccional,
 * CLAUDE.md #4). El OutboxRelay los publica después.
 */
export async function recordOutboxEvents(
  tx: Prisma.TransactionClient,
  events: OutboxEventToRecord[],
): Promise<void> {
  if (events.length === 0) return;
  await tx.outboxEvent.createMany({
    data: events.map((e) => ({ topic: e.topic, payload: e.payload })),
  });
}
