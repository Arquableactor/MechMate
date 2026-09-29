import type { PaymentMethod } from '@repo/types';
import { formatMoney } from '../common/money';
import { METHOD_LABEL } from './payment-templates';
import type { RenderedMessage } from './payment-templates';

/** Al cliente del taller: su vehículo está listo para retirar. */
export function workOrderReady(p: {
  customerName: string;
  shopName: string;
  code: string;
  vehicle: string;
  totalCents: bigint;
  currency: string;
}): RenderedMessage {
  return {
    template: 'work_order_ready',
    subject: `Tu vehículo está listo — ${p.shopName}`,
    body:
      `Hola ${p.customerName},\n\n` +
      `Tu ${p.vehicle} ya está listo en ${p.shopName}.\n\n` +
      `Orden: ${p.code}\n` +
      `Total: ${formatMoney(p.totalCents, p.currency)}\n\n` +
      `Puedes pasar a retirarlo cuando gustes.\n\n— MechMate`,
  };
}

/** Al cliente: revisa y aprueba el presupuesto (enlace firmado, vence en 7 días). */
export function approvalRequested(p: {
  customerName: string;
  shopName: string;
  code: string;
  vehicle: string;
  link: string;
}): RenderedMessage {
  return {
    template: 'work_order_approval_requested',
    subject: `Aprueba el presupuesto de tu vehículo — ${p.shopName}`,
    body:
      `Hola ${p.customerName},\n\n` +
      `${p.shopName} revisó tu ${p.vehicle} (orden ${p.code}) y te preparó un presupuesto ` +
      `con fotos de lo que encontró.\n\n` +
      `Míralo y aprueba lo que quieras reparar aquí:\n${p.link}\n\n` +
      `El enlace vence en 7 días. Si no pediste esta revisión, ignora este mensaje.\n\n— MechMate`,
  };
}

/** Al cliente del taller: recibo del pago de su OT. */
export function workOrderReceipt(p: {
  customerName: string;
  shopName: string;
  workOrderCode: string;
  invoiceCode: string;
  ncf: string | null;
  vehicle: string;
  totalCents: bigint;
  currency: string;
  method: PaymentMethod;
  paidAt: string;
}): RenderedMessage {
  const total = formatMoney(p.totalCents, p.currency);
  const when = new Intl.DateTimeFormat('es-DO', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Santo_Domingo',
  }).format(new Date(p.paidAt));
  return {
    template: 'work_order_receipt',
    subject: `Recibo de pago ${p.invoiceCode} — ${p.shopName}`,
    body:
      `Hola ${p.customerName},\n\n` +
      `Recibimos tu pago. Gracias por confiar en ${p.shopName}.\n\n` +
      `Vehículo: ${p.vehicle}\n` +
      `Orden: ${p.workOrderCode}\n` +
      `Factura: ${p.invoiceCode}\n` +
      `NCF: ${p.ncf ?? 'pendiente (te lo enviaremos cuando se emita)'}\n` +
      `Pagado: ${total} (${METHOD_LABEL[p.method]})\n` +
      `Fecha: ${when}\n\n` +
      `Guarda este mensaje como comprobante.\n\n— MechMate`,
  };
}
