import { randomUUID } from 'node:crypto';
import { type CanActivate, type ExecutionContext, type INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { ChargeView, ShopView, WorkOrderView } from '@repo/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsModule } from '../shops/shops.module';
import { VIN_DECODER } from '../vin/vin-decoder.interface';
import { WorkOrdersModule } from '../work-orders/work-orders.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { BillingModule } from './billing.module';

/** Cobro por HTTP real: header Idempotency-Key obligatorio, validación, replay. */
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

describe('Cobro por HTTP', () => {
  it('sin/mal Idempotency-Key (400), método inválido (400), cobro (200) y replay (200, replayed)', async () => {
    const owner = await prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } });
    const h = (extra: Record<string, string> = {}) => ({ 'x-test-account': owner.id, 'content-type': 'application/json', ...extra });
    const post = (path: string, body?: unknown, extra?: Record<string, string>) =>
      fetch(`${base}${path}`, { method: 'POST', headers: h(extra), body: body === undefined ? undefined : JSON.stringify(body) });

    const shop = await json<ShopView>(await post('/shops', { name: 'Taller Cobro' }));
    const c = await prisma.customer.create({ data: { shop_id: shop.id, full_name: 'Ana López' } });
    const v = await prisma.vehicle.create({ data: { shop_id: shop.id, customer_id: c.id, plate: `Z${Date.now() % 1e6}`, make: 'Kia', data_source: 'manual' } });
    const wo = await json<WorkOrderView>(await post(`/shops/${shop.id}/work-orders`, { customer_id: c.id, vehicle_id: v.id, complaint: 'Aceite' }));
    const W = `/shops/${shop.id}/work-orders/${wo.id}`;
    await post(`${W}/items`, { type: 'part', description: 'Aceite', quantity: '1', unit_price_cents: '90000' });
    await post(`${W}/transitions`, { to: 'in_progress' });
    await post(`${W}/transitions`, { to: 'completed' });
    await post(`${W}/invoice`);

    expect((await post(`${W}/charge`, { method: 'card' })).status).toBe(400); // sin header
    expect((await post(`${W}/charge`, { method: 'card' }, { 'idempotency-key': 'corta' })).status).toBe(400);
    expect((await post(`${W}/charge`, { method: 'bitcoin' }, { 'idempotency-key': 'clave-12345' })).status).toBe(400);
    // El monto NO se acepta del cliente (whitelist lo descarta).
    const key = `http-${randomUUID()}`;
    const res = await post(`${W}/charge`, { method: 'card', amount_cents: '1' }, { 'idempotency-key': key });
    expect(res.status).toBe(200);
    expect(await json<ChargeView>(res)).toMatchObject({ payment: { amount_cents: '106200', status: 'captured' }, replayed: false });

    const replay = await post(`${W}/charge`, { method: 'card' }, { 'idempotency-key': key });
    expect(replay.status).toBe(200);
    expect(await json<ChargeView>(replay)).toMatchObject({ replayed: true });
    expect((await post(`${W}/charge`, { method: 'card' }, { 'idempotency-key': `http-${randomUUID()}` })).status).toBe(409);
  });
});
