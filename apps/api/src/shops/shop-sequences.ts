import type { Prisma } from '@prisma/client';

/**
 * Siguiente valor del contador `name` del taller (1, 2, 3…), en la tx del
 * llamador. Un solo `INSERT … ON CONFLICT DO UPDATE … RETURNING`: atómico bajo
 * concurrencia (la fila queda bloqueada hasta el COMMIT, así que no hay
 * duplicados) y sin huecos (si la tx hace rollback, el incremento también).
 */
export async function nextShopSequence(
  tx: Prisma.TransactionClient,
  shopId: string,
  name: string,
): Promise<number> {
  const rows = await tx.$queryRaw<{ value: number }[]>`
    INSERT INTO shop_sequences (id, shop_id, name, value, updated_at)
    VALUES (uuidv7(), ${shopId}::uuid, ${name}, 1, now())
    ON CONFLICT (shop_id, name)
    DO UPDATE SET value = shop_sequences.value + 1, updated_at = now()
    RETURNING value`;
  return rows[0].value;
}
