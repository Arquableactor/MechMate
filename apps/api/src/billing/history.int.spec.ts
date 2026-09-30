import { randomUUID } from 'node:crypto';
import { NotFoundException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { AccountsService } from '../accounts/accounts.service';
import { CustomersService } from '../customers/customers.service';
import { PendingFiscalProvider } from '../invoices/fiscal-provider';
import { InvoicesService } from '../invoices/invoices.service';
import { LedgerAccountsService } from '../ledger/ledger-accounts.service';
import { LedgerService } from '../ledger/ledger.service';
import { InvoicePaymentsService } from '../payments/invoice-payments.service';
import { CardnetProvider } from '../payments/providers/cardnet.provider';
import { PayoutsService } from '../payouts/payouts.service';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import type { VinService } from '../vin/vin.service';
import { WorkOrderItemsService } from '../work-orders/work-order-items.service';
import { WorkOrdersService } from '../work-orders/work-orders.service';
import { ChargesService } from './charges.service';
import { HistoryService } from './history.service';

/** Historial contra Postgres REAL: OT + factura + método de pago, y el resumen. */
let prisma: PrismaService;
let shops: ShopsService;
let customers: CustomersService;
let vehicles: VehiclesService;
let workOrders: WorkOrdersService;
let items: WorkOrderItemsService;
let invoices: InvoicesService;
let charges: ChargesService;
let history: HistoryService;

beforeAll(async () => {
  prisma = new PrismaService();
  await prisma.$connect();
  shops = new ShopsService(prisma, new AccountsService(prisma));
  customers = new CustomersService(prisma);
  vehicles = new VehiclesService(prisma, customers, {} as VinService);
  workOrders = new WorkOrdersService(prisma, customers, vehicles, shops);
  items = new WorkOrderItemsService(prisma, workOrders);
  invoices = new InvoicesService(prisma, workOrders, customers, vehicles, shops, new PendingFiscalProvider());
  const ledger = new LedgerService(prisma);
  const ledgerAccounts = new LedgerAccountsService(prisma);
  const cardnet = new CardnetProvider({ get: () => 'secreto-de-pruebas' } as unknown as ConfigService);
  const payments = new InvoicePaymentsService(prisma, ledger, ledgerAccounts, cardnet);
  charges = new ChargesService(prisma, workOrders, invoices, payments, new PayoutsService(prisma, ledger, ledgerAccounts, shops), shops);
  history = new HistoryService(customers, vehicles, workOrders, invoices, payments);
});

afterAll(async () => {
  await prisma.$disconnect();
});

const plate = () => `H${String(Math.floor(Math.random() * 1e6)).padStart(6, '0')}`;

/**
 * Taller con María y dos vehículos:
 *  Corolla: OT-1 pagada con tarjeta (2,124.00 con ITBIS), OT-2 pagada en efectivo
 *  (500.00), OT-3 facturada sin pagar (1,000.00), OT-4 en borrador, OT-5 cancelada.
 *  Hilux:   OT-6 pagada por transferencia (300.00).
 */
async function scenario() {
  const owner = await prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } });
  const ctx = { shopId: (await shops.create(owner.id, { name: 'Taller', type: 'mechanic_shop' })).id, ownerId: owner.id };
  const maria = await customers.create(ctx.shopId, { full_name: 'María Gómez' });
  const corolla = await vehicles.create(ctx.shopId, { customer_id: maria.id, plate: plate(), make: 'Toyota', model: 'Corolla' });
  const hilux = await vehicles.create(ctx.shopId, { customer_id: maria.id, plate: plate(), make: 'Toyota', model: 'Hilux' });

  async function order(vehicleId: string, price: string | null, until: 'draft' | 'cancelled' | 'invoiced' | 'card' | 'cash' | 'transfer') {
    const wo = await workOrders.create(ctx.shopId, ctx.ownerId, { customer_id: maria.id, vehicle_id: vehicleId, complaint: 'Revisión', mileage_in: 50000 });
    if (until === 'draft') return wo.id;
    if (until === 'cancelled') {
      await workOrders.transition(ctx.shopId, wo.id, 'cancelled', { accountId: ctx.ownerId, reason: 'El cliente no vino' });
      return wo.id;
    }
    await items.add(ctx.shopId, wo.id, {
      type: 'labor', description: 'Servicio', quantity: '1', unit_price_cents: price!, ...(until === 'card' ? {} : { tax_rate_bps: 0 }),
    });
    await workOrders.transition(ctx.shopId, wo.id, 'in_progress', { accountId: ctx.ownerId });
    await workOrders.transition(ctx.shopId, wo.id, 'completed', { accountId: ctx.ownerId });
    await invoices.issue(ctx.shopId, wo.id, ctx.ownerId);
    if (until !== 'invoiced') {
      await charges.charge(ctx.shopId, wo.id, { method: until, idempotencyKey: `h-${randomUUID()}`, accountId: ctx.ownerId });
    }
    return wo.id;
  }

  const ids = [
    await order(corolla.id, '180000', 'card'),
    await order(corolla.id, '50000', 'cash'),
    await order(corolla.id, '100000', 'invoiced'),
    await order(corolla.id, null, 'draft'),
    await order(corolla.id, null, 'cancelled'),
    await order(hilux.id, '30000', 'transfer'),
  ];
  return { ...ctx, customerId: maria.id, corollaId: corolla.id, hiluxId: hilux.id, ids };
}

describe('Historial (integración, Postgres real)', () => {
  it('vehículo: sus OT (más nueva primero) con factura y método de pago; resumen de visitas, gasto y última visita', async () => {
    const s = await scenario();
    const view = await history.get(s.shopId, { vehicleId: s.corollaId }, {});

    expect(view.summary).toMatchObject({
      visits: 4, // la cancelada no cuenta
      open_work_orders: 1, // el borrador
      total_spent_cents: '262400', // 2,124.00 (tarjeta) + 500.00 (efectivo); la facturada sin pagar NO
      currency: 'DOP',
    });
    const draft = await workOrders.get(s.shopId, s.ids[3]);
    expect(view.summary.last_visit_at).toBe(draft.created_at);

    expect(view.items.map((e) => [e.work_order.code, e.work_order.status, e.invoice?.code ?? null, e.invoice?.status ?? null, e.payment?.method ?? null])).toEqual([
      ['OT-0005', 'cancelled', null, null, null],
      ['OT-0004', 'draft', null, null, null],
      ['OT-0003', 'invoiced', 'FAC-0003', 'issued', null],
      ['OT-0002', 'paid', 'FAC-0002', 'paid', 'cash'],
      ['OT-0001', 'paid', 'FAC-0001', 'paid', 'card'],
    ]);
    expect(view.items[4]).toMatchObject({
      work_order: { mileage_in: 50000, vehicle: { id: s.corollaId, model: 'Corolla' } },
      invoice: { total_cents: '212400', ncf: null },
    });
    expect(view.items[4].invoice?.paid_at).toEqual(expect.any(String));
    expect(view.items.some((e) => e.work_order.vehicle.id === s.hiluxId)).toBe(false);
    expect(view.next_cursor).toBeNull();
  });

  it('cliente: TODAS sus OT (ambos vehículos) y el total gastado incluye la transferencia', async () => {
    const s = await scenario();
    const view = await history.get(s.shopId, { customerId: s.customerId }, {});

    expect(view.summary).toMatchObject({ visits: 5, open_work_orders: 1, total_spent_cents: '292400' });
    expect(view.items).toHaveLength(6);
    expect(view.items[0]).toMatchObject({
      work_order: { code: 'OT-0006', vehicle: { id: s.hiluxId } },
      invoice: { code: 'FAC-0004', status: 'paid' },
      payment: { method: 'transfer' },
    });
  });

  it('paginado: las entradas se parten con el cursor; el resumen es siempre del historial COMPLETO', async () => {
    const s = await scenario();
    const p1 = await history.get(s.shopId, { vehicleId: s.corollaId }, { limit: 2 });
    const p2 = await history.get(s.shopId, { vehicleId: s.corollaId }, { limit: 2, cursor: p1.next_cursor! });
    const p3 = await history.get(s.shopId, { vehicleId: s.corollaId }, { limit: 2, cursor: p2.next_cursor! });

    expect([...p1.items, ...p2.items, ...p3.items].map((e) => e.work_order.code)).toEqual(['OT-0005', 'OT-0004', 'OT-0003', 'OT-0002', 'OT-0001']);
    expect(p3.next_cursor).toBeNull();
    for (const p of [p1, p2, p3]) expect(p.summary).toEqual(p1.summary);
    expect(p1.summary.total_spent_cents).toBe('262400');
  });

  it('sin OT: resumen en cero y sin última visita', async () => {
    const s = await scenario();
    const nuevo = await customers.create(s.shopId, { full_name: 'Cliente Nuevo' });
    expect(await history.get(s.shopId, { customerId: nuevo.id }, {})).toEqual({
      summary: { visits: 0, open_work_orders: 0, total_spent_cents: '0', currency: 'DOP', last_visit_at: null },
      items: [],
      next_cursor: null,
    });
  });

  it('aislamiento: otro taller → 404 (vehículo y cliente); id inválido → 404', async () => {
    const a = await scenario();
    const owner = await prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } });
    const shopB = (await shops.create(owner.id, { name: 'Otro', type: 'mechanic_shop' })).id;

    await expect(history.get(shopB, { vehicleId: a.corollaId }, {})).rejects.toThrow(NotFoundException);
    await expect(history.get(shopB, { customerId: a.customerId }, {})).rejects.toThrow(NotFoundException);
    await expect(history.get(a.shopId, { vehicleId: 'no-es-uuid' }, {})).rejects.toThrow(NotFoundException);
    await expect(history.get(a.shopId, { customerId: randomUUID() }, {})).rejects.toThrow(NotFoundException);
  });
});
