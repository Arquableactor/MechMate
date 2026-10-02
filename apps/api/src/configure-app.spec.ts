import { Controller, Get, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { configureApp, isAllowedOrigin } from './configure-app';

describe('isAllowedOrigin', () => {
  it('localhost en cualquier puerto (Flutter web / Next.js en desarrollo)', () => {
    for (const o of ['http://localhost:5000', 'http://localhost', 'http://127.0.0.1:61234']) {
      expect(isAllowedOrigin(o, undefined)).toBe(true);
    }
  });

  it('otros orígenes solo si están EXACTOS en CORS_ORIGINS', () => {
    const configured = ' https://mechmate.do , https://app.mechmate.do/ ';
    expect(isAllowedOrigin('https://mechmate.do', configured)).toBe(true);
    expect(isAllowedOrigin('https://app.mechmate.do', configured)).toBe(true);
    for (const o of ['https://evil.com', 'https://mechmate.do.evil.com', 'http://mechmate.do', 'https://localhost:5000', 'http://localhost.evil.com']) {
      expect(isAllowedOrigin(o, configured)).toBe(false);
    }
  });
});

@Controller('ping')
class PingController {
  @Get()
  ping() {
    return { ok: true };
  }
}

describe('CORS por HTTP real (preflight del navegador)', () => {
  let app: INestApplication;
  let base: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ controllers: [PingController] }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    configureApp(app, { CORS_ORIGINS: 'https://mechmate.do' });
    await app.listen(0);
    base = (await app.getUrl()).replace('[::1]', 'localhost');
  });

  afterAll(async () => {
    await app?.close();
  });

  const preflight = (origin: string) =>
    fetch(`${base}/v1/ping`, {
      method: 'OPTIONS',
      headers: { Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'authorization,idempotency-key' },
    });

  it('origen permitido: devuelve Allow-Origin y los headers que usa la app (Authorization, Idempotency-Key)', async () => {
    const res = await preflight('http://localhost:5000');
    expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost:5000');
    expect(res.headers.get('access-control-allow-headers')).toMatch(/Idempotency-Key/);
    expect(res.headers.get('access-control-allow-credentials')).toBeNull();
    expect((await preflight('https://mechmate.do')).headers.get('access-control-allow-origin')).toBe('https://mechmate.do');
  });

  it('origen no permitido: sin Allow-Origin (el navegador bloquea la lectura)', async () => {
    const res = await preflight('https://evil.com');
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
    const get = await fetch(`${base}/v1/ping`, { headers: { Origin: 'https://evil.com' } });
    expect(get.headers.get('access-control-allow-origin')).toBeNull();
  });
});
