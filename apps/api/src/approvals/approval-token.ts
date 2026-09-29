import { createHmac, timingSafeEqual } from 'node:crypto';
import { isUUID } from 'class-validator';

/**
 * Token del enlace de aprobación: `<id>.<firma>`, con firma =
 * base64url(HMAC-SHA256(secreto, id)). No se guarda en ningún lado: se
 * recalcula con el secreto del servidor. Con la base filtrada NO se puede
 * fabricar un enlace (falta el secreto). Vencimiento/revocación: en la DB.
 */
export function signApprovalToken(approvalId: string, secret: string): string {
  return `${approvalId}.${hmac(approvalId, secret)}`;
}

/** Devuelve el id si la firma es válida, o null. Comparación en tiempo constante. */
export function verifyApprovalToken(token: string, secret: string): string | null {
  const dot = token.indexOf('.');
  if (dot <= 0 || token.length > 200) return null;
  const id = token.slice(0, dot);
  const given = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(hmac(id, secret));
  if (!isUUID(id) || given.length !== expected.length) return null;
  return timingSafeEqual(given, expected) ? id : null;
}

function hmac(id: string, secret: string): string {
  return createHmac('sha256', secret).update(`work-order-approval:${id}`).digest('base64url');
}
