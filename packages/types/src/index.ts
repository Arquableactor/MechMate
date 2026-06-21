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
