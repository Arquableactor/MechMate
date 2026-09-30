import { readFileSync } from 'node:fs';
import type { INestApplication } from '@nestjs/common';
import { HTTP_CODE_METADATA } from '@nestjs/common/constants';
import { ModulesContainer } from '@nestjs/core';
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { VIEW_EXTENSION, type ViewExtension } from './api-view.decorator';
import { definitionsToOas, type JsonSchema } from './json-schema-to-oas';

/** Generado por el build de @repo/types (scripts/gen-api-schemas.cjs). */
interface ApiSchemasFile {
  names: string[];
  definitions: Record<string, JsonSchema>;
}

export function loadApiSchemas(): ApiSchemasFile {
  return JSON.parse(readFileSync(require.resolve('@repo/types/api-schemas.json'), 'utf8')) as ApiSchemasFile;
}

/**
 * `@HttpCode` de cada handler, por operationId (`Controlador_método`, el que
 * pone @nestjs/swagger). Hace falta porque con un `@ApiXxxResponse` de error
 * Swagger deja de agregar la respuesta de éxito por defecto.
 */
function httpCodes(app: INestApplication): Map<string, number> {
  const codes = new Map<string, number>();
  for (const module of app.get(ModulesContainer).values()) {
    for (const { metatype } of module.controllers.values()) {
      if (typeof metatype !== 'function') continue;
      const proto = metatype.prototype as Record<string, unknown>;
      for (const method of Object.getOwnPropertyNames(proto)) {
        const handler = proto[method];
        const code = typeof handler === 'function' ? (Reflect.getMetadata(HTTP_CODE_METADATA, handler) as number | undefined) : undefined;
        if (code) codes.set(`${metatype.name}_${method}`, code);
      }
    }
  }
  return codes;
}

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });

/**
 * El contrato de la API (OpenAPI 3.0): lo que envían los endpoints lo describen
 * los DTOs (class-validator); lo que DEVUELVEN, los tipos de @repo/types vía
 * `@ApiView`. Alimenta a Swagger UI y a los modelos Dart del móvil.
 */
export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('MechMate API')
    .setDescription(
      'Backend del ecosistema MechMate (ERP de talleres + marketplace de repuestos, RD). ' +
        'Dinero en centavos como string (`Cents`); fechas ISO-8601.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  const schemas: Record<string, JsonSchema> = {
    ...(document.components?.schemas as Record<string, JsonSchema> | undefined),
    ...definitionsToOas(loadApiSchemas().definitions),
  };

  const codes = httpCodes(app);
  for (const methods of Object.values(document.paths)) {
    for (const [verb, operation] of Object.entries(methods) as Array<[string, Record<string, unknown>]>) {
      const view = operation?.[VIEW_EXTENSION] as ViewExtension | undefined;
      if (!view) continue;
      delete operation[VIEW_EXTENSION];

      let schema: JsonSchema = ref(view.name);
      if (view.shape === 'array') schema = { type: 'array', items: ref(view.name) };
      if (view.shape === 'page') {
        const pageName = `${view.name}Page`;
        schemas[pageName] ??= {
          type: 'object',
          properties: {
            items: { type: 'array', items: ref(view.name) },
            next_cursor: { type: 'string', nullable: true, description: 'Pasar como `cursor` para la siguiente página; null si no hay más.' },
          },
          required: ['items', 'next_cursor'],
        };
        schema = ref(pageName);
      }

      // El código de éxito REAL del handler (@HttpCode, o el de Nest: POST 201, resto 200).
      const operationId = String(operation.operationId);
      const status = String(codes.get(operationId) ?? (verb === 'post' ? 201 : 200));
      const responses = operation.responses as Record<string, { description?: string; content?: unknown }>;
      const stray = Object.keys(responses).filter((code) => code.startsWith('2') && code !== status);
      if (stray.length > 0) {
        throw new Error(`${operationId}: documenta ${stray.join(', ')} pero responde ${status} (revisa @HttpCode / @ApiXxxResponse)`);
      }
      responses[status] = { description: responses[status]?.description || 'OK', content: { 'application/json': { schema } } };
    }
  }

  document.components = { ...document.components, schemas: schemas as NonNullable<OpenAPIObject['components']>['schemas'] };
  return document;
}
