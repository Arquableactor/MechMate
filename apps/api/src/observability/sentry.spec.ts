import {
  type ArgumentsHost,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/nestjs';
import type { ErrorEvent } from '@sentry/nestjs';
import { initSentry, redact, scrubEvent, SENTRY_DATA_COLLECTION, shouldReport } from './sentry';
import { SentryExceptionFilter } from './sentry-exception.filter';

jest.mock('@sentry/nestjs', () => ({ init: jest.fn(), captureException: jest.fn() }));

beforeEach(() => jest.clearAllMocks());

describe('initSentry', () => {
  it('sin SENTRY_DSN no inicializa (local/tests no mandan nada)', () => {
    expect(initSentry({ NODE_ENV: 'production' })).toBe(false);
    expect(initSentry({ SENTRY_DSN: '  ' })).toBe(false);
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it('con DSN: entorno, release del commit de Render, sin trazas y sin recolectar PII', () => {
    expect(
      initSentry({ SENTRY_DSN: 'https://k@o1.ingest.us.sentry.io/2', NODE_ENV: 'production', RENDER_GIT_COMMIT: 'abc123' }),
    ).toBe(true);
    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://k@o1.ingest.us.sentry.io/2',
        environment: 'production',
        release: 'abc123',
        tracesSampleRate: 0,
        dataCollection: SENTRY_DATA_COLLECTION,
        beforeSend: scrubEvent,
      }),
    );
  });

  it('SENTRY_ENVIRONMENT tiene prioridad sobre NODE_ENV', () => {
    initSentry({ SENTRY_DSN: 'https://k@x/1', NODE_ENV: 'production', SENTRY_ENVIRONMENT: 'staging' });
    expect(Sentry.init).toHaveBeenCalledWith(expect.objectContaining({ environment: 'staging' }));
  });
});

describe('SENTRY_DATA_COLLECTION', () => {
  it('apaga cuerpos, cookies, query, usuario y headers de respuesta; niega headers sensibles', () => {
    expect(SENTRY_DATA_COLLECTION).toEqual({
      userInfo: false,
      cookies: false,
      httpBodies: [],
      urlQueryParams: false,
      httpHeaders: {
        request: { deny: ['authorization', 'cookie', 'x-signature', 'idempotency-key'] },
        response: false,
      },
    });
  });
});

describe('shouldReport', () => {
  it.each([
    [new BadRequestException(), false],
    [new UnauthorizedException(), false],
    [new NotFoundException(), false],
    [new ConflictException('Idempotency-Key reutilizada'), false],
    [new InternalServerErrorException(), true],
    [new Error('bug'), true],
    ['string lanzado', true],
  ])('%s → %s', (exception, expected) => {
    expect(shouldReport(exception)).toBe(expected);
  });
});

describe('redact', () => {
  it('oculta emails y teléfonos (internacional y RD)', () => {
    expect(redact('falló envío a Juan.P+x@gmail.com')).toBe('falló envío a [email]');
    expect(redact('whatsapp +18095551234 caído')).toBe('whatsapp [teléfono] caído');
    expect(redact('tel 809-555-1234 / (829) 555 1234')).toBe('tel [teléfono] / [teléfono]');
  });

  it('NO toca UUIDs, montos ni timestamps (se necesitan para depurar)', () => {
    const text = 'pago 01920000-0000-7000-8000-000000000001 por 250000000 centavos en 1790265955752';
    expect(redact(text)).toBe(text);
  });
});

describe('scrubEvent', () => {
  it('quita cuerpo, cookies, headers sensibles y datos del usuario; oculta PII en mensajes', () => {
    const event = {
      message: 'error con ana@mail.do',
      request: {
        data: '{"card":"4111"}',
        cookies: { sid: 'x' },
        headers: { Authorization: 'Bearer eyJ...', 'X-Signature': 'abc', 'content-type': 'application/json' },
      },
      user: { id: 'acc-1', email: 'ana@mail.do', ip_address: '1.2.3.4' },
      exception: { values: [{ type: 'Error', value: 'Resend 403 para ana@mail.do' }] },
    } as unknown as ErrorEvent;

    const out = scrubEvent(event);

    expect(out.request?.data).toBeUndefined();
    expect(out.request?.cookies).toBeUndefined();
    expect(out.request?.headers).toEqual({
      Authorization: '[filtrado]',
      'X-Signature': '[filtrado]',
      'content-type': 'application/json',
    });
    expect(out.user).toEqual({ id: 'acc-1' });
    expect(out.message).toBe('error con [email]');
    expect(out.exception?.values?.[0].value).toBe('Resend 403 para [email]');
  });
});

describe('SentryExceptionFilter', () => {
  const host = {} as ArgumentsHost;
  let baseCatch: jest.SpyInstance;

  beforeEach(() => {
    baseCatch = jest.spyOn(BaseExceptionFilter.prototype, 'catch').mockImplementation(() => undefined);
  });
  afterEach(() => baseCatch.mockRestore());

  it('reporta un 5xx y deja que Nest arme la respuesta', () => {
    const error = new Error('se cayó la DB');
    new SentryExceptionFilter().catch(error, host);
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
    expect(baseCatch).toHaveBeenCalledWith(error, host);
  });

  it('NO reporta un 4xx, pero igual responde', () => {
    const error = new UnauthorizedException();
    new SentryExceptionFilter().catch(error, host);
    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(baseCatch).toHaveBeenCalledWith(error, host);
  });
});
