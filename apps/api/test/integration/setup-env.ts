// setupFiles (integration): corre en cada worker ANTES de los tests.
// Aplica el patch de BigInt y apunta DATABASE_URL a la DB de test que levantó
// globalSetup (los workers son procesos separados; la URL viaja por archivo temp).
import { existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import '../../src/common/bigint-serializer';

const urlFile = join(tmpdir(), 'mechmate-test-db-url');
if (existsSync(urlFile)) {
  // Pool acotado por worker (ver maxWorkers en jest.config.ts) y espera amplia:
  // los tests de concurrencia encolan más consultas que conexiones.
  const url = new URL(readFileSync(urlFile, 'utf8').trim());
  url.searchParams.set('connection_limit', '5');
  url.searchParams.set('pool_timeout', '30');
  process.env.DATABASE_URL = url.toString();
}
