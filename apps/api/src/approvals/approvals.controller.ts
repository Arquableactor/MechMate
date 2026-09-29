import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiGoneResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import type { ApprovalRequestView, ItemDecision, PublicApprovalView } from '@repo/types';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsIn, IsString, MaxLength, ValidateNested } from 'class-validator';
import { type AuthenticatedAccount, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ShopAccessGuard } from '../shops/shop-access.guard';
import { ApprovalsService } from './approvals.service';

class ItemDecisionDto {
  @ApiProperty()
  @IsString()
  @MaxLength(64)
  item_id!: string;

  @ApiProperty({ enum: ['approved', 'declined'] })
  @IsIn(['approved', 'declined'])
  decision!: ItemDecision;
}

export class DecideDto {
  @ApiProperty({ type: [ItemDecisionDto] })
  @ValidateNested({ each: true })
  @Type(() => ItemDecisionDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  decisions!: ItemDecisionDto[];
}

/** Lado del TALLER: pedir, listar y revocar aprobaciones de una OT. */
@ApiTags('approvals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ShopAccessGuard)
@Controller('shops/:shopId/work-orders/:workOrderId/approval-requests')
export class ApprovalsController {
  constructor(private readonly approvals: ApprovalsService) {}

  @Post()
  @ApiOperation({
    summary:
      'Pide al cliente aprobar las líneas propuestas: OT → awaiting_approval y aviso con enlace (7 días). ' +
      'Reenviar revoca el enlace anterior.',
  })
  @ApiCreatedResponse({ description: 'Solicitud con el enlace (para compartirlo también por WhatsApp propio).' })
  @ApiConflictResponse({ description: 'OT en otro estado, o sin líneas propuestas.' })
  request(
    @Param('shopId') shopId: string,
    @Param('workOrderId') workOrderId: string,
    @CurrentUser() account: AuthenticatedAccount,
  ): Promise<ApprovalRequestView> {
    return this.approvals.request(shopId, workOrderId, account.id);
  }

  @Get()
  @ApiOperation({ summary: 'Historial de solicitudes de aprobación de la OT.' })
  list(@Param('shopId') shopId: string, @Param('workOrderId') workOrderId: string): Promise<ApprovalRequestView[]> {
    return this.approvals.list(shopId, workOrderId);
  }

  @Post(':approvalId/revoke')
  @HttpCode(200)
  @ApiOperation({ summary: 'Revoca la solicitud pendiente (el enlace deja de servir) y la OT vuelve a draft.' })
  revoke(
    @Param('shopId') shopId: string,
    @Param('workOrderId') workOrderId: string,
    @Param('approvalId') approvalId: string,
    @CurrentUser() account: AuthenticatedAccount,
  ): Promise<ApprovalRequestView> {
    return this.approvals.revoke(shopId, workOrderId, approvalId, account.id);
  }
}

/**
 * Lado del CLIENTE: público, sin cuenta. La única llave es el token firmado del
 * enlace. Un token inválido o desconocido da el mismo 404.
 */
@ApiTags('public')
@Controller('public/approvals')
export class PublicApprovalsController {
  constructor(private readonly approvals: ApprovalsService) {}

  @Get(':token')
  @ApiOperation({ summary: 'Lo que ve el cliente: hallazgos con fotos, líneas y totales.' })
  @ApiOkResponse({ description: 'Presupuesto a aprobar.' })
  @ApiNotFoundResponse({ description: 'Enlace no válido.' })
  view(@Param('token') token: string): Promise<PublicApprovalView> {
    return this.approvals.publicView(token);
  }

  @Post(':token/decisions')
  @HttpCode(200)
  @ApiOperation({ summary: 'El cliente aprueba o rechaza líneas propuestas (puede hacerlo por partes).' })
  @ApiGoneResponse({ description: 'El enlace venció.' })
  @ApiConflictResponse({ description: 'La solicitud ya no admite cambios (completada o revocada).' })
  decide(@Param('token') token: string, @Body() dto: DecideDto): Promise<PublicApprovalView> {
    return this.approvals.decide(token, dto.decisions);
  }
}
