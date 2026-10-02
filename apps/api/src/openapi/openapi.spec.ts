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
    expect(s.InvoiceView.properties.ncf).toMatchObject({ type: 'string', nullable: true });
    // Enteros (alias `Int`) → integer; dinero (alias `Cents`) → string, incrustados.
    expect(s.VehicleView.properties.year).toMatchObject({ type: 'integer', nullable: true });
    expect(s.InvoiceView.properties.total_cents).toMatchObject({ type: 'string' });
    expect(s.Cents ?? s.Int).toBeUndefined();
    expect(s.VinDecodeView.properties.vehicle).toEqual({ allOf: [{ $ref: '#/components/schemas/DecodedVehicleView' }], nullable: true });
    expect(s.InvoiceViewPage.properties.items).toEqual({ type: 'array', items: { $ref: '#/components/schemas/InvoiceView' } });
  });

  it('ningún campo queda como `object` sin forma (p. ej. un `string | null` sin `type` en @ApiProperty)', () => {
    const vague = Object.entries(document.components!.schemas as Record<string, { properties?: Record<string, Record<string, unknown>> }>)
      .flatMap(([name, s]) => Object.entries(s.properties ?? {}).map(([prop, v]) => ({ at: `${name}.${prop}`, v })))
      .filter(({ v }) => v.type === 'object' && !v.properties && !v.additionalProperties)
      .map(({ at }) => at);
    expect(vague).toEqual([]);
  });

  it('sin `default` en los schemas: los clientes generados lo "envían" (un update pisaría datos con el default)', () => {
    const withDefault: string[] = [];
    const walk = (node: unknown, at: string): void => {
      if (!node || typeof node !== 'object') return;
      if ('default' in node) withDefault.push(at);
      for (const [k, v] of Object.entries(node)) walk(v, `${at}/${k}`);
    };
    walk(document.components?.schemas, '#/components/schemas');
    expect(withDefault).toEqual([]);
  });

  it('operationIds legibles y únicos (son los nombres de método del cliente Dart)', () => {
    const ids = operations().map(({ op }) => op.operationId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(expect.arrayContaining(['workOrdersAddItem', 'chargesCharge', 'historyVehicle', 'invoicesList']));
  });

  it('fuera del contrato: el webhook del PSP y la página HTML de aprobación', () => {
    const paths = Object.keys(document.paths);
    expect(paths.filter((p) => p.includes('webhook') || p.startsWith('/a/'))).toEqual([]);
  });

  it('apps/api/openapi.json está al día (si falla: pnpm --filter api openapi:export)', () => {
    expect(readFileSync(OPENAPI_FILE, 'utf8')).toBe(serializeOpenApi(document));
  });
});
