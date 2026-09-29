import { randomUUID } from 'node:crypto';
import { type CanActivate, type ExecutionContext, type INestApplication, RequestMethod, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { ApprovalRequestView, PublicApprovalView, ShopView, WorkOrderDetailView, WorkOrderView } from '@repo/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsModule } from '../shops/shops.module';
import { STORAGE_PROVIDER } from '../storage/storage-provider.interface';
import { StorageModule } from '../storage/storage.module';
import { VIN_DECODER } from '../vin/vin-decoder.interface';
import { WorkOrdersModule } from '../work-orders/work-orders.module';
import { ApprovalsModule } from './approvals.module';

/** Rutas de aprobación por HTTP real: las del taller (con cuenta) y las públicas (sin cuenta). */
let app: INestApplication;
let prisma: PrismaService;
let base: string;
let root: string;

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
      StorageModule, // global en la app (AppModule); aquí se reemplaza por un fake
      ShopsModule,
      WorkOrdersModule,
      ApprovalsModule,
    ],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue(fakeJwt)
    .overrideProvider(VIN_DECODER)
    .useValue({ provider: 'x', decode: async () => null })
    .overrideProvider(STORAGE_PROVIDER)
    .useValue({ provider: 'x', createDownloadUrl: async () => ({ url: 'x', expiresAt: '' }) })
    .compile();
  app = moduleRef.createNestApplication();
  app.setGlobalPrefix('v1', { exclude: [{ path: 'a/:token', method: RequestMethod.GET }] }); // como en main.ts
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(0);
  root = (await app.getUrl()).replace('[::1]', 'localhost');
  base = `${root}/v1`;
  prisma = app.get(PrismaService);
});

afterAll(async () => {
  await app?.close();
});

const json = async <T>(res: Response): Promise<T> => (await res.json()) as T;
const call = (accountId: string | null, method: string, path: string, body?: unknown) =>
  fetch(`${base}${path}`, {
    method,
    headers: { ...(accountId ? { 'x-test-account': accountId } : {}), 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

describe('Aprobaciones por HTTP', () => {
  it('taller pide (201) → cliente SIN cuenta ve (200) y decide (200); enlace inválido 404; body malo 400', async () => {
    const owner = await prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } });
    const shop = await json<ShopView>(await call(owner.id, 'POST', '/shops', { name: 'Taller HTTP' }));
    const customer = await prisma.customer.create({ data: { shop_id: shop.id, full_name: 'Ana López' } });
    const vehicle = await prisma.vehicle.create({
      data: { shop_id: shop.id, customer_id: customer.id, plate: `H${Date.now() % 1e6}`, make: 'Kia', data_source: 'manual' },
    });
    const wo = await json<WorkOrderView>(
      await call(owner.id, 'POST', `/shops/${shop.id}/work-orders`, { customer_id: customer.id, vehicle_id: vehicle.id, complaint: 'Frenos' }),
    );
    const detail = await json<WorkOrderDetailView>(
      await call(owner.id, 'POST', `/shops/${shop.id}/work-orders/${wo.id}/items`, {
        type: 'part', description: 'Pastillas', quantity: '1', unit_price_cents: '350000', requires_approval: true,
      }),
    );
    expect(detail.items[0].approval_status).toBe('proposed');

    const created = await call(owner.id, 'POST', `/shops/${shop.id}/work-orders/${wo.id}/approval-requests`);
    expect(created.status).toBe(201);
    const token = (await json<ApprovalRequestView>(created)).link.split('/a/')[1];

    // La página HTML (fuera de /v1), con sus encabezados de seguridad.
    const page = await fetch(`${root}/a/${token}`);
    expect(page.status).toBe(200);
    expect(page.headers.get('content-type')).toContain('text/html');
    expect(page.headers.get('referrer-policy')).toBe('no-referrer');
    expect(page.headers.get('content-security-policy')).toMatch(/script-src 'nonce-[A-Za-z0-9+/=]+'/);
    expect(await page.text()).toContain('Hola Ana, este es el presupuesto de tu vehículo');
    const bad = await fetch(`${root}/a/no-es-un-token`);
    expect(bad.status).toBe(404);
    expect(await bad.text()).toContain('Este enlace no es válido');

    const view = await call(null, 'GET', `/public/approvals/${token}`);
    expect(view.status).toBe(200);
    expect(await json<PublicApprovalView>(view)).toMatchObject({ customer_first_name: 'Ana', status: 'pending' });

    expect((await call(null, 'GET', `/public/approvals/${token.slice(0, -2)}xx`)).status).toBe(404);
    expect((await call(null, 'POST', `/public/approvals/${token}/decisions`, { decisions: [] })).status).toBe(400);
    expect(
      (await call(null, 'POST', `/public/approvals/${token}/decisions`, { decisions: [{ item_id: detail.items[0].id, decision: 'maybe' }] })).status,
    ).toBe(400);

    const decided = await call(null, 'POST', `/public/approvals/${token}/decisions`, {
      decisions: [{ item_id: detail.items[0].id, decision: 'approved' }],
    });
    expect(decided.status).toBe(200);
    expect(await json<PublicApprovalView>(decided)).toMatchObject({ status: 'completed', total_cents: '413000' }); // 3,500 + ITBIS 18%
  });
});
