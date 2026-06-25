// Jest globalSetup (integration). Plain JS to avoid TS-transform pitfalls.
// Arranca un Postgres real para los tests:
//   - si TEST_DATABASE_URL está seteado (CI con service postgres), lo usa;
//   - si no, levanta embedded-postgres (binario real, sin Docker) en local.
// Aplica TODAS las migraciones con `prisma migrate deploy` y verifica PG >= 15.
const os = require('os');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const API_DIR = path.resolve(__dirname, '../..');
const URL_FILE = path.join(os.tmpdir(), 'mechmate-test-db-url');
const req = (m) => require(require.resolve(m, { paths: [API_DIR] }));

module.exports = async () => {
  let url = process.env.TEST_DATABASE_URL;

  if (!url) {
    const Mod = req('embedded-postgres');
    const EmbeddedPostgres = Mod.default || Mod;
    const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mechmate-pg-'));
    const port = 50000 + (process.pid % 10000);
    const pg = new EmbeddedPostgres({
      databaseDir: dataDir,
      user: 'postgres',
      password: 'postgres',
      port,
      persistent: false,
    });
    await pg.initialise();
    await pg.start();
    await pg.createDatabase('mechmate_test');
    url = `postgresql://postgres:postgres@localhost:${port}/mechmate_test`;
    globalThis.__EMBEDDED_PG__ = pg;
    globalThis.__EMBEDDED_PG_DIR__ = dataDir;
    console.log(`\n[integration] embedded-postgres en :${port}`);
  } else {
    console.log('\n[integration] usando TEST_DATABASE_URL');
  }

  execSync('node node_modules/prisma/build/index.js migrate deploy', {
    cwd: API_DIR,
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'inherit',
  });

  const { PrismaClient } = req('@prisma/client');
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const rows = await prisma.$queryRawUnsafe('SHOW server_version_num');
    const num = Number(rows[0].server_version_num);
    if (num < 150000) {
      throw new Error(`Postgres ${num} < 150000: NULLS NOT DISTINCT no soportado. Usa PG >= 15.`);
    }
  } finally {
    await prisma.$disconnect();
  }

  fs.writeFileSync(URL_FILE, url);
  process.env.DATABASE_URL = url;
};
