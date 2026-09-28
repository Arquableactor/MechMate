import { randomUUID } from 'node:crypto';
import { type CanActivate, type ExecutionContext, type INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { Account } from '@prisma/client';
import type { ShopView } from '@repo/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsModule } from './shops.module';

/**
 * Las rutas de talleres por HTTP real (app escuchando en un puerto libre):
 * prueba el cableado — guards en su lugar, validación de DTOs, status codes.
 * Solo se sustituye la verificación del JWT de Auth0 por una cuenta fija que
 * se elige por header (`x-test-account`).
 */
let app: INestApplication;
let prisma: PrismaService;
let base: string;

const fakeJwt: CanActivate = {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<{ headers: Record<string, string>; user?: { id: string } }>();
    const id = req.headers['x-test-account'];
    if (!id) return false; // sin "token" → 403 de Nest; aquí basta con que no pase
    req.user = { id };
    return true;
  },
};

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }), PrismaModule, ShopsModule],
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

const as = (account: Account) => ({ 'x-test-account': account.id, 'content-type': 'application/json' });
const json = async <T>(res: Response): Promise<T> => (await res.json()) as T;
const newAccount = () => prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } });

describe('Shops por HTTP', () => {
  it('POST /v1/shops crea (201) y GET /v1/shops/mine lo lista', async () => {
    const owner = await newAccount();
    const res = await fetch(`${base}/shops`, {
      method: 'POST',
      headers: as(owner),
      body: JSON.stringify({ name: '  Taller Pérez  ' }),
    });
    expect(res.status).toBe(201);
    const shop = await json<ShopView>(res);
    expect(shop).toMatchObject({ name: 'Taller Pérez', type: 'mechanic_shop', my_role: 'owner' });

    const mine = await json<ShopView[]>(await fetch(`${base}/shops/mine`, { headers: as(owner) }));
    expect(mine.map((s) => s.id)).toEqual([shop.id]);
  });

  it('POST /v1/shops valida el body (400): nombre corto, tipo inválido', async () => {
    const owner = await newAccount();
    for (const body of [{ name: 'x' }, { name: 'Taller', type: 'courier' }, {}]) {
      const res = await fetch(`${base}/shops`, { method: 'POST', headers: as(owner), body: JSON.stringify(body) });
      expect(res.status).toBe(400);
    }
  });

  it('GET /v1/shops/:shopId: 200 para el miembro, 404 para otro taller, id raro o inexistente', async () => {
    const a = await newAccount();
    const b = await newAccount();
    const shopA = await json<ShopView>(
      await fetch(`${base}/shops`, { method: 'POST', headers: as(a), body: JSON.stringify({ name: 'Taller A' }) }),
    );

    expect((await fetch(`${base}/shops/${shopA.id}`, { headers: as(a) })).status).toBe(200);

    for (const id of [shopA.id, randomUUID(), 'no-es-uuid']) {
      const res = await fetch(`${base}/shops/${id}`, { headers: as(b) });
      expect(res.status).toBe(404);
      expect(await json<{ message: string }>(res)).toMatchObject({ message: 'Taller no encontrado' });
    }
  });

  it('sin autenticación no se accede', async () => {
    expect((await fetch(`${base}/shops/mine`)).status).toBe(403);
  });
});
