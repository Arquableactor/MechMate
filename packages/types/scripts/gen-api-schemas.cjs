/**
 * Genera dist/api-schemas.json: JSON Schema de cada tipo registrado en
 * `ApiSchemas` (y de todo lo que referencian). La API lo convierte a schemas
 * OpenAPI; así el contrato sale de los MISMOS tipos que usa el código.
 */
const { writeFileSync } = require('node:fs');
const { join } = require('node:path');
const { createGenerator } = require('ts-json-schema-generator');

const root = join(__dirname, '..');
const schema = createGenerator({
  path: join(root, 'src/index.ts'),
  tsconfig: join(root, 'tsconfig.json'),
  type: 'ApiSchemas',
  expose: 'export',
  jsDoc: 'basic',
  sortProps: true,
}).createSchema('ApiSchemas');

const { ApiSchemas, ...definitions } = schema.definitions;
const out = { names: Object.keys(ApiSchemas.properties), definitions };
writeFileSync(join(root, 'dist/api-schemas.json'), `${JSON.stringify(out, null, 2)}\n`);
console.log(`api-schemas.json: ${out.names.length} respuestas, ${Object.keys(definitions).length} definiciones`);
