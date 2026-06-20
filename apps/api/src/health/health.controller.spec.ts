import { Test } from '@nestjs/testing';
import type { HealthStatus } from '@repo/types';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  const buildController = async (db: HealthStatus['db']): Promise<HealthController> => {
    const prismaMock: Pick<PrismaService, '$queryRaw'> = {
      $queryRaw:
        db === 'up'
          ? jest.fn().mockResolvedValue([{ '?column?': 1 }])
          : jest.fn().mockRejectedValue(new Error('no db')),
    } as unknown as PrismaService;

    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    return moduleRef.get(HealthController);
  };

  it('reporta db: "up" con el shape de HealthStatus cuando la DB responde', async () => {
    const controller = await buildController('up');
    const result = await controller.getHealth();

    expect(result.status).toBe('ok');
    expect(result.db).toBe('up');
    expect(typeof result.uptime).toBe('number');
    expect(() => new Date(result.timestamp).toISOString()).not.toThrow();
  });

  it('degrada a db: "down" sin tumbar el endpoint cuando la DB falla', async () => {
    const controller = await buildController('down');
    const result = await controller.getHealth();

    expect(result.status).toBe('ok');
    expect(result.db).toBe('down');
  });
});
