import { randomUUID } from 'node:crypto';
import type { CanActivate, ExecutionContext, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { Page, ShopView, WorkOrderView } from '@repo/types';
import { ApprovalsModule } from '../approvals/approvals.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BillingModule } from '../billing/billing.module';
import { configureApp } from '../configure-app';
import { CustomersModule } from '../customers/customers.module';
import { InspectionsModule } from '../inspections/inspections.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_PROVIDER } from '../storage/storage-provider.interface';
import { StorageModule } from '../storage/storage.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { VIN_DECODER } from '../vin/vin-decoder.interface';
import { WorkOrdersModule } from '../work-orders/work-orders.module';
import { ShopsModule } from './shops.module';

/**
 * Permisos por rol (D8.4a) por HTTP real. Dueño = todo; asesor (secretaria) =
 * mostrador; mecánico = solo sus OT asignadas, sin cobrar ni cancelar.
 */
let app: INestApplication;
let prisma: PrismaService;
let base: string;

const fakeJwt: CanActivate = {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<{ headers: Record<string, string>; user?: { id: string } }>();
    req.user = { id: req.headers['x-test-account'] };
    return Boolean(req.user.id);
  },
};

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, load: [() => ({ APPROVAL_LINK_SECRET: 'x'.repeat(40) })] }),
      PrismaModule,
      StorageModule,
      ShopsModule,
      CustomersModule,
      VehiclesModule,
      WorkOrdersModule,
      InspectionsModule,
      ApprovalsModule,
      InvoicesModule,
      BillingModule,
    ],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue(fakeJwt)
    .overrideProvider(VIN_DECODER)
    .useValue({ provider: 'x', decode: async () => null })
    .overrideProvider(STORAGE_PROVIDER)
    .useValue({ provider: 'x', createDownloadUrl: async () => ({ url: 'x', expiresAt: '' }) })
    .compile();
  app = moduleRef.createNestApplication({ logger: false });
  configureApp(app, {});
  await app.listen(0);
  base = `${(await app.getUrl()).replace('[::1]', 'localhost')}/v1`;
  prisma = app.get(PrismaService);
});

afterAll(async () => {
  await app?.close();
});

type Role = 'owner' | 'advisor' | 'mechanic';

async function call(accountId: string, method: string, path: string, body?: unknown, headers: Record<string, string> = {}) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { 'x-test-account': accountId, 'content-type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: (text ? JSON.parse(text) : null) as unknown };
}

/** Taller con dueño, asesor y mecánico; un cliente, un vehículo; una OT asignada al mecánico y otra sin asignar. */
async function shopWithTeam() {
  const accounts = {} as Record<Role, string>;
  for (const role of ['owner', 'advisor', 'mechanic'] as Role[]) {
    accounts[role] = (await prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } })).id;
  }
  const shop = (await call(accounts.owner, 'POST', '/shops', { name: 'Taller Roles' })).body as ShopView;
  const S = `/shops/${shop.id}`;
  await prisma.shopMember.create({ data: { shop_id: shop.id, account_id: accounts.advisor, role: 'advisor', status: 'active' } });
  const mechanic = await prisma.shopMember.create({
    data: { shop_id: shop.id, account_id: accounts.mechanic, role: 'mechanic', status: 'active' },
  });

  const customer = (await call(accounts.owner, 'POST', `${S}/customers`, { full_name: 'María Gómez' })).body as { id: string };
  const vehicle = (
    await call(accounts.owner, 'POST', `${S}/vehicles`, { customer_id: customer.id, plate: `R${Date.now() % 1e6}`, make: 'Toyota' })
  ).body as { id: string };
  const newOrder = async (assigned: boolean) =>
    (
      (
        await call(accounts.owner, 'POST', `${S}/work-orders`, {
          customer_id: customer.id,
          vehicle_id: vehicle.id,
          complaint: 'Ruido al frenar',
          ...(assigned ? { assigned_member_id: mechanic.id } : {}),
        })
      ).body as WorkOrderView
    ).id;
  const mine = await newOrder(true);
  const other = await newOrder(false);
  const as = (role: Role) => (method: string, path: string, body?: unknown, headers?: Record<string, string>) =>
    call(accounts[role], method, `${S}${path}`, body, headers);
  return { S, customerId: customer.id, vehicleId: vehicle.id, mine, other, newOrder, as, mechanicMemberId: mechanic.id };
}

const ok = (status: number) => status >= 200 && status < 300;

describe('Permisos por rol (HTTP)', () => {
  it('clientes y vehículos: todos ven; solo dueño y asesor crean o editan', async () => {
    const t = await shopWithTeam();
    for (const role of ['owner', 'advisor', 'mechanic'] as Role[]) {
      expect(ok((await t.as(role)('GET', '/customers')).status)).toBe(true);
      expect(ok((await t.as(role)('GET', `/vehicles/${t.vehicleId}`)).status)).toBe(true);
      expect(ok((await t.as(role)('GET', `/vehicles/${t.vehicleId}/history`)).status)).toBe(true);
    }
    expect((await t.as('advisor')('POST', '/customers', { full_name: 'Pedro Ruiz' })).status).toBe(201);
    expect((await t.as('mechanic')('POST', '/customers', { full_name: 'Pedro Ruiz' })).status).toBe(403);
    expect((await t.as('mechanic')('PATCH', `/customers/${t.customerId}`, { notes: 'x' })).status).toBe(403);
    expect(ok((await t.as('advisor')('PATCH', `/customers/${t.customerId}`, { notes: 'Cliente frecuente' })).status)).toBe(true);
    expect((await t.as('mechanic')('POST', '/vehicles', { customer_id: t.customerId, plate: 'Z000001', make: 'Kia' })).status).toBe(403);
    expect((await t.as('mechanic')('PATCH', `/vehicles/${t.vehicleId}`, { color: 'Rojo' })).status).toBe(403);
  });

  it('órdenes: el mecánico solo ve las asignadas a él (lista y por ID → 404); "mis órdenes" para los demás', async () => {
    const t = await shopWithTeam();
    const ids = async (role: Role, query = '') =>
      ((await t.as(role)('GET', `/work-orders${query}`)).body as Page<WorkOrderView>).items.map((w) => w.id);

    expect(await ids('mechanic')).toEqual([t.mine]);
    expect(await ids('mechanic', '?mine=false')).toEqual([t.mine]); // no puede "pedir" ver las ajenas
    expect(await ids('owner')).toEqual(expect.arrayContaining([t.mine, t.other]));
    expect(await ids('owner', '?mine=true')).toEqual([]); // el dueño no tiene OT asignadas

    expect((await t.as('mechanic')('GET', `/work-orders/${t.other}`)).status).toBe(404);
    expect((await t.as('mechanic')('GET', `/work-orders/${t.mine}`)).status).toBe(200);
    expect((await t.as('advisor')('GET', `/work-orders/${t.other}`)).status).toBe(200);
  });

  it('órdenes: crear, editar y cancelar = mostrador; el mecánico agrega líneas e inicia SUS órdenes', async () => {
    const t = await shopWithTeam();
    const line = { type: 'labor', description: 'Cambio de pastillas', quantity: '1', unit_price_cents: '150000' };

    expect((await t.as('mechanic')('POST', '/work-orders', { customer_id: t.customerId, vehicle_id: t.vehicleId, complaint: 'x y' })).status).toBe(403);
    expect((await t.as('advisor')('POST', '/work-orders', { customer_id: t.customerId, vehicle_id: t.vehicleId, complaint: 'Aceite' })).status).toBe(201);
    expect((await t.as('mechanic')('PATCH', `/work-orders/${t.mine}`, { notes: 'x' })).status).toBe(403);

    expect((await t.as('mechanic')('POST', `/work-orders/${t.mine}/items`, line)).status).toBe(201);
    expect((await t.as('mechanic')('POST', `/work-orders/${t.other}/items`, line)).status).toBe(404);
    expect((await t.as('mechanic')('POST', `/work-orders/${t.mine}/transitions`, { to: 'in_progress' })).status).toBe(200);
    expect((await t.as('mechanic')('POST', `/work-orders/${t.mine}/transitions`, { to: 'cancelled', reason: 'x' })).status).toBe(403);
    expect((await t.as('advisor')('POST', `/work-orders/${t.mine}/transitions`, { to: 'cancelled', reason: 'El cliente no vino' })).status).toBe(200);
  });

  it('inspección: el mecánico en sus órdenes; el asesor en cualquiera (fotos al recibir)', async () => {
    const t = await shopWithTeam();
    expect(ok((await t.as('mechanic')('POST', `/work-orders/${t.mine}/inspection`, {})).status)).toBe(true);
    expect((await t.as('mechanic')('POST', `/work-orders/${t.other}/inspection`, {})).status).toBe(404);
    expect((await t.as('mechanic')('GET', `/work-orders/${t.other}/inspection`)).status).toBe(404);
    expect(ok((await t.as('advisor')('POST', `/work-orders/${t.other}/inspection`, {})).status)).toBe(true);
  });

  it('enlace de aprobación, facturas y cobro: solo dueño y asesor', async () => {
    const t = await shopWithTeam();
    const mechanic = t.as('mechanic');
    expect((await mechanic('POST', `/work-orders/${t.mine}/approval-requests`, {})).status).toBe(403);
    expect((await mechanic('GET', `/work-orders/${t.mine}/approval-requests`)).status).toBe(403);
    expect((await mechanic('POST', `/work-orders/${t.mine}/invoice`)).status).toBe(403);
    expect((await mechanic('GET', '/invoices')).status).toBe(403);
    expect((await mechanic('POST', `/work-orders/${t.mine}/charge`, { method: 'cash' }, { 'idempotency-key': `k-${randomUUID()}` })).status).toBe(403);

    expect((await t.as('advisor')('GET', '/invoices')).status).toBe(200);
    expect((await t.as('advisor')('GET', `/work-orders/${t.mine}/approval-requests`)).status).toBe(200);
  });

  it('equipo: solo el dueño invita; todos ven quién está en el taller', async () => {
    const t = await shopWithTeam();
    const invite = { email: `nuevo-${randomUUID()}@taller.do`, role: 'mechanic' };
    expect((await t.as('advisor')('POST', '/members', invite)).status).toBe(403);
    expect((await t.as('mechanic')('POST', '/members', invite)).status).toBe(403);
    expect((await t.as('owner')('POST', '/members', invite)).status).toBe(201);
    expect((await t.as('mechanic')('GET', '/members')).status).toBe(200);
  });
});
