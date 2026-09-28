import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { INVITABLE_SHOP_ROLES, type InvitableShopRole, type ShopMemberView } from '@repo/types';
import { Transform } from 'class-transformer';
import { IsEmail, IsIn } from 'class-validator';
import { type AuthenticatedAccount, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ShopAccessGuard, ShopRoles } from './shop-access.guard';
import { ShopsService } from './shops.service';

export class InviteMemberDto {
  @ApiProperty({ example: 'mecanico@gmail.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'email no es válido.' })
  email!: string;

  @ApiProperty({ enum: INVITABLE_SHOP_ROLES, example: 'mechanic' })
  @IsIn(INVITABLE_SHOP_ROLES as readonly string[], { message: 'role debe ser mechanic o advisor.' })
  role!: InvitableShopRole;
}

@ApiTags('shops')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ShopAccessGuard)
@Controller('shops/:shopId/members')
export class ShopMembersController {
  constructor(private readonly shops: ShopsService) {}

  @Get()
  @ApiOperation({ summary: 'Miembros e invitaciones pendientes del taller (cualquier miembro).' })
  @ApiOkResponse({ description: 'Lista de miembros.' })
  list(@Param('shopId') shopId: string): Promise<ShopMemberView[]> {
    return this.shops.listMembers(shopId);
  }

  @Post()
  @ShopRoles('owner')
  @ApiOperation({
    summary:
      'Invita por email (solo owner). Con cuenta verificada entra al instante; si no, queda invitado y se le avisa por email.',
  })
  @ApiCreatedResponse({ description: 'Miembro activo o invitación pendiente (idempotente).' })
  @ApiConflictResponse({ description: 'Ya es miembro activo del taller.' })
  @ApiForbiddenResponse({ description: 'Solo el owner puede invitar.' })
  invite(
    @Param('shopId') shopId: string,
    @CurrentUser() account: AuthenticatedAccount,
    @Body() dto: InviteMemberDto,
  ): Promise<ShopMemberView> {
    return this.shops.invite(shopId, account, dto);
  }

  @Delete(':memberId')
  @ShopRoles('owner')
  @HttpCode(204)
  @ApiOperation({ summary: 'Quita un miembro o cancela una invitación (solo owner; al owner no).' })
  @ApiNoContentResponse({ description: 'Eliminado.' })
  async remove(@Param('shopId') shopId: string, @Param('memberId') memberId: string): Promise<void> {
    await this.shops.removeMember(shopId, memberId);
  }
}
