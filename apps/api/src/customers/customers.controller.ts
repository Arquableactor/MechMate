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
import type { CustomerView, Page } from '@repo/types';
import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString, IsUUID, Length, Max, MaxLength, Min, ValidateIf } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiView } from '../openapi/api-view.decorator';
import { ShopAccessGuard } from '../shops/shop-access.guard';
import { CustomersService } from './customers.service';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Juan Pérez', minLength: 2, maxLength: 120 })
  @IsString()
  @Length(2, 120)
  full_name!: string;

  @ApiPropertyOptional({ type: String, example: '809-555-1234', nullable: true, description: 'Se guarda en E.164 (+18095551234).' })
  @ValidateIf((_, v) => v !== null)
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string | null;

  @ApiPropertyOptional({ type: String, example: 'juan@mail.do', nullable: true })
  @ValidateIf((_, v) => v !== null)
  @IsOptional()
  @IsEmail({}, { message: 'email no es válido.' })
  email?: string | null;

  @ApiPropertyOptional({ type: String, example: '001-1234567-8', nullable: true, description: 'Cédula; se guarda en 11 dígitos.' })
  @ValidateIf((_, v) => v !== null)
  @IsOptional()
  @IsString()
  @MaxLength(20)
  document_id?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, maxLength: 1000 })
  @ValidateIf((_, v) => v !== null)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string | null;
}

/** PATCH: todo opcional; `null` borra el dato. */
export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}

export class SearchCustomersQuery {
  @ApiPropertyOptional({ description: 'Nombre, teléfono o cédula (parcial).', example: '809555' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
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

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ShopAccessGuard)
@Controller('shops/:shopId/customers')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Registra un cliente del taller.' })
  @ApiCreatedResponse({ description: 'Cliente creado (teléfono en E.164, cédula en 11 dígitos).' })
  @ApiConflictResponse({ description: 'Ya existe con ese teléfono/cédula; trae existing_customer_id.' })
  @ApiView('CustomerView')
  create(@Param('shopId') shopId: string, @Body() dto: CreateCustomerDto): Promise<CustomerView> {
    return this.customers.create(shopId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Busca clientes por nombre, teléfono o cédula (paginado por cursor).' })
  @ApiOkResponse({ description: 'Página de clientes, del más nuevo al más viejo.' })
  @ApiView('CustomerView', 'page')
  search(@Param('shopId') shopId: string, @Query() query: SearchCustomersQuery): Promise<Page<CustomerView>> {
    return this.customers.search(shopId, query);
  }

  @Get(':customerId')
  @ApiOperation({ summary: 'Detalle de un cliente del taller.' })
  @ApiNotFoundResponse({ description: 'No existe en este taller.' })
  @ApiView('CustomerView')
  get(@Param('shopId') shopId: string, @Param('customerId') customerId: string): Promise<CustomerView> {
    return this.customers.get(shopId, customerId);
  }

  @Patch(':customerId')
  @ApiOperation({ summary: 'Actualiza un cliente (null borra un dato).' })
  @ApiConflictResponse({ description: 'El teléfono/cédula ya es de otro cliente del taller.' })
  @ApiView('CustomerView')
  update(
    @Param('shopId') shopId: string,
    @Param('customerId') customerId: string,
    @Body() dto: UpdateCustomerDto,
  ): Promise<CustomerView> {
    return this.customers.update(shopId, customerId, dto);
  }
}
