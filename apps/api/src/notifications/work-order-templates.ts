import { formatMoney } from '../common/money';
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
