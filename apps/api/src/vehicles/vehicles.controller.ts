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
  PartialType,
} from '@nestjs/swagger';
import type { Page, VehicleView } from '@repo/types';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Length, Max, MaxLength, Min, ValidateIf } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiView } from '../openapi/api-view.decorator';
import { FrontDeskOnly, ShopAccessGuard } from '../shops/shop-access.guard';
import { VehiclesService } from './vehicles.service';

/** Texto opcional que acepta `null` para borrar. */
const nullableText = (max: number) => [ValidateIf((_, v) => v !== null), IsOptional(), IsString(), MaxLength(max)];
const apply = (decorators: PropertyDecorator[]): PropertyDecorator => (target, key) =>
  decorators.forEach((d) => d(target, key));

export class CreateVehicleDto {
  @ApiProperty({ description: 'Cliente dueño (del mismo taller).' })
  @IsUUID()
  customer_id!: string;

  @ApiPropertyOptional({ type: String, example: '1HGCM82633A004352', nullable: true, description: 'Si viene, autocompleta marca/modelo/año/motor.' })
  @apply(nullableText(25))
  vin?: string | null;

  @ApiPropertyOptional({ type: String, example: 'NZE121-1234567', nullable: true, description: 'Para vehículos sin VIN (p. ej. japoneses).' })
  @apply(nullableText(30))
  chassis_number?: string | null;

  @ApiPropertyOptional({ type: String, example: 'A123456', nullable: true })
  @apply(nullableText(15))
  plate?: string | null;

  @ApiPropertyOptional({ example: 'Toyota', description: 'Obligatoria si no hay VIN decodificable.' })
  @IsOptional()
  @IsString()
  @Length(1, 60)
  make?: string;

  @ApiPropertyOptional({ type: String, example: 'Corolla', nullable: true })
  @apply(nullableText(60))
  model?: string | null;

  @ApiPropertyOptional({ type: 'integer', example: 2019, nullable: true })
  @ValidateIf((_, v) => v !== null)
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  year?: number | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @apply(nullableText(60))
  trim?: string | null;

  @ApiPropertyOptional({ type: String, example: '1.8L 4 cil.', nullable: true })
  @apply(nullableText(60))
  engine?: string | null;

  @ApiPropertyOptional({ type: String, example: 'Gasolina', nullable: true })
  @apply(nullableText(40))
  fuel_type?: string | null;

  @ApiPropertyOptional({ type: String, example: 'Gris', nullable: true })
  @apply(nullableText(40))
  color?: string | null;

  @ApiPropertyOptional({ type: 'integer', example: 85000, nullable: true })
  @ValidateIf((_, v) => v !== null)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3_000_000)
  mileage_km?: number | null;

  @ApiPropertyOptional({ type: String, nullable: true, maxLength: 1000 })
  @apply(nullableText(1000))
  notes?: string | null;
}

/** PATCH: todo opcional (incluido cambiar de dueño); `null` borra el dato. */
export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {}

export class SearchVehiclesQuery {
  @ApiPropertyOptional({ description: 'Placa, VIN, chasis (parciales) o marca/modelo.', example: 'A123' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  q?: string;

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

class SearchAllVehiclesQuery extends SearchVehiclesQuery {
  @ApiPropertyOptional({ description: 'Solo los vehículos de este cliente.' })
  @IsOptional()
  @IsUUID()
  customer_id?: string;
}

@ApiTags('vehicles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ShopAccessGuard)
@Controller('shops/:shopId')
export class VehiclesController {
  constructor(private readonly vehicles: VehiclesService) {}

  @Post('vehicles')
  @FrontDeskOnly()
  @ApiOperation({ summary: 'Registra un vehículo. Con VIN se autocompleta; sin VIN, carga manual.' })
  @ApiCreatedResponse({ description: 'Vehículo creado (data_source: vin_decode | manual).' })
  @ApiConflictResponse({ description: 'VIN/chasis/placa ya registrado en el taller; trae existing_vehicle_id.' })
  @ApiView('VehicleView')
  create(@Param('shopId') shopId: string, @Body() dto: CreateVehicleDto): Promise<VehicleView> {
    return this.vehicles.create(shopId, dto);
  }

  @Get('vehicles')
  @ApiOperation({ summary: 'Busca vehículos del taller (placa, VIN, chasis, marca/modelo).' })
  @ApiOkResponse({ description: 'Página de vehículos, del más nuevo al más viejo.' })
  @ApiView('VehicleView', 'page')
  search(@Param('shopId') shopId: string, @Query() query: SearchAllVehiclesQuery): Promise<Page<VehicleView>> {
    return this.vehicles.search(shopId, { ...query, customerId: query.customer_id });
  }

  @Get('vehicles/:vehicleId')
  @ApiOperation({ summary: 'Detalle de un vehículo del taller.' })
  @ApiNotFoundResponse({ description: 'No existe en este taller.' })
  @ApiView('VehicleView')
  get(@Param('shopId') shopId: string, @Param('vehicleId') vehicleId: string): Promise<VehicleView> {
    return this.vehicles.get(shopId, vehicleId);
  }

  @Patch('vehicles/:vehicleId')
  @FrontDeskOnly()
  @ApiOperation({ summary: 'Actualiza un vehículo (kilometraje, placa, dueño…). null borra un dato.' })
  @ApiView('VehicleView')
  update(
    @Param('shopId') shopId: string,
    @Param('vehicleId') vehicleId: string,
    @Body() dto: UpdateVehicleDto,
  ): Promise<VehicleView> {
    return this.vehicles.update(shopId, vehicleId, dto);
  }

  @Get('customers/:customerId/vehicles')
  @ApiOperation({ summary: 'Vehículos de un cliente del taller.' })
  @ApiNotFoundResponse({ description: 'El cliente no existe en este taller.' })
  @ApiView('VehicleView', 'page')
  byCustomer(
    @Param('shopId') shopId: string,
    @Param('customerId') customerId: string,
    @Query() query: SearchVehiclesQuery,
  ): Promise<Page<VehicleView>> {
    return this.vehicles.search(shopId, { ...query, customerId });
  }
}
