import { randomBytes } from 'node:crypto';

/**
 * UUID v7 (RFC 9562): 48 bits de timestamp en ms + versión 7 + variante + 74
 * bits aleatorios. Ordenable por tiempo, como las PK que genera Prisma
 * (`uuid(7)`) y Postgres (`uuidv7()`). Para cuando el id se necesita ANTES
 * del INSERT (p. ej. va dentro de la clave de un archivo en R2).
 */
export function uuid7(now: number = Date.now()): string {
  const bytes = randomBytes(16);
  const ts = BigInt(now);
  for (let i = 0; i < 6; i++) bytes[i] = Number((ts >> BigInt(8 * (5 - i))) & 0xffn);
  bytes[6] = (bytes[6] & 0x0f) | 0x70; // versión 7
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variante RFC 4122/9562
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
