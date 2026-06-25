import { createHmac, timingSafeEqual } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CaptureParams,
  CaptureResult,
  CreateIntentParams,
  PaymentIntentResult,
  PaymentProvider,
  RefundParams,
  RefundResult,
} from './payment-provider.interface';

/**
 * Adapter de CardNet (RD). Por ahora corre en **sandbox/mock determinista**: el
 * comprador enchufa credenciales reales después (costura limpia — las llamadas
 * HTTP reales van aquí cuando `CARDNET_API_BASE` apunte a producción). Nunca
 * toca el PAN: los pagos están 100% delegados.
 */
@Injectable()
export class CardnetProvider implements PaymentProvider {
  readonly name = 'cardnet';
  private readonly logger = new Logger(CardnetProvider.name);
  private readonly webhookSecret: string;

  constructor(config: ConfigService) {
    // Fail-closed: en producción el secreto es obligatorio. Sin él, NO caemos a
    // un valor conocido (eso permitiría forjar firmas de webhook). En dev/test se
    // permite un secreto efímero solo para poder arrancar.
    const secret = config.get<string>('CARDNET_WEBHOOK_SECRET');
    if (secret) {
      this.webhookSecret = secret;
    } else if (process.env.NODE_ENV === 'production') {
      throw new Error('CARDNET_WEBHOOK_SECRET es obligatorio en producción');
    } else {
      this.logger.warn(
        'CARDNET_WEBHOOK_SECRET no definido; usando secreto de desarrollo (NO usar en producción)',
      );
      this.webhookSecret = 'dev-only-insecure-secret';
    }
  }

  async createIntent(params: CreateIntentParams): Promise<PaymentIntentResult> {
    return { providerRef: `cardnet_mock_${params.idempotencyKey}`, status: 'requires_action' };
  }

  async capture(params: CaptureParams): Promise<CaptureResult> {
    // Mock determinista: la captura siempre sucede. El real llamaría a CardNet.
    return { providerRef: params.providerRef, status: 'captured' };
  }

  async refund(params: RefundParams): Promise<RefundResult> {
    return { providerRef: params.providerRef, status: 'refunded' };
  }

  verifyWebhookSignature(rawBody: Buffer, signature: string | undefined): boolean {
    if (!signature) return false;
    const expected = createHmac('sha256', this.webhookSecret).update(rawBody).digest('hex');
    const provided = Buffer.from(signature, 'utf8');
    const expectedBuf = Buffer.from(expected, 'utf8');
    if (provided.length !== expectedBuf.length) return false;
    return timingSafeEqual(provided, expectedBuf);
  }
}
