import { Injectable } from '@nestjs/common';
import type { HistoryView } from '@repo/types';
import { CustomersService } from '../customers/customers.service';
import { invoiceCode, InvoicesService } from '../invoices/invoices.service';
import { InvoicePaymentsService } from '../payments/invoice-payments.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { WorkOrdersService } from '../work-orders/work-orders.service';

/** El taller opera en pesos dominicanos (las OT nacen en DOP). */
const CURRENCY = 'DOP';

export type HistorySubject = { customerId: string } | { vehicleId: string };

/**
 * Historial de un vehículo o de un cliente dentro del taller: sus OT con la
 * factura y el método de pago, más un resumen (visitas, total gastado, última
 * visita). Solo LEE y cruza por IDs: cada módulo consulta sus propias tablas.
 *  - Vehículo: todas sus OT, aunque haya cambiado de dueño (la historia del carro).
 *  - Cliente: todas sus OT, aunque el vehículo ya no sea suyo (lo que pagó).
 */
@Injectable()
export class HistoryService {
  constructor(
    private readonly customers: CustomersService,
    private readonly vehicles: VehiclesService,
    private readonly workOrders: WorkOrdersService,
    private readonly invoices: InvoicesService,
    private readonly payments: InvoicePaymentsService,
  ) {}

  async get(shopId: string, subject: HistorySubject, page: { limit?: number; cursor?: string }): Promise<HistoryView> {
    // 404 si no es de este taller (también si es de OTRO taller).
    if ('customerId' in subject) await this.customers.assertInShop(shopId, subject.customerId);
    else await this.vehicles.get(shopId, subject.vehicleId);

    const [orders, stats] = await Promise.all([
      this.workOrders.list(shopId, { ...subject, ...page }),
      this.workOrders.historyStats(shopId, subject),
    ]);
    const [invoices, totalSpent] = await Promise.all([
      this.invoices.findByWorkOrders(shopId, orders.items.map((o) => o.id)),
      this.invoices.sumPaid(shopId, stats.paidIds, CURRENCY),
    ]);
    const methods = await this.payments.capturedMethods(shopId, invoices.map((i) => i.id));
    const invoiceByOrder = new Map(invoices.map((i) => [i.work_order_id, i]));

    return {
      summary: {
        visits: stats.visits,
        open_work_orders: stats.open,
        total_spent_cents: totalSpent.toString(),
        currency: CURRENCY,
        last_visit_at: stats.lastVisitAt?.toISOString() ?? null,
      },
      items: orders.items.map((wo) => {
        const inv = invoiceByOrder.get(wo.id);
        const method = inv && methods.get(inv.id);
        return {
          work_order: wo,
          invoice: inv
            ? {
                id: inv.id,
                code: invoiceCode(inv.number),
                status: inv.status,
                ncf: inv.ncf,
                total_cents: inv.total_cents.toString(),
                paid_at: inv.paid_at?.toISOString() ?? null,
              }
            : null,
          payment: method ? { method } : null,
        };
      }),
      next_cursor: orders.next_cursor,
    };
  }
}
