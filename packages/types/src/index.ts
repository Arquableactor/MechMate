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
  'WorkOrderStatusChanged',
  'WorkOrderApprovalRequested',
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

// --- Órdenes de trabajo (Día 5) ---

export const WORK_ORDER_STATUSES = [
  'draft',
  'awaiting_approval',
  'approved',
  'in_progress',
  'completed',
  'invoiced',
  'paid',
  'cancelled',
] as const;
export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number];

/** Resumen del cliente para listas (sin pedirlo aparte). */
export interface CustomerSummary {
  id: string;
  full_name: string;
  phone: string | null;
}

/** Resumen del vehículo para listas. */
export interface VehicleSummary {
  id: string;
  make: string;
  model: string | null;
  year: number | null;
  plate: string | null;
}

export interface WorkOrderView {
  id: string;
  number: number;
  /** Número legible por taller: `OT-0001`. */
  code: string;
  status: WorkOrderStatus;
  customer: CustomerSummary;
  vehicle: VehicleSummary;
  /** Falla que reporta el cliente. */
  complaint: string;
  notes: string | null;
  mileage_in: number | null;
  /** shop_members.id asignado; null si no hay o ya no es miembro. */
  assigned_member_id: string | null;
  promised_at: string | null;
  currency: string;
  subtotal_cents: Cents;
  tax_cents: Cents;
  total_cents: Cents;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_by_account_id: string;
  created_at: string;
  updated_at: string;
}

/** Transiciones que se piden por `POST /work-orders/:id/transitions` (Día 5). */
export const MANUAL_WORK_ORDER_TRANSITIONS = ['in_progress', 'completed', 'cancelled'] as const;
export type ManualWorkOrderTransition = (typeof MANUAL_WORK_ORDER_TRANSITIONS)[number];

/** Payload de `WorkOrderStatusChanged`: hechos al momento del cambio. */
export interface WorkOrderStatusChangedPayload {
  workOrderId: string;
  shopId: string;
  code: string;
  from: WorkOrderStatus;
  to: WorkOrderStatus;
  customerId: string;
  vehicleId: string;
  total_cents: Cents;
  currency: string;
  /** null = lo decidió el cliente desde el enlace de aprobación (sin cuenta). */
  changedByAccountId: string | null;
  reason: string | null;
}

export const WORK_ORDER_ITEM_TYPES = ['labor', 'part'] as const;
export type WorkOrderItemType = (typeof WORK_ORDER_ITEM_TYPES)[number];

/** Línea de una OT. */
export interface WorkOrderItemView {
  id: string;
  /** labor = mano de obra; part = pieza. */
  type: WorkOrderItemType;
  description: string;
  part_number: string | null;
  /** Decimal como string: `"1.5"` (horas, unidades…). */
  quantity: string;
  unit_price_cents: Cents;
  /** ITBIS en basis points: 1800 = 18%, 0 = exento. */
  tax_rate_bps: number;
  /** approved = se cobra; proposed = espera al cliente; declined = rechazada (no suma). */
  approval_status: ItemApprovalStatus;
  decided_at: string | null;
  subtotal_cents: Cents;
  tax_cents: Cents;
  total_cents: Cents;
  created_at: string;
  updated_at: string;
}

/** OT con sus líneas (detalle). */
export interface WorkOrderDetailView extends WorkOrderView {
  items: WorkOrderItemView[];
}

// --- DVI: inspección digital del vehículo (Día 6) ---

/** ok = verde, attention = amarillo, urgent = rojo. */
export const FINDING_SEVERITIES = ['ok', 'attention', 'urgent'] as const;
export type FindingSeverity = (typeof FINDING_SEVERITIES)[number];

/** Tipos de foto aceptados (HEIC = formato por defecto del iPhone). */
export const PHOTO_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'] as const;
export type PhotoContentType = (typeof PHOTO_CONTENT_TYPES)[number];
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const MAX_PHOTOS_PER_FINDING = 10;

export interface InspectionPhotoView {
  id: string;
  status: 'pending' | 'uploaded';
  content_type: string;
  size_bytes: number;
  /** URL firmada para ver la foto (solo si está subida); vence en `url_expires_at`. */
  url: string | null;
  url_expires_at: string | null;
  created_at: string;
}

export interface InspectionFindingView {
  id: string;
  /** Área del vehículo: "Frenos", "Suspensión", "Luces"… */
  area: string;
  title: string;
  severity: FindingSeverity;
  notes: string | null;
  photos: InspectionPhotoView[];
  created_at: string;
}

export interface InspectionView {
  id: string;
  work_order_id: string;
  notes: string | null;
  findings: InspectionFindingView[];
  created_at: string;
  updated_at: string;
}

/** Respuesta al pedir subir una foto: la foto (pending) + cómo subirla a R2. */
export interface PhotoUploadView {
  photo: InspectionPhotoView;
  upload: {
    url: string;
    method: 'PUT';
    /** Enviar EXACTAMENTE estos headers (están firmados). */
    headers: Record<string, string>;
    expires_at: string;
  };
}

// --- Aprobación del cliente (Día 6) ---

export const ITEM_APPROVAL_STATUSES = ['approved', 'proposed', 'declined'] as const;
export type ItemApprovalStatus = (typeof ITEM_APPROVAL_STATUSES)[number];

/** Solicitud de aprobación, vista por el TALLER (incluye el enlace para compartir). */
export interface ApprovalRequestView {
  id: string;
  status: 'pending' | 'completed' | 'revoked';
  /** Enlace para el cliente. El taller puede compartirlo por su propio WhatsApp. */
  link: string;
  expires_at: string;
  decided_at: string | null;
  created_at: string;
}

/** Payload de `WorkOrderApprovalRequested`. Sin token: el notificador lo recalcula. */
export interface WorkOrderApprovalRequestedPayload {
  approvalId: string;
  workOrderId: string;
  shopId: string;
  code: string;
  customerId: string;
  vehicleId: string;
  expiresAt: string;
}

/** Línea tal como la ve el CLIENTE en la página de aprobación. */
export interface PublicApprovalItem {
  id: string;
  type: WorkOrderItemType;
  description: string;
  quantity: string;
  total_cents: Cents;
  approval_status: ItemApprovalStatus;
}

/** Lo que ve el cliente al abrir el enlace (sin datos internos del taller). */
export interface PublicApprovalView {
  status: 'pending' | 'completed' | 'revoked' | 'expired';
  expires_at: string;
  shop_name: string;
  work_order_code: string;
  vehicle: string;
  customer_first_name: string;
  currency: string;
  findings: {
    area: string;
    title: string;
    severity: FindingSeverity;
    notes: string | null;
    /** URLs firmadas (1 h) de las fotos subidas. */
    photo_urls: string[];
  }[];
  items: PublicApprovalItem[];
  /** Totales de lo que se va a cobrar (sin las rechazadas). */
  subtotal_cents: Cents;
  tax_cents: Cents;
  total_cents: Cents;
}

export type ItemDecision = 'approved' | 'declined';
