import { resolve } from 'node:path';
import { loadLocalEnv } from './env-loader';

/**
 * Side-effect: carga env.txt + .env de apps/api. Debe importarse ANTES que
 * cualquier otra cosa (main.ts, prisma.config.ts) porque `@prisma/client`
 * expande `.env` al importarse: si `PGUSER`/`PGPASSWORD` aún no existen, la URL
 * queda con credenciales vacías.
 */
loadLocalEnv(resolve(__dirname, '../..')); // src/config o dist/config → apps/api
