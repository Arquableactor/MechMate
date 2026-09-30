// Deben ir primero: el entorno antes de que @prisma/client lo lea, Sentry antes
// que los módulos que instrumenta, y el parche de BigInt.prototype.toJSON antes
// de cualquier serialización.
import './config/load-env';
import './instrument';
import './common/bigint-serializer';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';
import { buildOpenApiDocument } from './openapi/openapi';

async function bootstrap(): Promise<void> {
  // rawBody:true expone req.rawBody para verificar la firma de los webhooks.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });

  configureApp(app);

  // OpenAPI autogenerado — es el contrato que alimenta al cliente Flutter.
  SwaggerModule.setup('v1/docs', app, buildOpenApiDocument(app));

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  Logger.log(`API escuchando en http://localhost:${port}/v1`, 'Bootstrap');
}

void bootstrap();
