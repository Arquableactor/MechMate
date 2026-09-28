/**
 * Tipos compartidos del workspace TypeScript (api + web).
 *
 * Por ahora solo expone `HealthStatus`, que tipa el endpoint `GET /v1/health`
 * y valida que el monorepo comparte tipos entre paquetes.
 */

/** Estado del servicio devuelto por `GET /v1/health`. */
export interface HealthStatus {
  /** Siempre 'ok' mientras el proceso responde (la DB se reporta aparte en `db`). */
  status: 'ok';
  /** Segundos que lleva el proceso vivo (`process.uptime()`). */
  uptime: number;
  /** Instante de la respuesta en ISO-8601. */
  timestamp: string;
  /** Resultado del `SELECT 1` contra Postgres. */
  db: 'up' | 'down';
  /** Ping a Redis (colas BullMQ). 'disabled' = sin REDIS_URL (solo dev/test). */
  redis: 'up' | 'down' | 'disabled';
}

// --- Identity (Día 2) ---

/** Conjunto canónico de roles de dominio (viven en la DB, no en Auth0). */
export type Role = 'mechanic' | 'seller' | 'customer' | 'courier' | 'admin';

/** Roles que una cuenta puede auto-asignarse vía API (`courier`/`admin` no). */
export type AssignableRole = 'mechanic' | 'seller' | 'customer';

/** Lista de roles auto-asignables; fuente de verdad para la validación del DTO. */
export const ASSIGNABLE_ROLES: readonly AssignableRole[] = ['mechanic', 'seller', 'customer'];

/** Perfil + roles devuelto por `GET /v1/me`. */
export interface MeResponse {
  id: string;
  auth0_sub: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  status: string;
  kyc_status: string;
  roles: Role[];
  created_at: string;
}

// --- Payments + Ledger (Día 3) ---

/**
 * Dinero en **centavos como string decimal** (sin separadores, sin signo salvo
 * reversas). En el wire es string para no perder precisión: el cliente debe
 * `BigInt(str)` / `int.parse`, **nunca** `Number(str)`.
 */
export type Cents = string;

export type PaymentStatus = 'requires_action' | 'captured' | 'failed' | 'refunded';

/** Vista pública de un pago (montos como string). */
export interface PaymentView {
  id: string;
  order_id: string | null;
  provider: 'cardnet';
  status: PaymentStatus;
  amount_cents: Cents;
  currency: string;
  created_at: string;
}

/** Tópicos de eventos de dominio con lógica en esta fase. */
export const ACTIVE_OUTBOX_TOPICS = ['PaymentCaptured', 'CommissionAccrued', 'PaymentRefunded'] as const;

/** Reservados para Fase 3 (courier) — solo el contrato, sin lógica. */
export const RESERVED_OUTBOX_TOPICS = [
  'DeliveryRequested',
  'CourierAssigned',
  'DeliveryInTransit',
  'DeliveryCompleted',
] as const;

/** Payload de `PaymentCaptured`. Montos en centavos como string (BigInt). */
export interface PaymentCapturedPayload {
  paymentId: string;
  amount_cents: Cents;
  commission_cents: Cents;
  net_cents: Cents;
  currency: string;
  shopId: string;
  buyerAccountId: string;
  orderId: string | null;
}

/** Payload de `PaymentRefunded` (reversa total de la captura). */
export interface PaymentRefundedPayload {
  paymentId: string;
  amount_cents: Cents;
  currency: string;
  shopId: string;
  buyerAccountId: string;
}

/** Tópicos de eventos de dominio escritos al outbox. */
export type OutboxTopic =
  | (typeof ACTIVE_OUTBOX_TOPICS)[number]
  | (typeof RESERVED_OUTBOX_TOPICS)[number];
