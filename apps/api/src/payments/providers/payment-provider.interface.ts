/**
 * Frontera de pagos (CLAUDE.md no-negociable #3): el dominio depende de esta
 * interfaz, no de CardNet. Cambiar de PSP = nuevo adapter, sin tocar el dominio.
 */

export interface CreateIntentParams {
  amountCents: bigint;
  currency: string;
  idempotencyKey: string;
  orderId?: string;
}
export interface PaymentIntentResult {
  providerRef: string;
  status: 'requires_action' | 'captured';
  clientSecret?: string;
}
export interface CaptureParams {
  providerRef: string;
  amountCents: bigint;
}
export interface CaptureResult {
  providerRef: string;
  status: 'captured' | 'failed';
}
export interface RefundParams {
  providerRef: string;
  amountCents: bigint;
}
export interface RefundResult {
  providerRef: string;
  status: 'refunded' | 'failed';
}

export interface PaymentProvider {
  readonly name: string;
  createIntent(params: CreateIntentParams): Promise<PaymentIntentResult>;
  capture(params: CaptureParams): Promise<CaptureResult>;
  refund(params: RefundParams): Promise<RefundResult>;
  /** Verifica la firma del webhook sobre el cuerpo crudo (no parseado). */
  verifyWebhookSignature(rawBody: Buffer, signature: string | undefined): boolean;
}

/** Token DI para inyectar el `PaymentProvider` activo. */
export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');
