// Deben ir primero: el entorno antes de que @prisma/client lo lea, y el parche
// de BigInt.prototype.toJSON antes de cualquier serialización.
import './config/load-env';
import './common/bigint-serializer';

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  // rawBody:true expone req.rawBody para verificar la firma de los webhooks.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });

  // API versionada bajo /v1 (CLAUDE.md).
  app.setGlobalPrefix('v1');

  // Validación de DTOs (rechaza payloads inválidos con 400) + strip de extras.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // OpenAPI autogenerado — es el contrato que alimentará al cliente Flutter.
  const config = new DocumentBuilder()
    .setTitle('AutoMecánica API')
    .setDescription('Backend del Ecosistema AutoMecánica (Payments + Ledger — Día 3).')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/docs', app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  Logger.log(`API escuchando en http://localhost:${port}/v1`, 'Bootstrap');
}

void bootstrap();
