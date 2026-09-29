import { randomUUID } from 'node:crypto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { CustomersService } from '../customers/customers.service';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import type { VinService } from '../vin/vin.service';
import { WorkOrderItemsService } from '../work-orders/work-order-items.service';
import { WorkOrdersService } from '../work-orders/work-orders.service';
import { PendingFiscalProvider } from './fiscal-provider';
import { InvoicesService } from './invoices.service';

/** Facturación contra Postgres REAL: snapshot, numeración y triggers de inmutabilidad/cuadre. */
let prisma: PrismaService;
let invoices: InvoicesService;
let workOrders: WorkOrdersService;
let items: WorkOrderItemsService;
let shops: ShopsService;
let customers: CustomersService;
let vehicles: VehiclesService;

beforeAll(async () => {
  prisma = new PrismaService();
  await prisma.$connect();
  shops = new ShopsService(prisma, new AccountsService(prisma));
  customers = new CustomersService(prisma);
  vehicles = new VehiclesService(prisma, customers, {} as VinService);
  workOrders = new WorkOrdersService(prisma, customers, vehicles, shops);
  items = new WorkOrderItemsService(prisma, workOrders);
  invoices = new InvoicesService(prisma, workOrders, customers, vehicles, shops, new PendingFiscalProvider());
});

afterAll(async () => {
  await prisma.$disconnect();
});

/**
 * OT completada con: mano de obra aprobada (1.5 h × 1,200 + ITBIS), pieza
 * aprobada exenta (900), y pieza que el cliente RECHAZÓ (5,000).
 */
async function completedWorkOrder(shopId?: string, ownerId?: string) {
  if (!shopId || !ownerId) {
    const owner = await prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } });
    ownerId = owner.id;
    shopId = (await shops.create(owner.id, { name: 'Taller Hermanos Pérez', type: 'mechanic_shop' })).id;
  }
  // Cédula distinta por cliente: es única dentro del taller.
  const cedula = `001${String(Math.floor(Math.random() * 1e8)).padStart(8, '0')}`;
  const customer = await customers.create(shopId, { full_name: 'María Gómez', document_id: cedula });
  const vehicle = await vehicles.create(shopId, {
    customer_id: customer.id,
    plate: `F${String(Math.floor(Math.random() * 1e6)).padStart(6, '0')}`,
    make: 'Toyota',
    model: 'Corolla',
    year: 2019,
  });
  const wo = await workOrders.create(shopId, ownerId, { customer_id: customer.id, vehicle_id: vehicle.id, complaint: 'Frenos' });
  await items.add(shopId, wo.id, { type: 'labor', description: 'Cambio de pastillas', quantity: '1.5', unit_price_cents: '120000' });
  await items.add(shopId, wo.id, { type: 'part', description: 'Aceite', quantity: '1', unit_price_cents: '90000', tax_rate_bps: 0 });
  const withDeclined = await items.add(shopId, wo.id, {
    type: 'part', description: 'Amortiguadores', quantity: '1', unit_price_cents: '500000', requires_approval: true,
  });
  await prisma.workOrderItem.update({
    where: { id: withDeclined.items[2].id },
    data: { approval_status: 'declined', decided_at: new Date() },
  });
  await workOrders.transition(shopId, wo.id, 'in_progress', { accountId: ownerId });
  await workOrders.transition(shopId, wo.id, 'completed', { accountId: ownerId });
  return { shopId, ownerId, woId: wo.id, customerId: customer.id };
}

describe('Facturación (integración, Postgres real)', () => {
  it('factura: FAC-0001, SOLO líneas aprobadas, snapshot del cliente/vehículo, OT → invoiced, NCF pendiente', async () => {
    const { shopId, ownerId, woId } = await completedWorkOrder();
    const inv = await invoices.issue(shopId, woId, ownerId);

    expect(inv).toMatchObject({
      code: 'FAC-0001',
      status: 'issued',
      ncf: null,
      work_order_code: 'OT-0001',
      shop_name: 'Taller Hermanos Pérez',
      customer_name: 'María Gómez',
      subtotal_cents: '270000', // 1,800 + 900 (sin los amortiguadores rechazados)
      tax_cents: '32400', // ITBIS solo de la mano de obra
      total_cents: '302400',
    });
    expect(inv.vehicle_description).toMatch(/^Toyota Corolla 2019 \(F\d{6}\)$/);
    expect(inv.customer_document_id).toMatch(/^001\d{8}$/);
    expect(inv.lines.map((l) => [l.position, l.description, l.quantity, l.total_cents])).toEqual([
      [1, 'Cambio de pastillas', '1.5', '212400'],
      [2, 'Aceite', '1', '90000'],
    ]);
    expect((await workOrders.get(shopId, woId)).status).toBe('invoiced');
  });

  it('numeración por taller: FAC-0001, FAC-0002 en uno; el otro taller empieza en 1', async () => {
    const a = await completedWorkOrder();
    const a2 = await completedWorkOrder(a.shopId, a.ownerId);
    const b = await completedWorkOrder();

    expect((await invoices.issue(a.shopId, a.woId, a.ownerId)).code).toBe('FAC-0001');
    expect((await invoices.issue(a.shopId, a2.woId, a.ownerId)).code).toBe('FAC-0002');
    expect((await invoices.issue(b.shopId, b.woId, b.ownerId)).code).toBe('FAC-0001');
  });

  it('409: OT no completada, ya facturada, o sin líneas aprobadas', async () => {
    const { shopId, ownerId, woId } = await completedWorkOrder();
    await invoices.issue(shopId, woId, ownerId);
    await expect(invoices.issue(shopId, woId, ownerId)).rejects.toThrow(/ya está facturada/);

    const customer = await customers.create(shopId, { full_name: 'Otro Cliente' });
    const vehicle = await vehicles.create(shopId, { customer_id: customer.id, plate: `G${Date.now() % 1e6}`, make: 'Kia' });
    const draft = await workOrders.create(shopId, ownerId, { customer_id: customer.id, vehicle_id: vehicle.id, complaint: 'x y' });
    await expect(invoices.issue(shopId, draft.id, ownerId)).rejects.toThrow(/solo se factura una orden completada/);

    // Completada pero con todas sus líneas rechazadas.
    const onlyDeclined = await items.add(shopId, draft.id, { type: 'part', description: 'x', quantity: '1', unit_price_cents: '100' });
    await prisma.workOrderItem.update({ where: { id: onlyDeclined.items[0].id }, data: { approval_status: 'declined', decided_at: new Date() } });
    await workOrders.transition(shopId, draft.id, 'in_progress', { accountId: ownerId });
    await workOrders.transition(shopId, draft.id, 'completed', { accountId: ownerId });
    await expect(invoices.issue(shopId, draft.id, ownerId)).rejects.toThrow(/sin líneas aprobadas|no tiene líneas aprobadas/);
  });

  it('concurrencia: facturar dos veces a la vez → UNA factura', async () => {
    const { shopId, ownerId, woId } = await completedWorkOrder();
    const results = await Promise.allSettled([invoices.issue(shopId, woId, ownerId), invoices.issue(shopId, woId, ownerId)]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const rejected = results.find((r) => r.status === 'rejected') as PromiseRejectedResult;
    expect(rejected.reason).toBeInstanceOf(ConflictException);
    expect(await prisma.invoice.count({ where: { work_order_id: woId } })).toBe(1);
  });

  it('snapshot: editar después al cliente NO cambia la factura', async () => {
    const { shopId, ownerId, woId, customerId } = await completedWorkOrder();
    const inv = await invoices.issue(shopId, woId, ownerId);
    await customers.update(shopId, customerId, { full_name: 'María Gómez de Peña' });
    expect((await invoices.get(shopId, inv.id)).customer_name).toBe('María Gómez');
  });

  it('aislamiento: otro taller no ve ni factura (404)', async () => {
    const a = await completedWorkOrder();
    const b = await completedWorkOrder();
    const inv = await invoices.issue(a.shopId, a.woId, a.ownerId);

    await expect(invoices.get(b.shopId, inv.id)).rejects.toThrow(NotFoundException);
    await expect(invoices.getByWorkOrder(b.shopId, a.woId)).rejects.toThrow(NotFoundException);
    await expect(invoices.issue(b.shopId, a.woId, b.ownerId)).rejects.toThrow(NotFoundException);
    expect((await invoices.list(b.shopId, {})).items.map((i) => i.id)).not.toContain(inv.id);
  });

  describe('garantías EN LA DB (aunque alguien se salte el servicio)', () => {
    async function issued() {
      const ctx = await completedWorkOrder();
      return { ...ctx, inv: await invoices.issue(ctx.shopId, ctx.woId, ctx.ownerId) };
    }

    it('no se cambian montos, snapshot ni número de una factura', async () => {
      const { inv } = await issued();
      for (const data of [{ total_cents: 1n }, { customer_name: 'Otro' }, { number: 99 }]) {
        await expect(prisma.invoice.update({ where: { id: inv.id }, data })).rejects.toThrow(/inmutable/);
      }
    });

    it('no se borra la factura ni se tocan sus líneas', async () => {
      const { inv } = await issued();
      await expect(prisma.invoice.delete({ where: { id: inv.id } })).rejects.toThrow(/inmutable/);
      const line = await prisma.invoiceLine.findFirstOrThrow({ where: { invoice_id: inv.id } });
      await expect(prisma.invoiceLine.update({ where: { id: line.id }, data: { description: 'x' } })).rejects.toThrow(/inmutable/);
      await expect(prisma.invoiceLine.delete({ where: { id: line.id } })).rejects.toThrow(/inmutable/);
    });

    it('estado: issued → paid (con paid_at) sí; paid → issued no; paid sin paid_at no', async () => {
      const { inv } = await issued();
      await expect(prisma.invoice.update({ where: { id: inv.id }, data: { status: 'paid' } })).rejects.toThrow(/invoices_paid_at_check/);
      await prisma.invoice.update({ where: { id: inv.id }, data: { status: 'paid', paid_at: new Date() } });
      await expect(
        prisma.invoice.update({ where: { id: inv.id }, data: { status: 'issued', paid_at: null } }),
      ).rejects.toThrow(/transición de estado inválida/);
    });

    it('NCF: formato de la DGII, se asigna UNA vez', async () => {
      const { inv } = await issued();
      await expect(prisma.invoice.update({ where: { id: inv.id }, data: { ncf: 'XYZ' } })).rejects.toThrow(/invoices_ncf_format_check/);
      await prisma.invoice.update({ where: { id: inv.id }, data: { ncf: 'E310000000001' } });
      await expect(prisma.invoice.update({ where: { id: inv.id }, data: { ncf: 'E310000000002' } })).rejects.toThrow(/NCF ya asignado/);
    });

    it('cuadre al COMMIT: líneas que no suman los totales, o factura sin líneas → rechazada', async () => {
      const { shopId, ownerId } = await issued();
      const other = await completedWorkOrder(shopId, ownerId);
      const base = {
        shop_id: shopId, work_order_id: other.woId, number: 900, shop_name: 'T', customer_name: 'C',
        vehicle_description: 'V', work_order_number: 900, currency: 'DOP', issued_by_account_id: ownerId,
      };
      await expect(
        prisma.invoice.create({
          data: {
            ...base, subtotal_cents: 1000n, tax_cents: 0n, total_cents: 1000n,
            lines: { create: [{ position: 1, type: 'part', description: 'x', quantity_milli: 1000, unit_price_cents: 999n, tax_rate_bps: 0, subtotal_cents: 999n, tax_cents: 0n, total_cents: 999n }] },
          },
        }),
      ).rejects.toThrow(/descuadrada/);
      await expect(
        prisma.invoice.create({ data: { ...base, number: 901, subtotal_cents: 0n, tax_cents: 0n, total_cents: 0n } }),
      ).rejects.toThrow(/sin líneas/);
    });
  });
});
