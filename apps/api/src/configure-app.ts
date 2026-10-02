import { type INestApplication, RequestMethod, ValidationPipe } from '@nestjs/common';

/** Servidores de desarrollo (Flutter web, Next.js): cualquier puerto de esta máquina. */
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/;

/**
 * ¿Puede un navegador en `origin` llamar a la API? localhost (desarrollo) +
 * los orígenes exactos de `CORS_ORIGINS` (coma-separados, p. ej. la web del
 * marketplace). La auth va por header `Authorization` (no cookies): CORS no
 * abre acceso a nada sin token, solo deja que el navegador lea la respuesta.
 */
export function isAllowedOrigin(origin: string, configured: string | undefined): boolean {
  if (LOCAL_ORIGIN.test(origin)) return true;
  const allowed = (configured ?? '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
  return allowed.includes(origin);
}

/**
 * Prefijo, validación y CORS globales. Un solo lugar para el servidor (main.ts)
 * y para el export del contrato OpenAPI: ambos ven exactamente las mismas rutas.
 */
export function configureApp(app: INestApplication, env: NodeJS.ProcessEnv = process.env): void {
  // API versionada bajo /v1 (CLAUDE.md).
  // Excepción: la página del cliente vive en /a/:token (enlace corto para WhatsApp).
  app.setGlobalPrefix('v1', { exclude: [{ path: 'a/:token', method: RequestMethod.GET }] });

  // Validación de DTOs (rechaza payloads inválidos con 400) + strip de extras.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
    // Sin Origin (apps nativas, curl, server-to-server) no aplica CORS.
    origin: (origin: string | undefined, done: (err: Error | null, allow?: boolean) => void) =>
      done(null, !origin || isAllowedOrigin(origin, env.CORS_ORIGINS)),
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Idempotency-Key'],
    credentials: false,
    maxAge: 600,
  });
}
