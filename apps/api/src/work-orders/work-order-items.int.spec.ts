import { randomUUID } from 'node:crypto';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { CustomersService } from '../customers/customers.service';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import type { VinService } from '../vin/vin.service';
import { WorkOrderItemsService } from './work-order-items.service';
import { WorkOrdersService } from './work-orders.service';

/** Líneas de OT contra Postgres REAL: totales, bloqueo de la OT y CHECKs de dinero. */
let prisma: PrismaService;
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
});

afterAll(async () => {
  await prisma.$disconnect();
});

async function newWorkOrder() {
  const owner = await prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } });
  const shopId = (await shops.create(owner.id, { name: 'Taller', type: 'mechanic_shop' })).id;
  const customer = await customers.create(shopId, { full_name: 'Cliente' });
  const vehicle = await vehicles.create(shopId, {
    customer_id: customer.id,
    plate: `I${String(Math.floor(Math.random() * 1e6)).padStart(6, '0')}`,
    make: 'Honda',
  });
  const wo = await workOrders.create(shopId, owner.id, {
    customer_id: customer.id,
    vehicle_id: vehicle.id,
    complaint: 'Frenos',
  });
  return { shopId, woId: wo.id };
}

const labor = { type: 'labor' as const, description: 'Cambio de pastillas', quantity: '1.5', unit_price_cents: '120000' };
const part = { type: 'part' as const, description: 'Pastillas delanteras', quantity: '1', unit_price_cents: '350000' };

describe('Líneas de OT (integración, Postgres real)', () => {
  it('agregar: calcula la línea (1.5 h × 1,200 + ITBIS) y los totales de la OT', async () => {
    const { shopId, woId } = await newWorkOrder();
    const detail = await items.add(shopId, woId, labor);

    expect(detail.items).toHaveLength(1);
    expect(detail.items[0]).toMatchObject({
      type: 'labor',
      quantity: '1.5',
      unit_price_cents: '120000',
      tax_rate_bps: 1800,
      subtotal_cents: '180000',
      tax_cents: '32400',
      total_cents: '212400',
    });
    expect(detail).toMatchObject({ subtotal_cents: '180000', tax_cents: '32400', total_cents: '212400' });
  });

  it('varias líneas (una exenta): el total de la OT es la suma de las líneas', async () => {
    const { shopId, woId } = await newWorkOrder();
    await items.add(shopId, woId, labor); // 1,800.00 + 324.00
    await items.add(shopId, woId, part); // 3,500.00 + 630.00
    const detail = await items.add(shopId, woId, { ...part, description: 'Aceite (exento)', unit_price_cents: '90000', tax_rate_bps: 0 });

    expect(detail.items.map((i) => i.description)).toEqual(['Cambio de pastillas', 'Pastillas delanteras', 'Aceite (exento)']);
    expect(detail).toMatchObject({ subtotal_cents: '620000', tax_cents: '95400', total_cents: '715400' });
  });

  it('editar y quitar líneas recalcula los totales', async () => {
    const { shopId, woId } = await newWorkOrder();
    const withLabor = await items.add(shopId, woId, labor);
    await items.add(shopId, woId, part);

    const edited = await items.update(shopId, woId, withLabor.items[0].id, { quantity: '2', tax_rate_bps: 0 });
    expect(edited.items[0]).toMatchObject({ quantity: '2', subtotal_cents: '240000', tax_cents: '0', total_cents: '240000' });
    expect(edited).toMatchObject({ subtotal_cents: '590000', tax_cents: '63000', total_cents: '653000' });

    const removed = await items.remove(shopId, woId, withLabor.items[0].id);
    expect(removed.items).toHaveLength(1);
    expect(removed).toMatchObject({ subtotal_cents: '350000', tax_cents: '63000', total_cents: '413000' });

    const empty = await items.remove(shopId, woId, removed.items[0].id);
    expect(empty).toMatchObject({ items: [], subtotal_cents: '0', tax_cents: '0', total_cents: '0' });
  });

  it('concurrencia: 30 líneas a la vez (3 rondas) → el total es EXACTAMENTE la suma', async () => {
    // Pool propio amplio: con el pool de 5 del resto de los tests las tx casi no
    // se cruzan y la carrera (sin FOR UPDATE, 15 de 15 OT con total mal) no se ve.
    const url = new URL(process.env.DATABASE_URL!);
    url.searchParams.set('connection_limit', '20');
    const wide = new PrismaService({ datasources: { db: { url: url.toString() } } });
    const wideItems = new WorkOrderItemsService(wide, new WorkOrdersService(wide, customers, vehicles, shops));
    try {
      for (let round = 0; round < 3; round++) {
        const { shopId, woId } = await newWorkOrder();
        await Promise.all(
          Array.from({ length: 30 }, (_, i) =>
            wideItems.add(shopId, woId, { ...part, description: `Pieza ${i}`, unit_price_cents: String(1000 + i) }),
          ),
        );
        const detail = await workOrders.getDetail(shopId, woId);
        const sum = (k: 'subtotal_cents' | 'tax_cents') => detail.items.reduce((acc, i) => acc + BigInt(i[k]), 0n);
        expect(detail.items).toHaveLength(30);
        // Como texto (así viajan en la API): un BigInt en el mensaje de fallo
        // rompe el reporte de Jest entre workers y oculta la falla.
        expect(detail.subtotal_cents).toBe(sum('subtotal_cents').toString());
        expect(detail.tax_cents).toBe(sum('tax_cents').toString());
      }
    } finally {
      await wide.$disconnect();
    }
  });

  it('OT cerrada: no se agregan, editan ni quitan líneas (409)', async () => {
    const { shopId, woId } = await newWorkOrder();
    const detail = await items.add(shopId, woId, labor);
    await prisma.workOrder.update({ where: { id: woId }, data: { status: 'completed' } });

    await expect(items.add(shopId, woId, part)).rejects.toThrow(ConflictException);
    await expect(items.update(shopId, woId, detail.items[0].id, { quantity: '3' })).rejects.toThrow(ConflictException);
    await expect(items.remove(shopId, woId, detail.items[0].id)).rejects.toThrow(ConflictException);
  });

  it('aislamiento: OT de otro taller o línea de otra OT → 404', async () => {
    const a = await newWorkOrder();
    const b = await newWorkOrder();
    const lineOfA = (await items.add(a.shopId, a.woId, labor)).items[0];

    await expect(items.add(b.shopId, a.woId, part)).rejects.toThrow(NotFoundException);
    await expect(items.update(b.shopId, b.woId, lineOfA.id, { quantity: '9' })).rejects.toThrow(NotFoundException);
    await expect(items.remove(b.shopId, b.woId, lineOfA.id)).rejects.toThrow(NotFoundException);
    await expect(items.add(a.shopId, 'no-uuid', part)).rejects.toThrow(NotFoundException);
    expect((await workOrders.getDetail(a.shopId, a.woId)).items[0].quantity).toBe('1.5');
  });

  it('entradas inválidas → 400 (cantidad, precio, descripción)', async () => {
    const { shopId, woId } = await newWorkOrder();
    for (const bad of [
      { ...labor, quantity: '0' },
      { ...labor, quantity: '1.2345' },
      { ...labor, unit_price_cents: '-5' },
      { ...labor, unit_price_cents: '12.50' },
      { ...labor, description: '   ' },
    ]) {
      await expect(items.add(shopId, woId, bad)).rejects.toThrow(BadRequestException);
    }
  });

  it('la DB rechaza una línea con la aritmética mal (CHECK), aunque se salte el servicio', async () => {
    const { shopId, woId } = await newWorkOrder();
    const base = {
      shop_id: shopId, work_order_id: woId, type: 'part' as const, description: 'x',
      quantity_milli: 1000, unit_price_cents: 10000n, tax_rate_bps: 1800,
    };
    await expect(
      prisma.workOrderItem.create({ data: { ...base, subtotal_cents: 10001n, tax_cents: 1800n, total_cents: 11801n } }),
    ).rejects.toThrow(/work_order_items_subtotal_check/);
    await expect(
      prisma.workOrderItem.create({ data: { ...base, subtotal_cents: 10000n, tax_cents: 1700n, total_cents: 11700n } }),
    ).rejects.toThrow(/work_order_items_tax_check/);
    await expect(
      prisma.workOrderItem.create({ data: { ...base, subtotal_cents: 10000n, tax_cents: 1800n, total_cents: 12000n } }),
    ).rejects.toThrow(/work_order_items_total_check/);
  });
});
