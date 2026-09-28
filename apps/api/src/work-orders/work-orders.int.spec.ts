import { randomUUID } from 'node:crypto';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { CustomersService } from '../customers/customers.service';
import { PrismaService } from '../prisma/prisma.service';
import { nextShopSequence } from '../shops/shop-sequences';
import { ShopsService } from '../shops/shops.service';
import type { VinService } from '../vin/vin.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { WorkOrdersService } from './work-orders.service';

/** OT contra Postgres REAL: numeración atómica, FKs compuestas y aislamiento. */
let prisma: PrismaService;
let shops: ShopsService;
let customers: CustomersService;
let vehicles: VehiclesService;
let workOrders: WorkOrdersService;

beforeAll(async () => {
  prisma = new PrismaService();
  await prisma.$connect();
  shops = new ShopsService(prisma, new AccountsService(prisma));
  customers = new CustomersService(prisma);
  vehicles = new VehiclesService(prisma, customers, {} as VinService); // sin VIN en estos tests
  workOrders = new WorkOrdersService(prisma, customers, vehicles, shops);
});

afterAll(async () => {
  await prisma.$disconnect();
});

const plate = () => `P${String(Math.floor(Math.random() * 1e6)).padStart(6, '0')}`;

async function setup(mileage?: number) {
  const owner = await prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } });
  const shopId = (await shops.create(owner.id, { name: 'Taller', type: 'mechanic_shop' })).id;
  const customer = await customers.create(shopId, { full_name: 'María Gómez' });
  const vehicle = await vehicles.create(shopId, {
    customer_id: customer.id,
    plate: plate(),
    make: 'Toyota',
    model: 'Corolla',
    mileage_km: mileage,
  });
  const base = { customer_id: customer.id, vehicle_id: vehicle.id, complaint: 'Ruido al frenar' };
  return { ownerId: owner.id, shopId, customerId: customer.id, vehicleId: vehicle.id, base };
}

describe('Órdenes de trabajo (integración, Postgres real)', () => {
  it('crea en draft con número OT-0001, OT-0002… por taller (cada taller empieza en 1)', async () => {
    const a = await setup();
    const b = await setup();

    const first = await workOrders.create(a.shopId, a.ownerId, a.base);
    const second = await workOrders.create(a.shopId, a.ownerId, { ...a.base, complaint: 'Cambio de aceite' });
    const otherShop = await workOrders.create(b.shopId, b.ownerId, b.base);

    expect([first.code, second.code, otherShop.code]).toEqual(['OT-0001', 'OT-0002', 'OT-0001']);
    expect(first).toMatchObject({
      status: 'draft',
      customer: { full_name: 'María Gómez' },
      vehicle: { make: 'Toyota', model: 'Corolla' },
      subtotal_cents: '0',
      total_cents: '0',
      currency: 'DOP',
    });
  });

  it('concurrencia: 20 OT a la vez reciben 20 números distintos y consecutivos', async () => {
    const { shopId, ownerId, base } = await setup();
    const created = await Promise.all(Array.from({ length: 20 }, () => workOrders.create(shopId, ownerId, base)));
    expect(created.map((w) => w.number).sort((x, y) => x - y)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  it('el contador no deja huecos: si la tx hace rollback, el número se reutiliza', async () => {
    const { shopId } = await setup();
    await prisma.$transaction((tx) => nextShopSequence(tx, shopId, 'prueba'));
    await expect(
      prisma.$transaction(async (tx) => {
        await nextShopSequence(tx, shopId, 'prueba');
        throw new Error('falla después de pedir el número');
      }),
    ).rejects.toThrow('falla después');
    expect(await prisma.$transaction((tx) => nextShopSequence(tx, shopId, 'prueba'))).toBe(2);
  });

  describe('validaciones y aislamiento', () => {
    it('vehículo de OTRO cliente del mismo taller → 400', async () => {
      const { shopId, ownerId, base } = await setup();
      const other = await customers.create(shopId, { full_name: 'Otro' });
      await expect(workOrders.create(shopId, ownerId, { ...base, customer_id: other.id })).rejects.toThrow(
        /no pertenece a ese cliente/,
      );
    });

    it('cliente o vehículo de OTRO taller → 404', async () => {
      const a = await setup();
      const b = await setup();
      await expect(workOrders.create(a.shopId, a.ownerId, { ...a.base, customer_id: b.customerId })).rejects.toThrow(
        NotFoundException,
      );
      await expect(workOrders.create(a.shopId, a.ownerId, { ...a.base, vehicle_id: b.vehicleId })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('…y la DB tampoco lo permite (FK compuestas), aunque se salte el servicio', async () => {
      const a = await setup();
      const b = await setup();
      await expect(
        prisma.workOrder.create({
          data: {
            shop_id: a.shopId, number: 999, customer_id: b.customerId, vehicle_id: b.vehicleId,
            complaint: 'x', created_by_account_id: a.ownerId,
          },
        }),
      ).rejects.toThrow(/Foreign key constraint/);
    });

    it('get / update / list desde otro taller: 404 o vacío', async () => {
      const a = await setup();
      const b = await setup();
      const wo = await workOrders.create(a.shopId, a.ownerId, a.base);

      await expect(workOrders.get(b.shopId, wo.id)).rejects.toThrow(NotFoundException);
      await expect(workOrders.update(b.shopId, wo.id, { notes: 'x' })).rejects.toThrow(NotFoundException);
      expect((await workOrders.list(b.shopId, {})).items).toEqual([]);
      expect((await workOrders.list(b.shopId, { vehicleId: a.vehicleId })).items).toEqual([]);
    });

    it('asignar a alguien que no es miembro activo → 400; al dueño sí', async () => {
      const { shopId, ownerId, base } = await setup();
      const ownerMember = await prisma.shopMember.findFirstOrThrow({ where: { shop_id: shopId, account_id: ownerId } });
      await expect(workOrders.create(shopId, ownerId, { ...base, assigned_member_id: randomUUID() })).rejects.toThrow(
        BadRequestException,
      );
      const wo = await workOrders.create(shopId, ownerId, { ...base, assigned_member_id: ownerMember.id });
      expect(wo.assigned_member_id).toBe(ownerMember.id);
    });
  });

  it('kilometraje de entrada: actualiza la ficha del vehículo solo si sube', async () => {
    const { shopId, ownerId, base, vehicleId } = await setup(100000);
    await workOrders.create(shopId, ownerId, { ...base, mileage_in: 120500 });
    expect((await vehicles.get(shopId, vehicleId)).mileage_km).toBe(120500);

    await workOrders.create(shopId, ownerId, { ...base, mileage_in: 90000 }); // odómetro cambiado / error
    expect((await vehicles.get(shopId, vehicleId)).mileage_km).toBe(120500);
  });

  it('update: edita cabecera; una OT cerrada ya no se edita (409)', async () => {
    const { shopId, ownerId, base } = await setup();
    const wo = await workOrders.create(shopId, ownerId, base);

    const updated = await workOrders.update(shopId, wo.id, {
      complaint: '  Ruido al frenar, lado derecho ',
      notes: 'Cliente espera en el taller',
      promised_at: '2026-10-02T17:00:00-04:00',
    });
    expect(updated).toMatchObject({
      complaint: 'Ruido al frenar, lado derecho',
      notes: 'Cliente espera en el taller',
      promised_at: '2026-10-02T21:00:00.000Z',
    });

    await prisma.workOrder.update({ where: { id: wo.id }, data: { status: 'completed', completed_at: new Date() } });
    await expect(workOrders.update(shopId, wo.id, { notes: 'tarde' })).rejects.toThrow(ConflictException);
  });

  it('list: filtros por estado y vehículo (historial), búsqueda por número y paginación', async () => {
    const { shopId, ownerId, base } = await setup();
    const w1 = await workOrders.create(shopId, ownerId, base);
    const w2 = await workOrders.create(shopId, ownerId, base);
    const w3 = await workOrders.create(shopId, ownerId, base);
    await prisma.workOrder.update({ where: { id: w2.id }, data: { status: 'in_progress' } });

    const codes = async (opts: Parameters<WorkOrdersService['list']>[1]) =>
      (await workOrders.list(shopId, opts)).items.map((w) => w.code);
    expect(await codes({})).toEqual(['OT-0003', 'OT-0002', 'OT-0001']);
    expect(await codes({ status: 'in_progress' })).toEqual(['OT-0002']);
    expect(await codes({ q: 'OT-0001' })).toEqual(['OT-0001']);
    expect(await codes({ q: '3' })).toEqual(['OT-0003']);
    expect(await codes({ q: 'abc' })).toEqual([]);
    expect(await codes({ vehicleId: base.vehicle_id })).toHaveLength(3);

    const page1 = await workOrders.list(shopId, { limit: 2 });
    const page2 = await workOrders.list(shopId, { limit: 2, cursor: page1.next_cursor! });
    expect([...page1.items, ...page2.items].map((w) => w.id)).toEqual([w3.id, w2.id, w1.id]);
    expect(page2.next_cursor).toBeNull();
  });

  it('la DB rechaza totales que no cuadran (CHECK total = subtotal + ITBIS)', async () => {
    const { shopId, ownerId, base } = await setup();
    const wo = await workOrders.create(shopId, ownerId, base);
    await expect(
      prisma.workOrder.update({ where: { id: wo.id }, data: { subtotal_cents: 1000n, tax_cents: 180n, total_cents: 999n } }),
    ).rejects.toThrow(/work_orders_totals_check/);
  });
});
