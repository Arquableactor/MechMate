import { BadRequestException, Body, Controller, Headers, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiPaymentRequiredResponse,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { type ChargeView, PAYMENT_METHODS, type PaymentMethod } from '@repo/types';
import { IsIn } from 'class-validator';
import { type AuthenticatedAccount, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiView } from '../openapi/api-view.decorator';
import { FrontDeskOnly, ShopAccessGuard } from '../shops/shop-access.guard';
import { ChargesService } from './charges.service';

export class ChargeDto {
  @ApiProperty({ enum: PAYMENT_METHODS, example: 'card', description: 'El monto sale de la factura: no se envía.' })
  @IsIn(PAYMENT_METHODS as readonly string[], { message: 'method debe ser card, cash o transfer.' })
  method!: PaymentMethod;
}

const IDEMPOTENCY_KEY = /^[A-Za-z0-9_-]{8,100}$/;

@ApiTags('billing')
@ApiBearerAuth()
@FrontDeskOnly()
@UseGuards(JwtAuthGuard, ShopAccessGuard)
@Controller('shops/:shopId/work-orders/:workOrderId/charge')
export class ChargesController {
  constructor(private readonly charges: ChargesService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Cobra la factura de la OT (tarjeta vía CardNet, efectivo o transferencia). OT → paid; con tarjeta, ' +
      'payout al taller a T+2 hábiles. Idempotente: reintentar con la misma Idempotency-Key no cobra de nuevo.',
  })
  @ApiHeader({ name: 'Idempotency-Key', required: true, description: '8–100 caracteres [A-Za-z0-9_-], único por intento de cobro.' })
  @ApiOkResponse({ description: 'Cobro realizado (o su respuesta repetida: replayed=true).' })
  @ApiPaymentRequiredResponse({ description: 'La tarjeta fue rechazada.' })
  @ApiConflictResponse({ description: 'No facturada, ya pagada, cobro en curso, o key reutilizada con otro cobro.' })
  @ApiView('ChargeView')
  charge(
    @Param('shopId') shopId: string,
    @Param('workOrderId') workOrderId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @CurrentUser() account: AuthenticatedAccount,
    @Body() dto: ChargeDto,
  ): Promise<ChargeView> {
    if (!idempotencyKey || !IDEMPOTENCY_KEY.test(idempotencyKey)) {
      throw new BadRequestException('Falta el header Idempotency-Key (8–100 caracteres [A-Za-z0-9_-]).');
    }
    return this.charges.charge(shopId, workOrderId, { method: dto.method, idempotencyKey, accountId: account.id });
  }
}
