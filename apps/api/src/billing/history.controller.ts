import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOperation, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import type { HistoryView } from '@repo/types';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiView } from '../openapi/api-view.decorator';
import { ShopAccessGuard } from '../shops/shop-access.guard';
import { HistoryService } from './history.service';

class HistoryQuery {
  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({ description: 'next_cursor de la página anterior.' })
  @IsOptional()
  @IsUUID()
  cursor?: string;
}

@ApiTags('history')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ShopAccessGuard)
@Controller('shops/:shopId')
export class HistoryController {
  constructor(private readonly history: HistoryService) {}

  @Get('vehicles/:vehicleId/history')
  @ApiOperation({
    summary: 'Historial del vehículo: OT (con factura y método de pago), visitas, total gastado y última visita.',
  })
  @ApiNotFoundResponse({ description: 'El vehículo no es de este taller.' })
  @ApiView('HistoryView')
  vehicle(
    @Param('shopId') shopId: string,
    @Param('vehicleId') vehicleId: string,
    @Query() q: HistoryQuery,
  ): Promise<HistoryView> {
    return this.history.get(shopId, { vehicleId }, q);
  }

  @Get('customers/:customerId/history')
  @ApiOperation({
    summary: 'Historial del cliente: OT (con factura y método de pago), visitas, total gastado y última visita.',
  })
  @ApiNotFoundResponse({ description: 'El cliente no es de este taller.' })
  @ApiView('HistoryView')
  customer(
    @Param('shopId') shopId: string,
    @Param('customerId') customerId: string,
    @Query() q: HistoryQuery,
  ): Promise<HistoryView> {
    return this.history.get(shopId, { customerId }, q);
  }
}
