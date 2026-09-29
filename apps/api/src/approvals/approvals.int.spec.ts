import { randomUUID } from 'node:crypto';
import { BadRequestException, ConflictException, GoneException, NotFoundException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { WorkOrderApprovalRequestedPayload, WorkOrderStatusChangedPayload } from '@repo/types';
import { AccountsService } from '../accounts/accounts.service';
import { CustomersService } from '../customers/customers.service';
import { InspectionsService } from '../inspections/inspections.service';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';
import type { StorageProvider } from '../storage/storage-provider.interface';
import { VehiclesService } from '../vehicles/vehicles.service';
import type { VinService } from '../vin/vin.service';
import { WorkOrderItemsService } from '../work-orders/work-order-items.service';
import { WorkOrdersService } from '../work-orders/work-orders.service';
import { signApprovalToken } from './approval-token';
import { ApprovalsService } from './approvals.service';

/** Aprobación del cliente contra Postgres REAL: flujo, enlaces y aislamiento. */
const SECRET = 'secreto-de-pruebas-de-32-caracteres-o-mas';
let prisma: PrismaService;
let approvals: ApprovalsService;
let workOrders: WorkOrdersService;
let items: WorkOrderItemsService;
let shops: ShopsService;
let customers: CustomersService;
let vehicles: VehiclesService;

const storage = {
  provider: 'fake',
  createDownloadUrl: async (key: string) => ({ url: `https://fake.r2/${key}`, expiresAt: '' }),
} as unknown as StorageProvider;

beforeAll(async () => {
  prisma = new PrismaService();
  await prisma.$connect();
  shops = new ShopsService(prisma, new AccountsService(prisma));
  customers = new CustomersService(prisma);
  vehicles = new VehiclesService(prisma, customers, {} as VinService);
  workOrders = new WorkOrdersService(prisma, customers, vehicles, shops);
  items = new WorkOrderItemsService(prisma, workOrders);
  const inspections = new InspectionsService(prisma, workOrders, storage);
  const config = { get: (k: string) => ({ APPROVAL_LINK_SECRET: SECRET, PUBLIC_BASE_URL: 'https://api.mechmate.do/' })[k] } as ConfigService;
  approvals = new ApprovalsService(prisma, workOrders, inspections, shops, config);
});

afterAll(async () => {
  await prisma.$disconnect();
});

const tokenOf = (link: string) => link.split('/a/')[1];

/** OT con: diagnóstico ya autorizado + frenos y suspensión propuestos. */
async function setup() {
  const owner = await prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } });
  const shopId = (await shops.create(owner.id, { name: 'Taller Hermanos Pérez', type: 'mechanic_shop' })).id;
  const customer = await customers.create(shopId, { full_name: 'María Gómez' });
  const vehicle = await vehicles.create(shopId, {
    customer_id: customer.id,
    plate: `Q${String(Math.floor(Math.random() * 1e6)).padStart(6, '0')}`,
    make: 'Toyota',
    model: 'Corolla',
  });
  const wo = await workOrders.create(shopId, owner.id, { customer_id: customer.id, vehicle_id: vehicle.id, complaint: 'Ruido' });
  const line = { quantity: '1', tax_rate_bps: 0 };
  await items.add(shopId, wo.id, { ...line, type: 'labor', description: 'Diagnóstico', unit_price_cents: '100000' });
  await items.add(shopId, wo.id, { ...line, type: 'part', description: 'Frenos', unit_price_cents: '500000', requires_approval: true });
  const detail = await items.add(shopId, wo.id, {
    ...line, type: 'part', description: 'Suspensión', unit_price_cents: '800000', requires_approval: true,
  });
  const [, brakes, suspension] = detail.items.map((i) => i.id);
  return { shopId, woId: wo.id, ownerId: owner.id, brakes, suspension };
}

const statusEvents = (woId: string) =>
  prisma.outboxEvent
    .findMany({ where: { topic: 'WorkOrderStatusChanged', payload: { path: ['workOrderId'], equals: woId } }, orderBy: { created_at: 'asc' } })
    .then((rows) => rows.map((r) => r.payload as unknown as WorkOrderStatusChangedPayload));

describe('Aprobación del cliente (integración, Postgres real)', () => {
  it('las líneas propuestas SÍ suman mientras se deciden; el total excluye solo las rechazadas', async () => {
    const { shopId, woId } = await setup();
    expect((await workOrders.getDetail(shopId, woId)).total_cents).toBe('1400000');
  });

  it('pedir: OT → awaiting_approval, evento SIN token, enlace firmado válido', async () => {
    const { shopId, woId, ownerId } = await setup();
    const req = await approvals.request(shopId, woId, ownerId);

    expect(req.status).toBe('pending');
    expect(req.link).toMatch(new RegExp(`^https://api\\.mechmate\\.do/a/${req.id}\\.[A-Za-z0-9_-]{43}$`));
    expect((await workOrders.get(shopId, woId)).status).toBe('awaiting_approval');

    const [event] = await prisma.outboxEvent.findMany({
      where: { topic: 'WorkOrderApprovalRequested', payload: { path: ['workOrderId'], equals: woId } },
    });
    const payload = event.payload as unknown as WorkOrderApprovalRequestedPayload;
    expect(payload.approvalId).toBe(req.id);
    // SEGURIDAD: el token (la firma) NO queda guardado en el outbox.
    expect(JSON.stringify(event.payload)).not.toContain(tokenOf(req.link).split('.')[1]);
  });

  it('sin líneas propuestas u OT en otro estado → 409', async () => {
    const { shopId, woId, ownerId, brakes, suspension } = await setup();
    for (const id of [brakes, suspension]) await items.update(shopId, woId, id, { requires_approval: false });
    await expect(approvals.request(shopId, woId, ownerId)).rejects.toThrow(/No hay líneas propuestas/);

    const other = await setup();
    await workOrders.transition(other.shopId, other.woId, 'in_progress', { accountId: other.ownerId });
    await expect(approvals.request(other.shopId, other.woId, other.ownerId)).rejects.toThrow(ConflictException);
  });

  it('mientras hay aprobación pendiente, las líneas no se editan (409)', async () => {
    const { shopId, woId, ownerId, brakes } = await setup();
    await approvals.request(shopId, woId, ownerId);
    await expect(items.update(shopId, woId, brakes, { unit_price_cents: '1' })).rejects.toThrow(/aprobación pendiente/);
  });

  it('vista del cliente: nombre de pila, vehículo, líneas y totales; sin datos internos', async () => {
    const { shopId, woId, ownerId } = await setup();
    const view = await approvals.publicView(tokenOf((await approvals.request(shopId, woId, ownerId)).link));

    expect(view).toMatchObject({
      status: 'pending',
      shop_name: 'Taller Hermanos Pérez',
      work_order_code: 'OT-0001',
      customer_first_name: 'María',
      total_cents: '1400000',
      findings: [],
    });
    expect(view.vehicle).toMatch(/^Toyota Corolla \(Q\d{6}\)$/);
    expect(view.items.map((i) => [i.description, i.approval_status])).toEqual([
      ['Diagnóstico', 'approved'],
      ['Frenos', 'proposed'],
      ['Suspensión', 'proposed'],
    ]);
    expect(Object.keys(view.items[0])).not.toContain('unit_price_cents');
  });

  it('decidir por partes: aprueba frenos, rechaza suspensión → completada, OT approved, total sin lo rechazado', async () => {
    const { shopId, woId, ownerId, brakes, suspension } = await setup();
    const token = tokenOf((await approvals.request(shopId, woId, ownerId)).link);

    const partial = await approvals.decide(token, [{ item_id: brakes, decision: 'approved' }]);
    expect(partial.status).toBe('pending');
    expect((await workOrders.get(shopId, woId)).status).toBe('awaiting_approval');

    const done = await approvals.decide(token, [{ item_id: suspension, decision: 'declined' }]);
    expect(done.status).toBe('completed');
    expect(done.items.map((i) => i.approval_status)).toEqual(['approved', 'approved', 'declined']);
    expect(done.total_cents).toBe('600000'); // 1,000 + 5,000 (sin la suspensión de 8,000)

    const detail = await workOrders.getDetail(shopId, woId);
    expect(detail.status).toBe('approved');
    expect(detail.items[2].decided_at).not.toBeNull();
    const events = await statusEvents(woId);
    expect(events.map((e) => `${e.from}→${e.to}`)).toEqual(['draft→awaiting_approval', 'awaiting_approval→approved']);
    expect(events[1]).toMatchObject({ changedByAccountId: null, total_cents: '600000' });

    // Luego el taller sigue: approved → in_progress.
    await expect(workOrders.transition(shopId, woId, 'in_progress', { accountId: ownerId })).resolves.toBeDefined();
  });

  it('decisiones inválidas: línea ya decidida, no propuesta, de otra OT o id raro → 400', async () => {
    const a = await setup();
    const b = await setup();
    const token = tokenOf((await approvals.request(a.shopId, a.woId, a.ownerId)).link);
    await approvals.decide(token, [{ item_id: a.brakes, decision: 'approved' }]);
    const diagnostic = (await workOrders.getDetail(a.shopId, a.woId)).items[0].id;

    for (const itemId of [a.brakes, diagnostic, b.brakes, 'no-uuid']) {
      await expect(approvals.decide(token, [{ item_id: itemId, decision: 'declined' }])).rejects.toThrow(BadRequestException);
    }
  });

  describe('enlaces', () => {
    it('SEGURIDAD: falsificado, de otro secreto o de un id inexistente → mismo 404', async () => {
      const { shopId, woId, ownerId } = await setup();
      const req = await approvals.request(shopId, woId, ownerId);
      for (const token of [
        `${req.id}.firmafalsa`,
        signApprovalToken(req.id, 'otro-secreto'),
        signApprovalToken(randomUUID(), SECRET),
        'basura',
      ]) {
        await expect(approvals.publicView(token)).rejects.toThrow('Enlace de aprobación no válido');
      }
    });

    it('reenviar revoca el enlace anterior: se ve "revoked" y no admite decisiones', async () => {
      const { shopId, woId, ownerId, brakes } = await setup();
      const first = tokenOf((await approvals.request(shopId, woId, ownerId)).link);
      const second = tokenOf((await approvals.request(shopId, woId, ownerId)).link);

      expect((await approvals.publicView(first)).status).toBe('revoked');
      await expect(approvals.decide(first, [{ item_id: brakes, decision: 'approved' }])).rejects.toThrow(ConflictException);
      await expect(approvals.decide(second, [{ item_id: brakes, decision: 'approved' }])).resolves.toBeDefined();
    });

    it('vencido → la vista dice "expired" y decidir da 410', async () => {
      const { shopId, woId, ownerId, brakes } = await setup();
      const req = await approvals.request(shopId, woId, ownerId);
      const past = new Date(Date.now() - 60_000);
      await prisma.workOrderApproval.update({
        where: { id: req.id },
        data: { created_at: new Date(past.getTime() - 1000), expires_at: past },
      });

      const token = tokenOf(req.link);
      expect((await approvals.publicView(token)).status).toBe('expired');
      await expect(approvals.decide(token, [{ item_id: brakes, decision: 'approved' }])).rejects.toThrow(GoneException);
    });

    it('revocar: el enlace deja de servir y la OT vuelve a draft (se pueden editar líneas)', async () => {
      const { shopId, woId, ownerId, brakes } = await setup();
      const req = await approvals.request(shopId, woId, ownerId);
      const revoked = await approvals.revoke(shopId, woId, req.id, ownerId);

      expect(revoked.status).toBe('revoked');
      expect((await workOrders.get(shopId, woId)).status).toBe('draft');
      await expect(items.update(shopId, woId, brakes, { unit_price_cents: '450000' })).resolves.toBeDefined();
      await expect(approvals.revoke(shopId, woId, req.id, ownerId)).rejects.toThrow(ConflictException);
    });
  });

  it('aislamiento: otro taller no pide, lista ni revoca (404)', async () => {
    const a = await setup();
    const b = await setup();
    const req = await approvals.request(a.shopId, a.woId, a.ownerId);

    await expect(approvals.request(b.shopId, a.woId, b.ownerId)).rejects.toThrow(NotFoundException);
    await expect(approvals.list(b.shopId, a.woId)).rejects.toThrow(NotFoundException);
    await expect(approvals.revoke(b.shopId, b.woId, req.id, b.ownerId)).rejects.toThrow(NotFoundException);
  });

  it('concurrencia: decidir dos líneas a la vez desde dos pestañas → coherente y completada', async () => {
    const { shopId, woId, ownerId, brakes, suspension } = await setup();
    const token = tokenOf((await approvals.request(shopId, woId, ownerId)).link);

    await Promise.all([
      approvals.decide(token, [{ item_id: brakes, decision: 'approved' }]),
      approvals.decide(token, [{ item_id: suspension, decision: 'approved' }]),
    ]);
    const detail = await workOrders.getDetail(shopId, woId);
    expect(detail.status).toBe('approved');
    expect(detail.total_cents).toBe('1400000');
    expect((await statusEvents(woId)).filter((e) => e.to === 'approved')).toHaveLength(1);
  });

  it('la DB exige coherencia de fechas (CHECKs)', async () => {
    const { shopId, woId, ownerId, brakes } = await setup();
    await expect(prisma.workOrderItem.update({ where: { id: brakes }, data: { approval_status: 'declined' } })).rejects.toThrow(
      /work_order_items_declined_at_check/,
    );
    const req = await approvals.request(shopId, woId, ownerId);
    await expect(prisma.workOrderApproval.update({ where: { id: req.id }, data: { status: 'completed' } })).rejects.toThrow(
      /work_order_approvals_decided_at_check/,
    );
  });
});
