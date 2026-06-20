import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // API versionada bajo /v1 (CLAUDE.md).
  app.setGlobalPrefix('v1');

  // OpenAPI autogenerado — es el contrato que alimentará al cliente Flutter.
  const config = new DocumentBuilder()
    .setTitle('AutoMecánica API')
    .setDescription('Backend del Ecosistema AutoMecánica (fundación — Día 1).')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/docs', app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  Logger.log(`API escuchando en http://localhost:${port}/v1`, 'Bootstrap');
}

void bootstrap();
