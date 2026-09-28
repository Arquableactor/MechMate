import type { MessageChannel } from '@prisma/client';

/** Lo que un canal necesita para entregar un mensaje ya renderizado. */
export interface OutgoingMessage {
  /** Email, token de push o teléfono E.164, según el canal. */
  to: string;
  subject?: string | null;
  body: string;
}

export interface ChannelSendResult {
  /** Id del proveedor (p. ej. id de Resend); `mock_...` en los simulados. */
  providerRef: string;
}

/**
 * Costura hacia los proveedores externos (igual que `PaymentProvider`): cambiar
 * de proveedor de email/push/WhatsApp no toca el dominio. Debe lanzar si no pudo
 * entregar; el servicio registra el fallo y BullMQ reintenta.
 */
export interface MessageChannelAdapter {
  readonly channel: MessageChannel;
  /** Nombre del proveedor para logs (mock, resend, fcm, whatsapp-stub…). */
  readonly provider: string;
  send(message: OutgoingMessage): Promise<ChannelSendResult>;
}

/** Token DI: el arreglo de adaptadores activos (uno por canal). */
export const MESSAGE_CHANNELS = Symbol('MESSAGE_CHANNELS');

/** Oculta PII en logs: `jperez@gmail.com` → `jp***@gmail.com`, `+18095551234` → `***1234`. */
export function maskRecipient(to: string): string {
  const at = to.indexOf('@');
  if (at > 0) return `${to.slice(0, Math.min(2, at))}***${to.slice(at)}`;
  return to.length > 4 ? `***${to.slice(-4)}` : '***';
}
