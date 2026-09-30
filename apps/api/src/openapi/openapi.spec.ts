import { readFileSync } from 'node:fs';
import type { OpenAPIObject } from '@nestjs/swagger';
import { generateOpenApi, OPENAPI_FILE, serializeOpenApi } from './export-openapi';
import { loadApiSchemas } from './openapi';

/**
 * El contrato OpenAPI es lo que consume el móvil (modelos Dart generados):
 * completo, consistente y versionado. Se arma en modo preview (sin DB ni Redis).
 */
let document: OpenAPIObject;

beforeAll(async () => {
  document = await generateOpenApi();
});

type Operation = { operationId: string; responses: Record<string, { content?: { 'application/json'?: { schema?: unknown } } }> };

const operations = () =>
  Object.entries(document.paths).flatMap(([path, methods]) =>
    Object.entries(methods as Record<string, Operation>).map(([verb, op]) => ({ route: `${verb.toUpperCase()} ${path}`, op })),
  );

describe('Contrato OpenAPI', () => {
  it('TODA operación declara el schema de su respuesta de éxito (salvo 204 sin cuerpo)', () => {
    const missing = operations()
      .filter(({ op }) => {
        const success = Object.entries(op.responses).filter(([code]) => code.startsWith('2'));
        if (success.length === 1 && success[0][0] === '204') return false;
        return !success.some(([, r]) => r.content?.['application/json']?.schema);
      })
      .map(({ route }) => route);
    expect(missing).toEqual([]);
    expect(operations().length).toBeGreaterThanOrEqual(46);
  });

  it('todas las $ref apuntan a un schema que existe; y todo tipo registrado en ApiSchemas se usa', () => {
    const json = JSON.stringify(document);
    const refs = new Set([...json.matchAll(/"\$ref":"#\/components\/schemas\/([^"]+)"/g)].map((m) => m[1]));
    const schemas = Object.keys(document.components?.schemas ?? {});
    expect([...refs].filter((r) => !schemas.includes(r))).toEqual([]);
    expect(loadApiSchemas().names.filter((n) => !refs.has(n))).toEqual([]);
  });

  it('el código de éxito es el REAL del handler (POST 201 por defecto, @HttpCode manda)', () => {
    const codes = (route: string) => {
      const found = operations().find((o) => o.route === route);
      if (!found) throw new Error(`No existe ${route}`);
      return Object.keys(found.op.responses).filter((c) => c.startsWith('2'));
    };
    expect(codes('POST /v1/shops/{shopId}/work-orders')).toEqual(['201']);
    expect(codes('POST /v1/shops/{shopId}/work-orders/{workOrderId}/charge')).toEqual(['200']);
    expect(codes('POST /v1/public/approvals/{token}/decisions')).toEqual(['200']);
    expect(codes('POST /v1/me/roles')).toEqual(['200']);
  });

  it('nullables y páginas llegan bien al contrato', () => {
    const s = document.components!.schemas as Record<string, { properties: Record<string, unknown> }>;
    expect(s.InvoiceView.properties.ncf).toEqual({ type: 'string', nullable: true });
    expect(s.VinDecodeView.properties.vehicle).toEqual({ allOf: [{ $ref: '#/components/schemas/DecodedVehicleView' }], nullable: true });
    expect(s.InvoiceViewPage.properties.items).toEqual({ type: 'array', items: { $ref: '#/components/schemas/InvoiceView' } });
  });

  it('fuera del contrato: el webhook del PSP y la página HTML de aprobación', () => {
    const paths = Object.keys(document.paths);
    expect(paths.filter((p) => p.includes('webhook') || p.startsWith('/a/'))).toEqual([]);
  });

  it('apps/api/openapi.json está al día (si falla: pnpm --filter api openapi:export)', () => {
    expect(readFileSync(OPENAPI_FILE, 'utf8')).toBe(serializeOpenApi(document));
  });
});
