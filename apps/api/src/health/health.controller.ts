import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { HealthStatus } from '@repo/types';
import { ApiView } from '../openapi/api-view.decorator';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiOkResponse({ description: 'Estado del servicio y conectividad a la base de datos y a Redis.' })
  @ApiView('HealthStatus')
  getHealth(): Promise<HealthStatus> {
    return this.health.getStatus();
  }
}
