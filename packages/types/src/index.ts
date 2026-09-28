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
export const ACTIVE_OUTBOX_TOPICS = [
  'PaymentCaptured',
  'CommissionAccrued',
  'PaymentRefunded',
  'ShopMemberInvited',
] as const;

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

// --- Shops (Día 4) ---

export const SHOP_TYPES = ['mechanic_shop', 'parts_seller'] as const;
export type ShopType = (typeof SHOP_TYPES)[number];

/** Rol de una cuenta DENTRO de un taller (distinto del rol global de la cuenta). */
export const SHOP_MEMBER_ROLES = ['owner', 'mechanic', 'advisor'] as const;
export type ShopMemberRole = (typeof SHOP_MEMBER_ROLES)[number];

/** Un taller visto por uno de sus miembros. */
export interface ShopView {
  id: string;
  name: string;
  type: ShopType;
  /** Comisión de la plataforma en basis points (800 = 8%). */
  commission_bps: number;
  /** Rol de quien consulta en este taller. */
  my_role: ShopMemberRole;
  created_at: string;
}

/** Roles que un owner puede asignar al invitar (owner no se invita). */
export const INVITABLE_SHOP_ROLES = ['mechanic', 'advisor'] as const;
export type InvitableShopRole = (typeof INVITABLE_SHOP_ROLES)[number];

/** Un miembro (o invitación pendiente) de un taller. */
export interface ShopMemberView {
  id: string;
  role: ShopMemberRole;
  status: 'invited' | 'active';
  /** null mientras la invitación no se vincula a una cuenta. */
  account_id: string | null;
  /** Email de la cuenta, o el invitado si aún no hay cuenta. */
  email: string | null;
  full_name: string | null;
  created_at: string;
}

/** Payload de `ShopMemberInvited`: hechos al momento de invitar. */
export interface ShopMemberInvitedPayload {
  memberId: string;
  shopId: string;
  shopName: string;
  email: string;
  role: InvitableShopRole;
  /** 'active' si ya tenía cuenta verificada (acceso inmediato), si no 'invited'. */
  status: 'invited' | 'active';
  invitedByName: string | null;
}

// --- VIN (Día 4) ---

/** Datos del vehículo según su VIN. */
export interface DecodedVehicleView {
  make: string;
  model: string | null;
  year: number | null;
  trim: string | null;
  /** Legible: `3.0L V6`, `1.8L 4 cil.` */
  engine: string | null;
  fuel_type: string | null;
  body_class: string | null;
  drive_type: string | null;
  transmission: string | null;
}

/** Resultado de `GET /v1/vin/:vin`. */
export interface VinDecodeView {
  /** VIN normalizado (mayúsculas, sin espacios ni guiones). */
  vin: string;
  /** Dígito verificador (posición 9). false no invalida: solo es un aviso. */
  check_digit_valid: boolean;
  found: boolean;
  /** De dónde salió: `cache` o el nombre del proveedor (`nhtsa`, `tecdoc`…). null si no se encontró. */
  source: string | null;
  /** El proveedor no respondió: se puede reintentar o cargar el vehículo a mano. */
  provider_unavailable: boolean;
  vehicle: DecodedVehicleView | null;
  /** Avisos en español para mostrar al mecánico. */
  warnings: string[];
}

// --- Clientes del taller (Día 4) ---

export interface CustomerView {
  id: string;
  full_name: string;
  /** E.164, p. ej. `+18095551234`. */
  phone: string | null;
  email: string | null;
  /** Cédula: 11 dígitos sin guiones. */
  document_id: string | null;
  /** Cuenta de la app vinculada, si el cliente se registró. */
  account_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Página de resultados con paginación por cursor. */
export interface Page<T> {
  items: T[];
  /** Pasar como `cursor` para la siguiente página; null si no hay más. */
  next_cursor: string | null;
}

// --- Vehículos del taller (Día 4) ---

export interface VehicleView {
  id: string;
  customer_id: string;
  /** VIN normalizado (17). */
  vin: string | null;
  /** Número de chasis (vehículos sin VIN, p. ej. importados de Japón). */
  chassis_number: string | null;
  /** Placa sin espacios ni guiones, p. ej. `A123456`. */
  plate: string | null;
  make: string;
  model: string | null;
  year: number | null;
  trim: string | null;
  engine: string | null;
  fuel_type: string | null;
  color: string | null;
  mileage_km: number | null;
  /** De dónde salieron los datos técnicos. */
  data_source: 'vin_decode' | 'manual';
  notes: string | null;
  created_at: string;
  updated_at: string;
}
