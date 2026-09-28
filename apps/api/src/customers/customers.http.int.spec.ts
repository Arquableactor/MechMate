import { randomUUID } from 'node:crypto';
import { type CanActivate, type ExecutionContext, type INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { CustomerView, Page, ShopView } from '@repo/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsModule } from '../shops/shops.module';
import { CustomersModule } from './customers.module';

/** Rutas de clientes por HTTP real: guard de taller, validación y status codes. */
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
    imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }), PrismaModule, ShopsModule, CustomersModule],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue(fakeJwt)
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

async function ownerWithShop() {
  const owner = await prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } });
  const shop = await json<ShopView>(await call(owner.id, 'POST', '/shops', { name: 'Taller HTTP' }));
  return { ownerId: owner.id, shopId: shop.id };
}

describe('Clientes por HTTP', () => {
  it('crear (201), buscar, ver y editar dentro del taller', async () => {
    const { ownerId, shopId } = await ownerWithShop();
    const path = `/shops/${shopId}/customers`;

    const created = await call(ownerId, 'POST', path, { full_name: 'Juan Pérez', phone: '809-555-0142' });
    expect(created.status).toBe(201);
    const juan = await json<CustomerView>(created);
    expect(juan.phone).toBe('+18095550142');

    const page = await json<Page<CustomerView>>(await call(ownerId, 'GET', `${path}?q=0142&limit=5`));
    expect(page.items.map((c) => c.id)).toEqual([juan.id]);

    expect((await call(ownerId, 'GET', `${path}/${juan.id}`)).status).toBe(200);
    const patched = await call(ownerId, 'PATCH', `${path}/${juan.id}`, { phone: null });
    expect((await json<CustomerView>(patched)).phone).toBeNull();
  });

  it('validación: 400 por body o query inválidos', async () => {
    const { ownerId, shopId } = await ownerWithShop();
    const path = `/shops/${shopId}/customers`;
    for (const body of [{}, { full_name: 'A' }, { full_name: 'Ana', email: 'no-email' }, { full_name: 'Ana', phone: '555' }]) {
      expect((await call(ownerId, 'POST', path, body)).status).toBe(400);
    }
    expect((await call(ownerId, 'GET', `${path}?limit=500`)).status).toBe(400);
    expect((await call(ownerId, 'GET', `${path}?cursor=abc`)).status).toBe(400);
  });

  it('duplicado → 409 con existing_customer_id', async () => {
    const { ownerId, shopId } = await ownerWithShop();
    const path = `/shops/${shopId}/customers`;
    const first = await json<CustomerView>(await call(ownerId, 'POST', path, { full_name: 'Ana', document_id: '00111111111' }));

    const dup = await call(ownerId, 'POST', path, { full_name: 'Ana B', document_id: '001-1111111-1' });
    expect(dup.status).toBe(409);
    expect(await json<{ existing_customer_id: string }>(dup)).toMatchObject({ existing_customer_id: first.id });
  });

  it('otro taller: 404 en todo (lista, detalle, edición, alta)', async () => {
    const a = await ownerWithShop();
    const b = await ownerWithShop();
    const ofA = await json<CustomerView>(await call(a.ownerId, 'POST', `/shops/${a.shopId}/customers`, { full_name: 'De A' }));

    // B usando la ruta del taller A: el guard corta.
    expect((await call(b.ownerId, 'GET', `/shops/${a.shopId}/customers`)).status).toBe(404);
    expect((await call(b.ownerId, 'POST', `/shops/${a.shopId}/customers`, { full_name: 'Intruso' })).status).toBe(404);
    // B usando SU taller con el id de un cliente de A: el servicio corta.
    expect((await call(b.ownerId, 'GET', `/shops/${b.shopId}/customers/${ofA.id}`)).status).toBe(404);
    expect((await call(b.ownerId, 'PATCH', `/shops/${b.shopId}/customers/${ofA.id}`, { full_name: 'Hack' })).status).toBe(404);
  });
});
