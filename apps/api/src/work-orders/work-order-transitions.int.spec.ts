import { randomUUID } from 'node:crypto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import type { WorkOrderStatusChangedPayload } from '@repo/types';
import { AccountsService } from '../accounts/accounts.service';
import { CustomersService } from '../customers/customers.service';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import type { VinService } from '../vin/vin.service';
import { WorkOrderItemsService } from './work-order-items.service';
import { WORK_ORDER_TRANSITIONS, WorkOrdersService } from './work-orders.service';

/** Máquina de estados de la OT contra Postgres REAL: bloqueo, outbox y CHECKs. */
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

const line = { type: 'labor' as const, description: 'Diagnóstico', quantity: '1', unit_price_cents: '150000' };

async function newWorkOrder(withLine = true) {
  const owner = await prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } });
  const shopId = (await shops.create(owner.id, { name: 'Taller', type: 'mechanic_shop' })).id;
  const customer = await customers.create(shopId, { full_name: 'Cliente' });
  const vehicle = await vehicles.create(shopId, {
    customer_id: customer.id,
    plate: `T${String(Math.floor(Math.random() * 1e6)).padStart(6, '0')}`,
    make: 'Nissan',
  });
  const wo = await workOrders.create(shopId, owner.id, {
    customer_id: customer.id,
    vehicle_id: vehicle.id,
    complaint: 'Revisión',
  });
  if (withLine) await items.add(shopId, wo.id, line);
  return { shopId, woId: wo.id, by: { accountId: owner.id } };
}

/** El payload JSON del outbox, tipado como el contrato del evento. */
const payloadOf = (e: { payload: unknown }) => e.payload as WorkOrderStatusChangedPayload;

const events = (woId: string) =>
  prisma.outboxEvent.findMany({
    where: { topic: 'WorkOrderStatusChanged', payload: { path: ['workOrderId'], equals: woId } },
    orderBy: { created_at: 'asc' },
  });

describe('Transiciones de OT (integración, Postgres real)', () => {
  it('draft → in_progress → completed: fechas, y un evento por cambio en el outbox', async () => {
    const { shopId, woId, by } = await newWorkOrder();

    const started = await workOrders.transition(shopId, woId, 'in_progress', by);
    expect(started).toMatchObject({ status: 'in_progress', completed_at: null });
    expect(started.started_at).not.toBeNull();

    const done = await workOrders.transition(shopId, woId, 'completed', by);
    expect(done.status).toBe('completed');
    expect(done.completed_at).not.toBeNull();

    const evts = await events(woId);
    expect(evts.map((e) => payloadOf(e).to)).toEqual(['in_progress', 'completed']);
    expect(evts[1].payload).toMatchObject({
      from: 'in_progress',
      to: 'completed',
      code: 'OT-0001',
      total_cents: '177000',
      currency: 'DOP',
      changedByAccountId: by.accountId,
      reason: null,
    });
  });

  it('transiciones inválidas → 409 y NO escriben evento', async () => {
    const { shopId, woId, by } = await newWorkOrder();
    await expect(workOrders.transition(shopId, woId, 'completed', by)).rejects.toThrow(/no puede pasar a completed/);

    await workOrders.transition(shopId, woId, 'in_progress', by);
    await workOrders.transition(shopId, woId, 'completed', by);
    await expect(workOrders.transition(shopId, woId, 'in_progress', by)).rejects.toThrow(ConflictException);
    await expect(workOrders.transition(shopId, woId, 'cancelled', by)).rejects.toThrow(ConflictException);
    expect(await events(woId)).toHaveLength(2);
  });

  it('completar una OT sin líneas → 409', async () => {
    const { shopId, woId, by } = await newWorkOrder(false);
    await workOrders.transition(shopId, woId, 'in_progress', by);
    await expect(workOrders.transition(shopId, woId, 'completed', by)).rejects.toThrow(/no tiene líneas/);
  });

  it('cancelar con motivo; una cancelada ya no cambia ni acepta líneas', async () => {
    const { shopId, woId, by } = await newWorkOrder();
    const cancelled = await workOrders.transition(shopId, woId, 'cancelled', {
      ...by,
      reason: '  El cliente decidió no reparar ',
    });
    expect(cancelled).toMatchObject({ status: 'cancelled', cancellation_reason: 'El cliente decidió no reparar' });
    expect(cancelled.cancelled_at).not.toBeNull();

    await expect(workOrders.transition(shopId, woId, 'in_progress', by)).rejects.toThrow(ConflictException);
    await expect(items.add(shopId, woId, line)).rejects.toThrow(ConflictException);
  });

  it('el motivo solo se guarda al cancelar', async () => {
    const { shopId, woId, by } = await newWorkOrder();
    const started = await workOrders.transition(shopId, woId, 'in_progress', { ...by, reason: 'ignorado' });
    expect(started.cancellation_reason).toBeNull();
  });

  it('otro taller → 404', async () => {
    const a = await newWorkOrder();
    const b = await newWorkOrder();
    await expect(workOrders.transition(b.shopId, a.woId, 'in_progress', b.by)).rejects.toThrow(NotFoundException);
    await expect(workOrders.transition(a.shopId, 'no-uuid', 'in_progress', a.by)).rejects.toThrow(NotFoundException);
  });

  it('concurrencia: completar mientras se agregan líneas → estado coherente (bloqueo de la OT)', async () => {
    for (let round = 0; round < 5; round++) {
      const { shopId, woId, by } = await newWorkOrder();
      await workOrders.transition(shopId, woId, 'in_progress', by);

      const results = await Promise.allSettled([
        items.add(shopId, woId, { ...line, description: 'Extra 1' }),
        workOrders.transition(shopId, woId, 'completed', by),
        items.add(shopId, woId, { ...line, description: 'Extra 2' }),
      ]);
      // Completar siempre gana su turno; una línea llega antes o es rechazada (409), nunca queda "colada".
      expect(results[1].status).toBe('fulfilled');
      for (const r of [results[0], results[2]]) {
        if (r.status === 'rejected') expect(r.reason).toBeInstanceOf(ConflictException);
      }
      const detail = await workOrders.getDetail(shopId, woId);
      const sum = detail.items.reduce((acc, i) => acc + BigInt(i.total_cents), 0n);
      expect(detail.status).toBe('completed');
      expect(detail.total_cents).toBe(sum.toString());
      const completedEvent = (await events(woId)).find((e) => payloadOf(e).to === 'completed');
      expect(payloadOf(completedEvent!).total_cents).toBe(detail.total_cents);
    }
  });

  it('la DB exige coherencia estado ↔ fechas (CHECK)', async () => {
    const { woId } = await newWorkOrder();
    await expect(prisma.workOrder.update({ where: { id: woId }, data: { status: 'completed' } })).rejects.toThrow(
      /work_orders_completed_at_check/,
    );
    await expect(prisma.workOrder.update({ where: { id: woId }, data: { status: 'cancelled' } })).rejects.toThrow(
      /work_orders_cancelled_at_check/,
    );
  });

  it('el mapa de transiciones no tiene salidas desde paid ni cancelled', () => {
    expect(WORK_ORDER_TRANSITIONS.paid).toEqual([]);
    expect(WORK_ORDER_TRANSITIONS.cancelled).toEqual([]);
  });
});
