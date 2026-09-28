import { randomUUID } from 'node:crypto';
import { type CanActivate, type ExecutionContext, type INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { Account } from '@prisma/client';
import type { ShopMemberView, ShopView } from '@repo/types';
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

  describe('miembros', () => {
    const post = (account: Account, path: string, body: unknown) =>
      fetch(`${base}${path}`, { method: 'POST', headers: as(account), body: JSON.stringify(body) });

    it('owner invita (201); mecánico no puede (403); body inválido (400); otro taller (404)', async () => {
      const owner = await newAccount();
      const outsider = await newAccount();
      const shop = await json<ShopView>(await post(owner, '/shops', { name: 'Taller M' }));
      const mechanic = await newAccount();
      await prisma.shopMember.create({
        data: { shop_id: shop.id, account_id: mechanic.id, role: 'mechanic', status: 'active' },
      });
      const path = `/shops/${shop.id}/members`;

      const invited = await post(owner, path, { email: ' Pedro@Mail.DO ', role: 'mechanic' });
      expect(invited.status).toBe(201);
      expect(await json<ShopMemberView>(invited)).toMatchObject({ email: 'pedro@mail.do', status: 'invited' });

      expect((await post(mechanic, path, { email: 'x@mail.do', role: 'mechanic' })).status).toBe(403);
      expect((await post(owner, path, { email: 'no-es-email', role: 'mechanic' })).status).toBe(400);
      expect((await post(owner, path, { email: 'y@mail.do', role: 'owner' })).status).toBe(400);
      expect((await post(outsider, path, { email: 'z@mail.do', role: 'mechanic' })).status).toBe(404);

      // Cualquier miembro ve la lista; alguien de afuera no.
      const list = await fetch(`${base}${path}`, { headers: as(mechanic) });
      expect(list.status).toBe(200);
      expect((await json<ShopMemberView[]>(list)).map((m) => m.role)).toEqual(['owner', 'mechanic', 'mechanic']);
      expect((await fetch(`${base}${path}`, { headers: as(outsider) })).status).toBe(404);
    });

    it('DELETE: owner quita (204); al owner no (403); mecánico no puede quitar (403)', async () => {
      const owner = await newAccount();
      const shop = await json<ShopView>(await post(owner, '/shops', { name: 'Taller D' }));
      const path = `/shops/${shop.id}/members`;
      const invite = await json<ShopMemberView>(await post(owner, path, { email: 'q@mail.do', role: 'advisor' }));
      const members = await json<ShopMemberView[]>(await fetch(`${base}${path}`, { headers: as(owner) }));
      const ownerRow = members.find((m) => m.role === 'owner')!;
      const mechanic = await newAccount();
      await prisma.shopMember.create({
        data: { shop_id: shop.id, account_id: mechanic.id, role: 'mechanic', status: 'active' },
      });
      const del = (account: Account, id: string) =>
        fetch(`${base}${path}/${id}`, { method: 'DELETE', headers: as(account) });

      expect((await del(mechanic, invite.id)).status).toBe(403);
      expect((await del(owner, ownerRow.id)).status).toBe(403);
      expect((await del(owner, invite.id)).status).toBe(204);
      expect((await del(owner, invite.id)).status).toBe(404);
    });
  });

  it('sin autenticación no se accede', async () => {
    expect((await fetch(`${base}/shops/mine`)).status).toBe(403);
  });
});
