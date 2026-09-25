import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadLocalEnv } from './env-loader';

describe('loadLocalEnv', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'env-loader-'));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  const URL_TEMPLATE = 'DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@db.test/app"\n';

  it('arma la URL de .env con las credenciales de env.txt', () => {
    writeFileSync(join(dir, 'env.txt'), 'PGUSER=owner\nPGPASSWORD=s3cret\n');
    writeFileSync(join(dir, '.env'), URL_TEMPLATE);
    const env: Record<string, string> = {};

    loadLocalEnv(dir, env);

    expect(env.DATABASE_URL).toBe('postgresql://owner:s3cret@db.test/app');
  });

  it('no pisa variables ya definidas en el entorno (Render/CI ganan)', () => {
    writeFileSync(join(dir, 'env.txt'), 'PGUSER=owner\nPGPASSWORD=s3cret\n');
    writeFileSync(join(dir, '.env'), URL_TEMPLATE);
    const env: Record<string, string> = { DATABASE_URL: 'postgresql://render@prod/app' };

    loadLocalEnv(dir, env);

    expect(env.DATABASE_URL).toBe('postgresql://render@prod/app');
  });

  it('sin env.txt ni .env no hace nada ni lanza', () => {
    const env: Record<string, string> = {};

    expect(() => loadLocalEnv(dir, env)).not.toThrow();
    expect(env).toEqual({});
  });
});
