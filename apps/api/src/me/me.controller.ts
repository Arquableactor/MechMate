import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { MeResponse } from '@repo/types';
import { AccountsService } from '../accounts/accounts.service';
import { CurrentUser, type AuthenticatedAccount } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiView } from '../openapi/api-view.decorator';
import { AddRoleDto } from './dto/add-role.dto';

@ApiTags('me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me')
export class MeController {
  constructor(private readonly accounts: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'Perfil + roles del token actual (provisiona en la 1ª llamada).' })
  @ApiOkResponse({ description: 'Cuenta provisionada con sus roles.' })
  @ApiView('MeResponse')
  getMe(@CurrentUser() account: AuthenticatedAccount): MeResponse {
    return this.accounts.toMeResponse(account);
  }

  @Post('roles')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Añade un rol a la cuenta actual. Idempotente; rechaza courier/admin con 400.',
  })
  @ApiOkResponse({ description: 'Cuenta con el rol añadido (o ya existente).' })
  @ApiView('MeResponse')
  async addRole(
    @CurrentUser() account: AuthenticatedAccount,
    @Body() dto: AddRoleDto,
  ): Promise<MeResponse> {
    const updated = await this.accounts.addRole(account.id, dto.role);
    return this.accounts.toMeResponse(updated);
  }
}
