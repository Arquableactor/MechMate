import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import type { ShopMember } from '@prisma/client';
import { SHOP_TYPES, type ShopType, type ShopView } from '@repo/types';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, Length } from 'class-validator';
import { type AuthenticatedAccount, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiView } from '../openapi/api-view.decorator';
import { CurrentMember, ShopAccessGuard } from './shop-access.guard';
import { ShopsService } from './shops.service';

export class CreateShopDto {
  @ApiProperty({ example: 'Taller Hermanos Pérez', minLength: 2, maxLength: 120 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(2, 120)
  name!: string;

  @ApiPropertyOptional({ enum: SHOP_TYPES, description: 'Si no se envía: mechanic_shop.' })
  @IsOptional()
  @IsIn(SHOP_TYPES as readonly string[])
  type?: ShopType;
}

@ApiTags('shops')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shops')
export class ShopsController {
  constructor(private readonly shops: ShopsService) {}

  @Post()
  @ApiOperation({ summary: 'Crea un taller; quien lo crea queda como owner.' })
  @ApiCreatedResponse({ description: 'Taller creado (my_role = owner).' })
  @ApiView('ShopView')
  create(@CurrentUser() account: AuthenticatedAccount, @Body() dto: CreateShopDto): Promise<ShopView> {
    return this.shops.create(account.id, { name: dto.name, type: dto.type ?? 'mechanic_shop' });
  }

  @Get('mine')
  @ApiOperation({
    summary: 'Talleres donde la cuenta actual es miembro activo (reclama antes sus invitaciones).',
  })
  @ApiOkResponse({ description: 'Lista de talleres con mi rol en cada uno.' })
  @ApiView('ShopView', 'array')
  mine(@CurrentUser() account: AuthenticatedAccount): Promise<ShopView[]> {
    return this.shops.listMine(account);
  }

  @Get(':shopId')
  @UseGuards(ShopAccessGuard)
  @ApiOperation({ summary: 'Detalle de un taller (solo miembros).' })
  @ApiOkResponse({ description: 'El taller con mi rol.' })
  @ApiNotFoundResponse({ description: 'No existe o no soy miembro (no se distingue).' })
  @ApiView('ShopView')
  get(@Param('shopId') shopId: string, @CurrentMember() member: ShopMember): Promise<ShopView> {
    return this.shops.getView(shopId, member.role);
  }
}
