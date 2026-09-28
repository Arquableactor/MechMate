import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { type Page, WORK_ORDER_STATUSES, type WorkOrderStatus, type WorkOrderView } from '@repo/types';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { type AuthenticatedAccount, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ShopAccessGuard } from '../shops/shop-access.guard';
import { WorkOrdersService } from './work-orders.service';

export class CreateWorkOrderDto {
  @ApiProperty()
  @IsUUID()
  customer_id!: string;

  @ApiProperty({ description: 'Debe ser un vehículo de ese cliente.' })
  @IsUUID()
  vehicle_id!: string;

  @ApiProperty({ example: 'Ruido al frenar y vibración en el volante', minLength: 3, maxLength: 2000 })
  @IsString()
  @Length(3, 2000)
  complaint!: string;

  @ApiPropertyOptional({ nullable: true, maxLength: 2000 })
  @ValidateIf((_, v) => v !== null)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;

  @ApiPropertyOptional({ example: 185000, nullable: true, description: 'Odómetro al recibir el vehículo.' })
  @ValidateIf((_, v) => v !== null)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3_000_000)
  mileage_in?: number | null;

  @ApiPropertyOptional({ nullable: true, description: 'shop_members.id del mecánico asignado.' })
  @ValidateIf((_, v) => v !== null)
  @IsOptional()
  @IsUUID()
  assigned_member_id?: string | null;

  @ApiPropertyOptional({ example: '2026-10-02T17:00:00-04:00', nullable: true })
  @ValidateIf((_, v) => v !== null)
  @IsOptional()
  @IsISO8601()
  promised_at?: string | null;
}

/** PATCH: todo opcional salvo cliente/vehículo (no se cambian en una OT existente). */
export class UpdateWorkOrderDto extends PartialType(OmitType(CreateWorkOrderDto, ['customer_id', 'vehicle_id'] as const)) {}

export class ListWorkOrdersQuery {
  @ApiPropertyOptional({ enum: WORK_ORDER_STATUSES })
  @IsOptional()
  @IsIn(WORK_ORDER_STATUSES as readonly string[])
  status?: WorkOrderStatus;

  @ApiPropertyOptional({ description: 'Historial de un cliente.' })
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiPropertyOptional({ description: 'Historial de un vehículo.' })
  @IsOptional()
  @IsUUID()
  vehicle_id?: string;

  @ApiPropertyOptional({ description: 'Número de OT: `12` u `OT-0012`.' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  q?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  cursor?: string;
}

@ApiTags('work-orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ShopAccessGuard)
@Controller('shops/:shopId/work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrders: WorkOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Abre una orden de trabajo (queda en draft con número OT-XXXX).' })
  @ApiCreatedResponse({ description: 'OT creada.' })
  create(
    @Param('shopId') shopId: string,
    @CurrentUser() account: AuthenticatedAccount,
    @Body() dto: CreateWorkOrderDto,
  ): Promise<WorkOrderView> {
    return this.workOrders.create(shopId, account.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista OT del taller (filtros: estado, cliente, vehículo; búsqueda por número).' })
  @ApiOkResponse({ description: 'Página de OT, de la más nueva a la más vieja.' })
  list(@Param('shopId') shopId: string, @Query() q: ListWorkOrdersQuery): Promise<Page<WorkOrderView>> {
    return this.workOrders.list(shopId, { ...q, customerId: q.customer_id, vehicleId: q.vehicle_id });
  }

  @Get(':workOrderId')
  @ApiOperation({ summary: 'Detalle de una OT.' })
  @ApiNotFoundResponse({ description: 'No existe en este taller.' })
  get(@Param('shopId') shopId: string, @Param('workOrderId') id: string): Promise<WorkOrderView> {
    return this.workOrders.get(shopId, id);
  }

  @Patch(':workOrderId')
  @ApiOperation({ summary: 'Edita la cabecera de una OT abierta.' })
  @ApiConflictResponse({ description: 'La OT ya está cerrada.' })
  update(
    @Param('shopId') shopId: string,
    @Param('workOrderId') id: string,
    @Body() dto: UpdateWorkOrderDto,
  ): Promise<WorkOrderView> {
    return this.workOrders.update(shopId, id, dto);
  }
}
