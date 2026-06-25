import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Post,
  RawBodyRequest,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { PaymentsService, type WebhookEvent, type WebhookResult } from './payments.service';
import { PAYMENT_PROVIDER, type PaymentProvider } from './providers/payment-provider.interface';

const SUPPORTED_PROVIDERS = new Set(['cardnet']);

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly payments: PaymentsService,
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
  ) {}

  /**
   * Webhook del PSP. Público (lo autentica la **firma**, no un JWT). Verifica la
   * firma sobre el cuerpo **crudo** (`req.rawBody`) antes de confiar en el payload.
   */
  @Post('webhook/:provider')
  @HttpCode(200)
  @ApiOperation({ summary: 'Webhook de pagos (CardNet). Verificación de firma sobre el raw body.' })
  @ApiOkResponse({ description: 'Evento recibido (y aplicado si corresponde).' })
  async webhook(
    @Param('provider') providerName: string,
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-signature') signature?: string,
  ): Promise<WebhookResult> {
    if (!SUPPORTED_PROVIDERS.has(providerName)) {
      throw new NotFoundException(`Proveedor de pagos no soportado: ${providerName}`);
    }
    const rawBody = req.rawBody;
    if (!rawBody || !this.provider.verifyWebhookSignature(rawBody, signature)) {
      throw new UnauthorizedException('Firma de webhook inválida');
    }

    let event: WebhookEvent;
    try {
      event = JSON.parse(rawBody.toString('utf8')) as WebhookEvent;
    } catch {
      throw new BadRequestException('El cuerpo del webhook no es JSON válido');
    }
    return this.payments.handleWebhook(event);
  }
}
