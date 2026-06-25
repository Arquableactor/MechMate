// Jest globalTeardown (integration): detiene la instancia embebida si la hubo.
const fs = require('fs');
const os = require('os');
const path = require('path');

module.exports = async () => {
  const pg = globalThis.__EMBEDDED_PG__;
  if (pg) {
    await pg.stop();
  }
  try {
    fs.unlinkSync(path.join(os.tmpdir(), 'mechmate-test-db-url'));
  } catch {
    // ignore
  }
};
