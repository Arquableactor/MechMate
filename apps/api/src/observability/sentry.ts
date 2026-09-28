import { HttpException, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import type { ErrorEvent } from '@sentry/nestjs';

/**
 * Inicializa Sentry si hay SENTRY_DSN. Sin DSN (local, tests) no hace nada:
 * `Sentry.captureException` queda como no-op. No es fail-closed en producción:
 * sin Sentry se pierde visibilidad, no dinero; basta con avisar.
 * Devuelve si quedó activo.
 */
export function initSentry(env: NodeJS.ProcessEnv): boolean {
  const dsn = env.SENTRY_DSN?.trim();
  if (!dsn) {
    if (env.NODE_ENV === 'production') {
      new Logger('Sentry').warn('SENTRY_DSN no definido: los errores NO se reportan');
    }
    return false;
  }

  Sentry.init({
    dsn,
    environment: env.SENTRY_ENVIRONMENT ?? env.NODE_ENV ?? 'development',
    // Render expone el commit desplegado: cada error queda atado a su versión.
    release: env.RENDER_GIT_COMMIT,
    // Solo errores: el APM es Datadog (CLAUDE.md). Nada de trazas ni perfiles.
    tracesSampleRate: 0,
    // Sentry 11 recolecta TODO por defecto (cuerpos, cookies, headers, usuario).
    // Manejamos pagos: se apaga explícitamente. scrubEvent es la segunda barrera.
    dataCollection: SENTRY_DATA_COLLECTION,
    beforeSend: scrubEvent,
  });
  return true;
}

/**
 * ¿Se reporta esta excepción? Los 4xx son errores del cliente (401, 404, 409
 * de idempotencia…): esperados, y llenarían la cuota. Solo 5xx y errores no HTTP.
 */
export function shouldReport(exception: unknown): boolean {
  if (exception instanceof HttpException) return exception.getStatus() >= 500;
  return true;
}

const SENSITIVE_HEADERS = ['authorization', 'cookie', 'x-signature', 'idempotency-key'];

/** Qué recolecta el SDK: nada de cuerpos, cookies, query ni datos del usuario. */
export const SENTRY_DATA_COLLECTION = {
  userInfo: false,
  cookies: false,
  httpBodies: [],
  urlQueryParams: false,
  httpHeaders: { request: { deny: [...SENSITIVE_HEADERS] }, response: false },
} satisfies NonNullable<Sentry.NodeOptions['dataCollection']>;

const EMAIL = /[\w.+-]+@[\w-]+(\.[\w-]+)+/g;
// Teléfono = internacional con `+`, o formato RD (809/829/849). Deliberadamente
// estrecho: no debe tocar UUIDs, montos ni timestamps, que se necesitan al depurar.
const PHONE = /\+\d{8,15}\b|(?:\(8[024]9\)|\b8[024]9)[\s.-]?\d{3}[\s.-]?\d{4}\b/g;

/** Oculta emails y teléfonos en texto libre (mensajes de error, etc.). */
export function redact(text: string): string {
  return text.replace(EMAIL, '[email]').replace(PHONE, '[teléfono]');
}

/**
 * Último filtro antes de enviar a Sentry: quita cuerpos, cookies, headers
 * sensibles (token Auth0, firma de webhook) y datos del usuario, y oculta
 * emails/teléfonos en los mensajes.
 */
export function scrubEvent(event: ErrorEvent): ErrorEvent {
  if (event.request) {
    delete event.request.data;
    delete event.request.cookies;
    const headers = event.request.headers;
    if (headers) {
      for (const key of Object.keys(headers)) {
        if (SENSITIVE_HEADERS.includes(key.toLowerCase())) headers[key] = '[filtrado]';
      }
    }
  }
  if (event.user) event.user = { id: event.user.id };
  if (event.message) event.message = redact(event.message);
  for (const ex of event.exception?.values ?? []) {
    if (ex.value) ex.value = redact(ex.value);
  }
  return event;
}
