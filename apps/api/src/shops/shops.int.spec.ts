import { randomUUID } from 'node:crypto';
import { type ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { ShopMember } from '@prisma/client';
import type { ShopMemberRole } from '@repo/types';
import { AccountsService } from '../accounts/accounts.service';
import { PrismaService } from '../prisma/prisma.service';
import { ShopAccessGuard } from './shop-access.guard';
import { ShopsService } from './shops.service';

/**
 * Aislamiento multi-tenant contra Postgres REAL: el guard con el servicio real,
 * sin mocks de membresía. Es lo primero que audita un comprador técnico.
 */
let prisma: PrismaService;
let shops: ShopsService;

beforeAll(async () => {
  prisma = new PrismaService();
  await prisma.$connect();
  shops = new ShopsService(prisma, new AccountsService(prisma));
});

afterAll(async () => {
  await prisma.$disconnect();
});

const newAccount = () =>
  prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } });

/** Ejecuta el guard como lo haría Nest en `/v1/shops/:shopId/...`. */
async function access(shopId: string, accountId: string, requiredRoles?: ShopMemberRole[]) {
  const request: { user: { id: string }; params: { shopId: string }; shopMember?: ShopMember } = {
    user: { id: accountId },
    params: { shopId },
  };
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;
  const reflector = { getAllAndOverride: () => requiredRoles } as unknown as Reflector;
  await new ShopAccessGuard(shops, reflector).canActivate(context);
  return request.shopMember;
}

describe('Shops (integración, Postgres real)', () => {
  it('crear taller: queda como owner activo y recibe el rol global que corresponde', async () => {
    const owner = await newAccount();
    const view = await shops.create(owner.id, { name: 'Taller Uno', type: 'mechanic_shop' });

    expect(view).toMatchObject({ name: 'Taller Uno', type: 'mechanic_shop', my_role: 'owner', commission_bps: 800 });
    const member = await prisma.shopMember.findUniqueOrThrow({
      where: { shop_id_account_id: { shop_id: view.id, account_id: owner.id } },
    });
    expect(member).toMatchObject({ role: 'owner', status: 'active' });
    const roles = await prisma.accountRole.findMany({ where: { account_id: owner.id } });
    expect(roles.map((r) => r.role)).toEqual(['mechanic']);

    const seller = await newAccount();
    await shops.create(seller.id, { name: 'Repuestos Dos', type: 'parts_seller' });
    const sellerRoles = await prisma.accountRole.findMany({ where: { account_id: seller.id } });
    expect(sellerRoles.map((r) => r.role)).toEqual(['seller']);
  });

  it('listMine: cada cuenta ve solo sus talleres', async () => {
    const a = await newAccount();
    const b = await newAccount();
    const shopA = await shops.create(a.id, { name: 'Taller A', type: 'mechanic_shop' });
    const shopB = await shops.create(b.id, { name: 'Taller B', type: 'mechanic_shop' });

    expect((await shops.listMine(a)).map((s) => s.id)).toEqual([shopA.id]);
    expect((await shops.listMine(b)).map((s) => s.id)).toEqual([shopB.id]);
  });

  describe('ShopAccessGuard: aislamiento entre talleres', () => {
    it('el miembro pasa y el guard adjunta su membresía', async () => {
      const owner = await newAccount();
      const shop = await shops.create(owner.id, { name: 'Taller', type: 'mechanic_shop' });
      await expect(access(shop.id, owner.id)).resolves.toMatchObject({ role: 'owner', shop_id: shop.id });
    });

    it('alguien del taller B pidiendo el taller A → 404 (no revela que existe)', async () => {
      const a = await newAccount();
      const b = await newAccount();
      const shopA = await shops.create(a.id, { name: 'Taller A', type: 'mechanic_shop' });
      await shops.create(b.id, { name: 'Taller B', type: 'mechanic_shop' });

      await expect(access(shopA.id, b.id)).rejects.toThrow(NotFoundException);
    });

    it('taller inexistente e id mal formado → el mismo 404', async () => {
      const a = await newAccount();
      await expect(access(randomUUID(), a.id)).rejects.toThrow(NotFoundException);
      await expect(access('no-es-uuid', a.id)).rejects.toThrow(NotFoundException);
      await expect(access("' OR 1=1 --", a.id)).rejects.toThrow(NotFoundException);
    });

    it('una invitación pendiente todavía NO da acceso', async () => {
      const owner = await newAccount();
      const invited = await newAccount();
      const shop = await shops.create(owner.id, { name: 'Taller', type: 'mechanic_shop' });
      await prisma.shopMember.create({
        data: { shop_id: shop.id, account_id: invited.id, role: 'mechanic', status: 'invited' },
      });

      await expect(access(shop.id, invited.id)).rejects.toThrow(NotFoundException);
    });

    it('miembro sin el rol requerido → 403 (ya sabe que el taller existe)', async () => {
      const owner = await newAccount();
      const mechanic = await newAccount();
      const shop = await shops.create(owner.id, { name: 'Taller', type: 'mechanic_shop' });
      await prisma.shopMember.create({
        data: { shop_id: shop.id, account_id: mechanic.id, role: 'mechanic', status: 'active' },
      });

      await expect(access(shop.id, mechanic.id, ['owner'])).rejects.toThrow(ForbiddenException);
      await expect(access(shop.id, mechanic.id, ['owner', 'mechanic'])).resolves.toBeDefined();
      await expect(access(shop.id, owner.id, ['owner'])).resolves.toBeDefined();
    });
  });

  describe('restricciones en la DB (CHECK)', () => {
    it('un miembro activo sin cuenta se rechaza EN LA DB', async () => {
      const owner = await newAccount();
      const shop = await shops.create(owner.id, { name: 'Taller', type: 'mechanic_shop' });
      await expect(
        prisma.shopMember.create({
          data: { shop_id: shop.id, invited_email: 'x@mail.do', role: 'mechanic', status: 'active' },
        }),
      ).rejects.toThrow(/shop_members_active_has_account_check/);
    });

    it('un email invitado con mayúsculas se rechaza EN LA DB', async () => {
      const owner = await newAccount();
      const shop = await shops.create(owner.id, { name: 'Taller', type: 'mechanic_shop' });
      await expect(
        prisma.shopMember.create({
          data: { shop_id: shop.id, invited_email: 'Juan@Mail.do', role: 'mechanic', status: 'invited' },
        }),
      ).rejects.toThrow(/shop_members_invited_email_lower_check/);
    });
  });

  it('getCommissionBps / assertExists: 404 para un taller inexistente', async () => {
    await expect(shops.getCommissionBps(randomUUID())).rejects.toThrow(NotFoundException);
    await expect(shops.assertExists('no-es-uuid')).rejects.toThrow(NotFoundException);
  });
});
