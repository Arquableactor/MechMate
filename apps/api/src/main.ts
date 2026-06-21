import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // API versionada bajo /v1 (CLAUDE.md).
  app.setGlobalPrefix('v1');

  // Validación de DTOs (rechaza payloads inválidos con 400) + strip de extras.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // OpenAPI autogenerado — es el contrato que alimentará al cliente Flutter.
  const config = new DocumentBuilder()
    .setTitle('AutoMecánica API')
    .setDescription('Backend del Ecosistema AutoMecánica (Identity — Día 2).')
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
