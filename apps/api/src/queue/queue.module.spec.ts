import type { Queue } from 'bullmq';
import { QueueHealthService } from './queue-health.service';
import { QueueModule, resolveRedisUrl } from './queue.module';

describe('resolveRedisUrl', () => {
  it('devuelve REDIS_URL cuando está definido', () => {
    expect(resolveRedisUrl({ REDIS_URL: 'redis://localhost:6379' })).toBe('redis://localhost:6379');
  });

  it('falla cerrado en producción si falta REDIS_URL', () => {
    expect(() => resolveRedisUrl({ NODE_ENV: 'production' })).toThrow(
      'REDIS_URL es obligatorio en producción',
    );
  });

  it('trata REDIS_URL vacío como ausente', () => {
    expect(() => resolveRedisUrl({ NODE_ENV: 'production', REDIS_URL: '  ' })).toThrow();
  });

  it('en dev/test sin REDIS_URL deshabilita las colas (null)', () => {
    expect(resolveRedisUrl({ NODE_ENV: 'test' })).toBeNull();
  });
});

describe('QueueModule.forRoot', () => {
  it('sin Redis no registra BullMQ pero sigue exponiendo el health', () => {
    const mod = QueueModule.forRoot({ NODE_ENV: 'test' });
    expect(mod.imports).toEqual([]);
    expect(mod.exports).toEqual([QueueHealthService]);
  });

  it('con Redis registra la conexión y la cola', () => {
    const mod = QueueModule.forRoot({ REDIS_URL: 'redis://localhost:6379' });
    expect(mod.imports).toHaveLength(2);
  });
});

describe('QueueHealthService', () => {
  const queueWith = (getVersion: jest.Mock) => ({ getVersion }) as unknown as Queue;

  it("reporta 'disabled' cuando no hay cola (sin REDIS_URL)", async () => {
    await expect(new QueueHealthService().check()).resolves.toBe('disabled');
  });

  it("reporta 'up' cuando Redis responde", async () => {
    const service = new QueueHealthService(queueWith(jest.fn().mockResolvedValue('7.4.0')));
    await expect(service.check()).resolves.toBe('up');
  });

  it("reporta 'down' sin lanzar cuando Redis falla", async () => {
    const service = new QueueHealthService(
      queueWith(jest.fn().mockRejectedValue(new Error('ECONNREFUSED'))),
    );
    await expect(service.check()).resolves.toBe('down');
  });

  it("reporta 'down' si Redis no responde a tiempo (no cuelga el health)", async () => {
    jest.useFakeTimers();
    try {
      const service = new QueueHealthService(queueWith(jest.fn(() => new Promise(() => {}))));
      const result = service.check();
      await jest.advanceTimersByTimeAsync(1_000);
      await expect(result).resolves.toBe('down');
    } finally {
      jest.useRealTimers();
    }
  });
});
