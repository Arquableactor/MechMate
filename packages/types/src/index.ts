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
