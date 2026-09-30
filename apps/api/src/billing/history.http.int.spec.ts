import { randomUUID } from 'node:crypto';
import { type CanActivate, type ExecutionContext, type INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { HistoryView, ShopView, WorkOrderView } from '@repo/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsModule } from '../shops/shops.module';
import { VIN_DECODER } from '../vin/vin-decoder.interface';
import { WorkOrdersModule } from '../work-orders/work-orders.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { BillingModule } from './billing.module';

/** Historial por HTTP real: rutas, validación del query y aislamiento entre talleres. */
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
    imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }), PrismaModule, ShopsModule, WorkOrdersModule, InvoicesModule, BillingModule],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue(fakeJwt)
    .overrideProvider(VIN_DECODER)
    .useValue({ provider: 'x', decode: async () => null })
    .compile();
  app = moduleRef.createNestApplication();
  app.setGlobalPrefix('v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(0);
  base = `${await app.getUrl()}/v1`.replace('[::1]', 'localhost');
  prisma = app.get(PrismaService);
});

afterAll(async () => {
  await app?.close();
});

const json = async <T>(res: Response): Promise<T> => (await res.json()) as T;

async function owner() {
  const account = await prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } });
  const h = { 'x-test-account': account.id, 'content-type': 'application/json' };
  return {
    get: (path: string) => fetch(`${base}${path}`, { headers: h }),
    post: (path: string, body?: unknown, extra: Record<string, string> = {}) =>
      fetch(`${base}${path}`, { method: 'POST', headers: { ...h, ...extra }, body: body === undefined ? undefined : JSON.stringify(body) }),
  };
}

describe('Historial por HTTP', () => {
  it('vehículo y cliente (200), query inválido (400), otro taller (404)', async () => {
    const a = await owner();
    const shop = await json<ShopView>(await a.post('/shops', { name: 'Taller Historial' }));
    const c = await prisma.customer.create({ data: { shop_id: shop.id, full_name: 'Ana López' } });
    const v = await prisma.vehicle.create({ data: { shop_id: shop.id, customer_id: c.id, plate: `Y${Date.now() % 1e6}`, make: 'Kia', data_source: 'manual' } });
    const wo = await json<WorkOrderView>(await a.post(`/shops/${shop.id}/work-orders`, { customer_id: c.id, vehicle_id: v.id, complaint: 'Aceite' }));
    const W = `/shops/${shop.id}/work-orders/${wo.id}`;
    await a.post(`${W}/items`, { type: 'part', description: 'Aceite', quantity: '1', unit_price_cents: '90000', tax_rate_bps: 0 });
    await a.post(`${W}/transitions`, { to: 'in_progress' });
    await a.post(`${W}/transitions`, { to: 'completed' });
    await a.post(`${W}/invoice`);
    expect((await a.post(`${W}/charge`, { method: 'cash' }, { 'idempotency-key': `http-${randomUUID()}` })).status).toBe(200);

    for (const path of [`/shops/${shop.id}/vehicles/${v.id}/history`, `/shops/${shop.id}/customers/${c.id}/history`]) {
      const res = await a.get(path);
      expect(res.status).toBe(200);
      const view = await json<HistoryView>(res);
      expect(view.summary).toMatchObject({ visits: 1, open_work_orders: 0, total_spent_cents: '90000', currency: 'DOP' });
      expect(view.items[0]).toMatchObject({
        work_order: { code: 'OT-0001', status: 'paid' },
        invoice: { code: 'FAC-0001', status: 'paid', total_cents: '90000' },
        payment: { method: 'cash' },
      });
    }

    expect((await a.get(`/shops/${shop.id}/vehicles/${v.id}/history?limit=0`)).status).toBe(400);
    expect((await a.get(`/shops/${shop.id}/vehicles/${v.id}/history?cursor=abc`)).status).toBe(400);

    // Otro taller: con SU taller en la ruta, el vehículo/cliente ajeno no existe; con el ajeno, no es miembro.
    const b = await owner();
    const shopB = await json<ShopView>(await b.post('/shops', { name: 'Otro Taller' }));
    expect((await b.get(`/shops/${shopB.id}/vehicles/${v.id}/history`)).status).toBe(404);
    expect((await b.get(`/shops/${shopB.id}/customers/${c.id}/history`)).status).toBe(404);
    expect((await b.get(`/shops/${shop.id}/vehicles/${v.id}/history`)).status).toBe(404);
  });
});
