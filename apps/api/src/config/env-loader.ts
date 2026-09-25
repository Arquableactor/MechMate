import { resolve } from 'node:path';
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';

/**
 * Carga el entorno local de `dir` en `processEnv`:
 *   1. `env.txt` — credenciales (PGUSER/PGPASSWORD). Gitignored, solo local.
 *   2. `.env`    — config; arma DATABASE_URL/DIRECT_URL con ${PGUSER}/${PGPASSWORD}.
 *
 * Ambos son opcionales: en Render/CI las vars vienen del entorno y ganan
 * (dotenv nunca pisa lo que ya está en `processEnv`).
 */
export function loadLocalEnv(
  dir: string,
  // process.env admite `undefined` en sus valores; dotenv-expand exige strings.
  processEnv: Record<string, string> = process.env as Record<string, string>,
): void {
  config({ path: resolve(dir, 'env.txt'), processEnv, quiet: true });
  expand({ ...config({ path: resolve(dir, '.env'), processEnv, quiet: true }), processEnv });
}
