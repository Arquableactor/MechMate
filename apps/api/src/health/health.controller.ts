import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { HealthStatus } from '@repo/types';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiOkResponse({
    description: 'Estado del servicio y conectividad a la base de datos.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        uptime: { type: 'number', example: 12.34 },
        timestamp: { type: 'string', example: '2026-06-20T12:00:00.000Z' },
        db: { type: 'string', enum: ['up', 'down'], example: 'up' },
      },
    },
  })
  getHealth(): Promise<HealthStatus> {
    return this.health.getStatus();
  }
}
