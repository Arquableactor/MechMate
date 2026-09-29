import { ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { type Invoice, type InvoiceLine, Prisma } from '@prisma/client';
import type { InvoiceView, Page } from '@repo/types';
import { isUUID } from 'class-validator';
import { CustomersService } from '../customers/customers.service';
import { PrismaService } from '../prisma/prisma.service';
import { nextShopSequence } from '../shops/shop-sequences';
import { ShopsService } from '../shops/shops.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { formatQuantity } from '../work-orders/quantity';
import { TX_OPTIONS, workOrderCode, WorkOrdersService } from '../work-orders/work-orders.service';
import { FISCAL_PROVIDER, type FiscalProvider } from './fiscal-provider';

const SEQUENCE = 'invoice';
const NOT_FOUND = 'Factura no encontrada';
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export const invoiceCode = (n: number) => `FAC-${String(n).padStart(4, '0')}`;

type InvoiceWithLines = Invoice & { lines: InvoiceLine[] };

export function toInvoiceView(i: InvoiceWithLines): InvoiceView {
  return {
    id: i.id,
    number: i.number,
    code: invoiceCode(i.number),
    ncf: i.ncf,
    status: i.status,
    work_order_id: i.work_order_id,
    work_order_code: workOrderCode(i.work_order_number),
    shop_name: i.shop_name,
    customer_name: i.customer_name,
    customer_document_id: i.customer_document_id,
    vehicle_description: i.vehicle_description,
    currency: i.currency,
    subtotal_cents: i.subtotal_cents.toString(),
    tax_cents: i.tax_cents.toString(),
    total_cents: i.total_cents.toString(),
    issued_at: i.issued_at.toISOString(),
    paid_at: i.paid_at?.toISOString() ?? null,
    lines: [...i.lines]
      .sort((a, b) => a.position - b.position)
      .map((l) => ({
        position: l.position,
        type: l.type,
        description: l.description,
        part_number: l.part_number,
        quantity: formatQuantity(l.quantity_milli),
        unit_price_cents: l.unit_price_cents.toString(),
        tax_rate_bps: l.tax_rate_bps,
        subtotal_cents: l.subtotal_cents.toString(),
        tax_cents: l.tax_cents.toString(),
        total_cents: l.total_cents.toString(),
      })),
  };
}

/**
 * Facturación. La factura es un SNAPSHOT inmutable de la OT completada: copia
 * cliente, vehículo, taller y SOLO las líneas aprobadas (ni propuestas sin
 * decidir ni rechazadas). Inmutabilidad y cuadre los garantiza la DB (triggers).
 */
@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly workOrders: WorkOrdersService,
    private readonly customers: CustomersService,
    private readonly vehicles: VehiclesService,
    private readonly shops: ShopsService,
    @Inject(FISCAL_PROVIDER) private readonly fiscal: FiscalProvider,
  ) {}

  /** Emite la factura de una OT completada (OT → invoiced), en UNA tx con la OT bloqueada. */
  async issue(shopId: string, workOrderId: string, accountId: string): Promise<InvoiceView> {
    const header = await this.workOrders.get(shopId, workOrderId); // 404 si no es de este taller
    const [customer, shop] = await Promise.all([
      this.customers.get(shopId, header.customer.id),
      this.shops.getOwnerContact(shopId),
    ]);
    const v = header.vehicle;
    const vehicleDescription =
      [v.make, v.model, v.year].filter(Boolean).join(' ') + (v.plate ? ` (${v.plate})` : '');

    const invoice = await this.prisma.$transaction(async (tx) => {
      const wo = await this.workOrders.lockForUpdate(tx, shopId, workOrderId);
      if (wo.status !== 'completed') {
        throw new ConflictException(
          wo.status === 'invoiced' || wo.status === 'paid'
            ? `La orden ${workOrderCode(wo.number)} ya está facturada.`
            : `La orden ${workOrderCode(wo.number)} está ${wo.status}: solo se factura una orden completada.`,
        );
      }
      const billable = await tx.workOrderItem.findMany({
        where: { work_order_id: wo.id, approval_status: 'approved' },
        orderBy: { id: 'asc' },
      });
      if (billable.length === 0) {
        throw new ConflictException('La orden no tiene líneas aprobadas para facturar.');
      }
      const subtotal = billable.reduce((acc, i) => acc + i.subtotal_cents, 0n);
      const tax = billable.reduce((acc, i) => acc + i.tax_cents, 0n);
      const number = await nextShopSequence(tx, shopId, SEQUENCE);

      const created = await tx.invoice.create({
        data: {
          shop_id: shopId,
          work_order_id: wo.id,
          number,
          shop_name: shop?.shopName ?? 'Taller',
          customer_name: customer.full_name,
          customer_document_id: customer.document_id,
          vehicle_description: vehicleDescription,
          work_order_number: wo.number,
          currency: wo.currency,
          subtotal_cents: subtotal,
          tax_cents: tax,
          total_cents: subtotal + tax,
          issued_by_account_id: accountId,
          lines: {
            // shop_id lo pone Prisma desde la relación (FK compuesta con la factura).
            create: billable.map((i, idx) => ({
              position: idx + 1,
              type: i.type,
              description: i.description,
              part_number: i.part_number,
              quantity_milli: i.quantity_milli,
              unit_price_cents: i.unit_price_cents,
              tax_rate_bps: i.tax_rate_bps,
              subtotal_cents: i.subtotal_cents,
              tax_cents: i.tax_cents,
              total_cents: i.total_cents,
            })),
          },
        },
        include: { lines: true },
      });
      await this.workOrders.changeStatus(tx, shopId, wo, 'invoiced', { accountId });
      return created;
    }, TX_OPTIONS);

    return toInvoiceView(await this.tryAssignNcf(invoice));
  }

  /** Factura emitida de la OT (entidad), o null. Para el cobro. */
  async findIssuable(shopId: string, workOrderId: string): Promise<Invoice | null> {
    return isUUID(workOrderId)
      ? this.prisma.invoice.findFirst({ where: { work_order_id: workOrderId, shop_id: shopId } })
      : null;
  }

  /** Marca la factura pagada en la tx del cobro (el trigger solo permite issued → paid). */
  async markPaid(tx: Prisma.TransactionClient, invoiceId: string): Promise<Invoice> {
    return tx.invoice.update({ where: { id: invoiceId }, data: { status: 'paid', paid_at: new Date() } });
  }

  async getByWorkOrder(shopId: string, workOrderId: string): Promise<InvoiceView> {
    const invoice = isUUID(workOrderId)
      ? await this.prisma.invoice.findFirst({ where: { work_order_id: workOrderId, shop_id: shopId }, include: { lines: true } })
      : null;
    if (!invoice) throw new NotFoundException(NOT_FOUND);
    return toInvoiceView(invoice);
  }

  async get(shopId: string, invoiceId: string): Promise<InvoiceView> {
    const invoice = isUUID(invoiceId)
      ? await this.prisma.invoice.findFirst({ where: { id: invoiceId, shop_id: shopId }, include: { lines: true } })
      : null;
    if (!invoice) throw new NotFoundException(NOT_FOUND);
    return toInvoiceView(invoice);
  }

  /** Facturas del taller, de la más nueva a la más vieja. */
  async list(shopId: string, opts: { limit?: number; cursor?: string }): Promise<Page<InvoiceView>> {
    const limit = Math.min(Math.max(opts.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
    const rows = await this.prisma.invoice.findMany({
      where: { shop_id: shopId },
      include: { lines: true },
      orderBy: { id: 'desc' },
      take: limit + 1,
      ...(opts.cursor && isUUID(opts.cursor) ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    });
    const items = rows.slice(0, limit);
    return { items: items.map(toInvoiceView), next_cursor: rows.length > limit ? items[items.length - 1].id : null };
  }

  /** Pide el NCF al proveedor fiscal. Si falla o queda pendiente, la factura sigue emitida. */
  private async tryAssignNcf(invoice: InvoiceWithLines): Promise<InvoiceWithLines> {
    try {
      const ncf = await this.fiscal.assignNcf({
        id: invoice.id,
        shopId: invoice.shop_id,
        totalCents: invoice.total_cents,
        customerDocumentId: invoice.customer_document_id,
      });
      if (!ncf) return invoice;
      return await this.prisma.invoice.update({ where: { id: invoice.id }, data: { ncf }, include: { lines: true } });
    } catch (error) {
      const detail = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : error instanceof Error ? error.message : String(error);
      this.logger.warn(`Factura ${invoice.id}: no se pudo asignar NCF (${this.fiscal.provider}): ${detail}`);
      return invoice;
    }
  }
}
