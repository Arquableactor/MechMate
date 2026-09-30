import { type INestApplication, RequestMethod, ValidationPipe } from '@nestjs/common';

/**
 * Prefijo y validación globales. Un solo lugar para el servidor (main.ts) y
 * para el export del contrato OpenAPI: ambos ven exactamente las mismas rutas.
 */
export function configureApp(app: INestApplication): void {
  // API versionada bajo /v1 (CLAUDE.md).
  // Excepción: la página del cliente vive en /a/:token (enlace corto para WhatsApp).
  app.setGlobalPrefix('v1', { exclude: [{ path: 'a/:token', method: RequestMethod.GET }] });

  // Validación de DTOs (rechaza payloads inválidos con 400) + strip de extras.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
}
