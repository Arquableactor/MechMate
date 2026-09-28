import { type ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/nestjs';
import { shouldReport } from './sentry';

/**
 * Filtro global: reporta a Sentry los errores de servidor (5xx y excepciones no
 * HTTP) y delega la respuesta al filtro por defecto de Nest (no cambia lo que
 * ve el cliente). Sin SENTRY_DSN, captureException es no-op.
 */
@Catch()
export class SentryExceptionFilter extends BaseExceptionFilter {
  override catch(exception: unknown, host: ArgumentsHost): void {
    if (shouldReport(exception)) Sentry.captureException(exception);
    super.catch(exception, host);
  }
}
