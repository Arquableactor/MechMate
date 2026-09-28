import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
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
import {
  type Page,
  WORK_ORDER_ITEM_TYPES,
  WORK_ORDER_STATUSES,
  type WorkOrderDetailView,
  type WorkOrderItemType,
  type WorkOrderStatus,
  type WorkOrderView,
} from '@repo/types';
import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { type AuthenticatedAccount, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ShopAccessGuard } from '../shops/shop-access.guard';
import { WorkOrderItemsService } from './work-order-items.service';
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

/** Acepta número o string y lo pasa a string (los montos viajan como string). */
const asString = Transform(({ value }) => (typeof value === 'number' ? String(value) : value));

export class AddItemDto {
  @ApiProperty({ enum: WORK_ORDER_ITEM_TYPES, example: 'labor', description: 'labor = mano de obra; part = pieza.' })
  @IsIn(WORK_ORDER_ITEM_TYPES as readonly string[])
  type!: WorkOrderItemType;

  @ApiProperty({ example: 'Cambio de pastillas delanteras', maxLength: 300 })
  @IsString()
  @Length(1, 300)
  description!: string;

  @ApiPropertyOptional({ example: '04465-02220', nullable: true, maxLength: 60 })
  @ValidateIf((_, v) => v !== null)
  @IsOptional()
  @IsString()
  @MaxLength(60)
  part_number?: string | null;

  @ApiProperty({ example: '1.5', description: 'Hasta 3 decimales (horas, unidades, galones…).' })
  @asString
  @IsString()
  @Matches(/^\d{1,6}(\.\d{1,3})?$/, { message: 'quantity: número > 0 con hasta 3 decimales (p. ej. 1.5).' })
  quantity!: string;

  @ApiProperty({ example: '120000', description: 'Centavos como string: "120000" = RD$1,200.00.' })
  @asString
  @IsString()
  @Matches(/^\d{1,13}$/, { message: 'unit_price_cents: centavos enteros >= 0 como string.' })
  unit_price_cents!: string;

  @ApiPropertyOptional({ example: 1800, default: 1800, description: 'ITBIS en basis points (1800 = 18%, 0 = exento).' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  tax_rate_bps?: number;
}

export class UpdateItemDto extends PartialType(AddItemDto) {}

@ApiTags('work-orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ShopAccessGuard)
@Controller('shops/:shopId/work-orders')
export class WorkOrdersController {
  constructor(
    private readonly workOrders: WorkOrdersService,
    private readonly items: WorkOrderItemsService,
  ) {}

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
  @ApiOperation({ summary: 'Detalle de una OT con sus líneas y totales.' })
  @ApiNotFoundResponse({ description: 'No existe en este taller.' })
  get(@Param('shopId') shopId: string, @Param('workOrderId') id: string): Promise<WorkOrderDetailView> {
    return this.workOrders.getDetail(shopId, id);
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

  @Post(':workOrderId/items')
  @ApiOperation({ summary: 'Agrega una línea (mano de obra o pieza); recalcula totales con ITBIS.' })
  @ApiCreatedResponse({ description: 'OT con sus líneas y totales actualizados.' })
  @ApiConflictResponse({ description: 'La OT ya está cerrada.' })
  addItem(
    @Param('shopId') shopId: string,
    @Param('workOrderId') id: string,
    @Body() dto: AddItemDto,
  ): Promise<WorkOrderDetailView> {
    return this.items.add(shopId, id, dto);
  }

  @Patch(':workOrderId/items/:itemId')
  @ApiOperation({ summary: 'Edita una línea; recalcula totales.' })
  @ApiConflictResponse({ description: 'La OT ya está cerrada.' })
  updateItem(
    @Param('shopId') shopId: string,
    @Param('workOrderId') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateItemDto,
  ): Promise<WorkOrderDetailView> {
    return this.items.update(shopId, id, itemId, dto);
  }

  @Delete(':workOrderId/items/:itemId')
  @ApiOperation({ summary: 'Quita una línea; recalcula totales.' })
  @ApiOkResponse({ description: 'OT con sus líneas y totales actualizados.' })
  @ApiConflictResponse({ description: 'La OT ya está cerrada.' })
  removeItem(
    @Param('shopId') shopId: string,
    @Param('workOrderId') id: string,
    @Param('itemId') itemId: string,
  ): Promise<WorkOrderDetailView> {
    return this.items.remove(shopId, id, itemId);
  }
}
