import { formatMoney } from '../common/money';

/** Mensaje listo para enviar, independiente del canal. */
export interface RenderedMessage {
  template: string;
  subject: string;
  body: string;
}

const hello = (name: string | null) => (name ? `Hola ${name},` : 'Hola,');

const when = (iso: string) =>
  new Intl.DateTimeFormat('es-DO', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Santo_Domingo',
  }).format(new Date(iso));

const SIGNATURE = '\n\n— MechMate';

/** Al taller: le entró un pago (monto, comisión y neto a su favor). */
export function paymentReceived(p: {
  ownerName: string | null;
  shopName: string;
  amountCents: bigint;
  commissionCents: bigint;
  netCents: bigint;
  currency: string;
  paymentId: string;
}): RenderedMessage {
  const amount = formatMoney(p.amountCents, p.currency);
  return {
    template: 'payment_received',
    subject: `Pago recibido: ${amount}`,
    body:
      `${hello(p.ownerName)}\n\n` +
      `${p.shopName} recibió un pago.\n\n` +
      `Monto cobrado: ${amount}\n` +
      `Comisión MechMate: ${formatMoney(p.commissionCents, p.currency)}\n` +
      `Neto a tu favor: ${formatMoney(p.netCents, p.currency)}\n\n` +
      `Referencia: ${p.paymentId}` +
      SIGNATURE,
  };
}

/** Al cliente: comprobante de su pago. */
export function paymentReceipt(p: {
  buyerName: string | null;
  shopName: string;
  amountCents: bigint;
  currency: string;
  paymentId: string;
  occurredAt: string;
}): RenderedMessage {
  const amount = formatMoney(p.amountCents, p.currency);
  return {
    template: 'payment_receipt',
    subject: `Tu recibo de pago en ${p.shopName}`,
    body:
      `${hello(p.buyerName)}\n\n` +
      `Confirmamos tu pago en ${p.shopName}.\n\n` +
      `Monto: ${amount}\n` +
      `Fecha: ${when(p.occurredAt)}\n` +
      `Referencia: ${p.paymentId}\n\n` +
      `Guarda este mensaje como comprobante.` +
      SIGNATURE,
  };
}

/** Reembolso: una variante para el taller y otra para el cliente. */
export function paymentRefunded(p: {
  audience: 'shop' | 'buyer';
  name: string | null;
  shopName: string;
  amountCents: bigint;
  currency: string;
  paymentId: string;
}): RenderedMessage {
  const amount = formatMoney(p.amountCents, p.currency);
  const detail =
    p.audience === 'shop'
      ? `Se reembolsó al cliente un pago de ${amount} cobrado en ${p.shopName}. ` +
        `El monto se descuenta de tu saldo.`
      : `Te reembolsamos ${amount} de tu pago en ${p.shopName}. ` +
        `Según tu banco, puede tardar unos días en reflejarse.`;
  return {
    template: p.audience === 'shop' ? 'payment_refunded_shop' : 'payment_refunded_buyer',
    subject: `Reembolso procesado: ${amount}`,
    body: `${hello(p.name)}\n\n${detail}\n\nReferencia: ${p.paymentId}${SIGNATURE}`,
  };
}
