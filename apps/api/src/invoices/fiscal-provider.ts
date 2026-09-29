import { Logger } from '@nestjs/common';

/**
 * Costura hacia la DGII (como `PaymentProvider`): asigna el comprobante fiscal
 * (NCF / e-CF) a una factura emitida. En RD lo hace un proveedor autorizado de
 * facturación electrónica; el comprador enchufa el suyo aquí.
 * Devuelve el NCF, o null si queda pendiente (la factura se emite igual y el
 * NCF se asigna después: el trigger lo permite UNA vez).
 */
export interface FiscalProvider {
  readonly provider: string;
  assignNcf(invoice: { id: string; shopId: string; totalCents: bigint; customerDocumentId: string | null }): Promise<string | null>;
}

export const FISCAL_PROVIDER = Symbol('FISCAL_PROVIDER');

/** Stub: no hay proveedor de e-CF configurado; el NCF queda pendiente. */
export class PendingFiscalProvider implements FiscalProvider {
  readonly provider = 'pending';
  private readonly logger = new Logger(PendingFiscalProvider.name);

  async assignNcf(invoice: { id: string }): Promise<string | null> {
    this.logger.debug(`Factura ${invoice.id}: NCF pendiente (sin proveedor de e-CF configurado)`);
    return null;
  }
}
