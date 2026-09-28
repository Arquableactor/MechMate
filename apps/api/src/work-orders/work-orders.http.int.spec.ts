import { randomUUID } from 'node:crypto';
import { type CanActivate, type ExecutionContext, type INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { Page, ShopView, WorkOrderDetailView, WorkOrderView } from '@repo/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsModule } from '../shops/shops.module';
import { VIN_DECODER } from '../vin/vin-decoder.interface';
import { WorkOrdersModule } from './work-orders.module';

/** Rutas de OT por HTTP real: guard de taller, validación y status codes. */
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
    imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }), PrismaModule, ShopsModule, WorkOrdersModule],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue(fakeJwt)
    .overrideProvider(VIN_DECODER)
    .useValue({ provider: 'fake', decode: async () => null })
    .compile();
  app = moduleRef.createNestApplication();
  app.setGlobalPrefix('v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(0);
  base = `${await app.getUrl()}/v1`.replace('[::1]', 'localhost');
  prisma = app.get(PrismaService);
});

afterAll(async () => {
  await app.close();
});

const json = async <T>(res: Response): Promise<T> => (await res.json()) as T;
const call = (accountId: string, method: string, path: string, body?: unknown) =>
  fetch(`${base}${path}`, {
    method,
    headers: { 'x-test-account': accountId, 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

async function setup() {
  const owner = await prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } });
  const shop = await json<ShopView>(await call(owner.id, 'POST', '/shops', { name: 'Taller OT' }));
  const customer = await prisma.customer.create({ data: { shop_id: shop.id, full_name: 'Cliente' } });
  const vehicle = await prisma.vehicle.create({
    data: { shop_id: shop.id, customer_id: customer.id, plate: `W${Date.now() % 1e6}`, make: 'Kia', data_source: 'manual' },
  });
  return { ownerId: owner.id, shopId: shop.id, body: { customer_id: customer.id, vehicle_id: vehicle.id, complaint: 'No arranca' } };
}

describe('OT por HTTP', () => {
  it('crear (201, OT-0001), listar, ver y editar', async () => {
    const { ownerId, shopId, body } = await setup();
    const path = `/shops/${shopId}/work-orders`;

    const res = await call(ownerId, 'POST', path, { ...body, mileage_in: 50000 });
    expect(res.status).toBe(201);
    const wo = await json<WorkOrderView>(res);
    expect(wo).toMatchObject({ code: 'OT-0001', status: 'draft', created_by_account_id: ownerId, vehicle: { make: 'Kia' } });

    const list = await json<Page<WorkOrderView>>(await call(ownerId, 'GET', `${path}?status=draft&q=OT-0001`));
    expect(list.items.map((w) => w.id)).toEqual([wo.id]);
    expect((await call(ownerId, 'GET', `${path}/${wo.id}`)).status).toBe(200);
    const patched = await call(ownerId, 'PATCH', `${path}/${wo.id}`, { notes: 'Batería vieja' });
    expect((await json<WorkOrderView>(patched)).notes).toBe('Batería vieja');
  });

  it('validación: 400', async () => {
    const { ownerId, shopId, body } = await setup();
    const path = `/shops/${shopId}/work-orders`;
    for (const bad of [
      { ...body, complaint: 'x' },
      { ...body, customer_id: 'no-uuid' },
      { ...body, mileage_in: -1 },
      { ...body, promised_at: 'mañana' },
    ]) {
      expect((await call(ownerId, 'POST', path, bad)).status).toBe(400);
    }
    expect((await call(ownerId, 'GET', `${path}?status=volando`)).status).toBe(400);
    // customer_id/vehicle_id no se cambian por PATCH (whitelist los descarta).
    const wo = await json<WorkOrderView>(await call(ownerId, 'POST', path, body));
    const patched = await json<WorkOrderView>(await call(ownerId, 'PATCH', `${path}/${wo.id}`, { customer_id: randomUUID() }));
    expect(patched.customer.id).toBe(body.customer_id);
  });

  it('líneas: agregar (201), editar, quitar; precio como número o string; validación 400', async () => {
    const { ownerId, shopId, body } = await setup();
    const wo = await json<WorkOrderView>(await call(ownerId, 'POST', `/shops/${shopId}/work-orders`, body));
    const path = `/shops/${shopId}/work-orders/${wo.id}/items`;

    const added = await call(ownerId, 'POST', path, { type: 'labor', description: 'Diagnóstico', quantity: 1.5, unit_price_cents: 120000 });
    expect(added.status).toBe(201);
    const detail = await json<WorkOrderDetailView>(added);
    expect(detail).toMatchObject({ total_cents: '212400', items: [{ quantity: '1.5', total_cents: '212400' }] });

    const edited = await json<WorkOrderDetailView>(
      await call(ownerId, 'PATCH', `${path}/${detail.items[0].id}`, { tax_rate_bps: 0 }),
    );
    expect(edited.total_cents).toBe('180000');

    for (const bad of [
      { type: 'labor', description: 'x', quantity: '0', unit_price_cents: '100' },
      { type: 'labor', description: 'x', quantity: '1', unit_price_cents: '12.50' },
      { type: 'otro', description: 'x', quantity: '1', unit_price_cents: '100' },
      { type: 'part', description: 'x', quantity: '1', unit_price_cents: '100', tax_rate_bps: 20000 },
    ]) {
      expect((await call(ownerId, 'POST', path, bad)).status).toBe(400);
    }

    const removed = await call(ownerId, 'DELETE', `${path}/${detail.items[0].id}`);
    expect(removed.status).toBe(200);
    expect(await json<WorkOrderDetailView>(removed)).toMatchObject({ items: [], total_cents: '0' });
    expect((await call(ownerId, 'GET', `/shops/${shopId}/work-orders/${wo.id}`)).status).toBe(200);
  });

  it('otro taller: 404', async () => {
    const a = await setup();
    const b = await setup();
    const wo = await json<WorkOrderView>(await call(a.ownerId, 'POST', `/shops/${a.shopId}/work-orders`, a.body));

    expect((await call(b.ownerId, 'GET', `/shops/${a.shopId}/work-orders`)).status).toBe(404);
    expect((await call(b.ownerId, 'GET', `/shops/${b.shopId}/work-orders/${wo.id}`)).status).toBe(404);
    expect((await call(b.ownerId, 'POST', `/shops/${b.shopId}/work-orders`, a.body)).status).toBe(404);
  });
});
