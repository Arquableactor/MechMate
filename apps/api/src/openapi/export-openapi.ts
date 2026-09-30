import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import type { OpenAPIObject } from '@nestjs/swagger';
import { AppModule } from '../app.module';
import { configureApp } from '../configure-app';
import { buildOpenApiDocument } from './openapi';

/** `apps/api/openapi.json`: el contrato versionado (de él se generan los modelos Dart). */
export const OPENAPI_FILE = join(__dirname, '../../openapi.json');

/**
 * Arma el contrato SIN levantar la API: en modo preview Nest resuelve módulos
 * y rutas pero no instancia providers (ni DB, ni Redis, ni externos).
 */
export async function generateOpenApi(): Promise<OpenAPIObject> {
  const app = await NestFactory.create(AppModule, { preview: true, logger: false });
  configureApp(app);
  const document = buildOpenApiDocument(app);
  await app.close();
  return document;
}

export const serializeOpenApi = (document: OpenAPIObject): string => `${JSON.stringify(document, null, 2)}\n`;

if (require.main === module) {
  void generateOpenApi().then((document) => {
    writeFileSync(OPENAPI_FILE, serializeOpenApi(document));
    console.log(`Contrato escrito en ${OPENAPI_FILE} (${Object.keys(document.paths).length} rutas)`);
  });
}
