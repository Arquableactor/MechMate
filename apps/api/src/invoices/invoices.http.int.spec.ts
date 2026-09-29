import { randomUUID } from 'node:crypto';
import { type CanActivate, type ExecutionContext, type INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { InvoiceView, Page, ShopView, WorkOrderView } from '@repo/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsModule } from '../shops/shops.module';
import { VIN_DECODER } from '../vin/vin-decoder.interface';
import { WorkOrdersModule } from '../work-orders/work-orders.module';
import { InvoicesModule } from './invoices.module';

/** Rutas de facturación por HTTP real. */
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
    imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }), PrismaModule, ShopsModule, WorkOrdersModule, InvoicesModule],
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
const call = (accountId: string, method: string, path: string, body?: unknown) =>
  fetch(`${base}${path}`, {
    method,
    headers: { 'x-test-account': accountId, 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

describe('Facturas por HTTP', () => {
  it('facturar (201), repetir (409), ver por OT y listar (200); otro taller (404)', async () => {
    const owner = await prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } });
    const outsider = await prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } });
    await call(outsider.id, 'POST', '/shops', { name: 'Otro taller' });
    const shop = await json<ShopView>(await call(owner.id, 'POST', '/shops', { name: 'Taller F' }));
    const c = await prisma.customer.create({ data: { shop_id: shop.id, full_name: 'Ana López' } });
    const v = await prisma.vehicle.create({ data: { shop_id: shop.id, customer_id: c.id, plate: `K${Date.now() % 1e6}`, make: 'Kia', data_source: 'manual' } });
    const wo = await json<WorkOrderView>(
      await call(owner.id, 'POST', `/shops/${shop.id}/work-orders`, { customer_id: c.id, vehicle_id: v.id, complaint: 'Aceite' }),
    );
    const W = `/shops/${shop.id}/work-orders/${wo.id}`;
    await call(owner.id, 'POST', `${W}/items`, { type: 'part', description: 'Aceite', quantity: '1', unit_price_cents: '90000' });

    expect((await call(owner.id, 'POST', `${W}/invoice`)).status).toBe(409); // aún en draft
    await call(owner.id, 'POST', `${W}/transitions`, { to: 'in_progress' });
    await call(owner.id, 'POST', `${W}/transitions`, { to: 'completed' });

    const created = await call(owner.id, 'POST', `${W}/invoice`);
    expect(created.status).toBe(201);
    const inv = await json<InvoiceView>(created);
    expect(inv).toMatchObject({ code: 'FAC-0001', total_cents: '106200', status: 'issued' });
    expect((await call(owner.id, 'POST', `${W}/invoice`)).status).toBe(409);

    expect((await json<InvoiceView>(await call(owner.id, 'GET', `${W}/invoice`))).id).toBe(inv.id);
    expect((await json<Page<InvoiceView>>(await call(owner.id, 'GET', `/shops/${shop.id}/invoices`))).items.map((i) => i.id)).toEqual([inv.id]);
    expect((await call(owner.id, 'GET', `/shops/${shop.id}/invoices/${inv.id}`)).status).toBe(200);
    expect((await call(outsider.id, 'GET', `/shops/${shop.id}/invoices/${inv.id}`)).status).toBe(404);
  });
});
