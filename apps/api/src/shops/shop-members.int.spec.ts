import { randomUUID } from 'node:crypto';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { ShopMemberInvitedPayload } from '@repo/types';
import { AccountsService } from '../accounts/accounts.service';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsService } from './shops.service';

/** Invitaciones y membresía contra Postgres REAL (UNIQUE, CHECK y outbox en la DB). */
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

const uniqueEmail = () => `m-${randomUUID().slice(0, 8)}@taller.do`;

const newAccount = (data: { email?: string; email_verified?: boolean } = {}) =>
  prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}`, ...data } });

async function newShop() {
  const owner = await prisma.account.create({
    data: { auth0_sub: `auth0|${randomUUID()}`, full_name: 'Ana Dueña' },
  });
  const shop = await shops.create(owner.id, { name: `Taller ${randomUUID().slice(0, 4)}`, type: 'mechanic_shop' });
  return { owner, shop };
}

const invitedEvents = (shopId: string) =>
  prisma.outboxEvent.findMany({
    where: { topic: 'ShopMemberInvited', payload: { path: ['shopId'], equals: shopId } },
  });

describe('Invitaciones a talleres (integración, Postgres real)', () => {
  it('email sin cuenta: queda invitado y se escribe UN evento; reinvitar no duplica ni renotifica', async () => {
    const { owner, shop } = await newShop();
    const email = uniqueEmail();

    const first = await shops.invite(shop.id, owner, { email, role: 'mechanic' });
    const again = await shops.invite(shop.id, owner, { email: email.toUpperCase(), role: 'mechanic' });

    expect(first).toMatchObject({ status: 'invited', role: 'mechanic', account_id: null, email });
    expect(again.id).toBe(first.id);
    const events = await invitedEvents(shop.id);
    expect(events).toHaveLength(1);
    expect(events[0].payload).toEqual({
      memberId: first.id,
      shopId: shop.id,
      shopName: shop.name,
      email,
      role: 'mechanic',
      status: 'invited',
      invitedByName: 'Ana Dueña',
    } satisfies ShopMemberInvitedPayload);
  });

  it('cuenta existente con email VERIFICADO: entra al instante (active)', async () => {
    const { owner, shop } = await newShop();
    const email = uniqueEmail();
    const mechanic = await newAccount({ email, email_verified: true });

    const member = await shops.invite(shop.id, owner, { email, role: 'advisor' });

    expect(member).toMatchObject({ status: 'active', account_id: mechanic.id, role: 'advisor' });
    expect((await shops.listMine(mechanic)).map((s) => s.id)).toEqual([shop.id]);
    expect((await invitedEvents(shop.id))[0].payload).toMatchObject({ status: 'active' });
  });

  it('SEGURIDAD: una cuenta con el email SIN verificar no toma la invitación', async () => {
    const { owner, shop } = await newShop();
    const email = uniqueEmail();
    const impostor = await newAccount({ email, email_verified: false });

    const member = await shops.invite(shop.id, owner, { email, role: 'mechanic' });
    expect(member.status).toBe('invited');
    expect(await shops.listMine(impostor)).toEqual([]);

    // Cuando Auth0 confirma el email, sí la reclama.
    const verified = await prisma.account.update({ where: { id: impostor.id }, data: { email_verified: true } });
    expect((await shops.listMine(verified)).map((s) => s.id)).toEqual([shop.id]);
    const row = await prisma.shopMember.findUniqueOrThrow({ where: { id: member.id } });
    expect(row).toMatchObject({ status: 'active', account_id: verified.id });
  });

  it('primer login: la cuenta nueva con ese email verificado reclama TODAS sus invitaciones', async () => {
    const email = uniqueEmail();
    const a = await newShop();
    const b = await newShop();
    await shops.invite(a.shop.id, a.owner, { email, role: 'mechanic' });
    await shops.invite(b.shop.id, b.owner, { email, role: 'advisor' });

    const account = await newAccount({ email: email.toUpperCase(), email_verified: true });
    const mine = await shops.listMine(account);

    expect(mine.map((s) => [s.id, s.my_role]).sort()).toEqual(
      [
        [a.shop.id, 'mechanic'],
        [b.shop.id, 'advisor'],
      ].sort(),
    );
    expect(await shops.claimInvitations(account)).toBe(0); // idempotente
  });

  it('invitación sobrante (ya era miembro por otra vía): se descarta al reclamar', async () => {
    const { owner, shop } = await newShop();
    const email = uniqueEmail();
    const account = await newAccount({ email, email_verified: true });
    await shops.invite(shop.id, owner, { email, role: 'mechanic' }); // entra activo
    await prisma.shopMember.create({
      data: { shop_id: shop.id, invited_email: `otro-${email}`, role: 'advisor', status: 'invited' },
    });
    await prisma.account.update({ where: { id: account.id }, data: { email: `otro-${email}` } });

    const claimed = await shops.claimInvitations({ ...account, email: `otro-${email}` });

    expect(claimed).toBe(0);
    expect(await prisma.shopMember.count({ where: { shop_id: shop.id, account_id: account.id } })).toBe(1);
    expect(await prisma.shopMember.count({ where: { shop_id: shop.id, invited_email: `otro-${email}` } })).toBe(0);
  });

  it('invitar a quien ya es miembro activo → 409', async () => {
    const { owner, shop } = await newShop();
    const email = uniqueEmail();
    await newAccount({ email, email_verified: true });
    await shops.invite(shop.id, owner, { email, role: 'mechanic' });

    await expect(shops.invite(shop.id, owner, { email, role: 'advisor' })).rejects.toThrow(ConflictException);
  });

  it('concurrencia: dos invitaciones simultáneas al mismo email → una fila y un evento', async () => {
    const { owner, shop } = await newShop();
    const email = uniqueEmail();

    const [x, y] = await Promise.all([
      shops.invite(shop.id, owner, { email, role: 'mechanic' }),
      shops.invite(shop.id, owner, { email, role: 'mechanic' }),
    ]);

    expect(x.id).toBe(y.id);
    expect(await prisma.shopMember.count({ where: { shop_id: shop.id, invited_email: email } })).toBe(1);
    expect(await invitedEvents(shop.id)).toHaveLength(1);
  });

  describe('removeMember', () => {
    it('cancela una invitación o quita a un miembro', async () => {
      const { owner, shop } = await newShop();
      const member = await shops.invite(shop.id, owner, { email: uniqueEmail(), role: 'mechanic' });
      await shops.removeMember(shop.id, member.id);
      expect(await prisma.shopMember.findUnique({ where: { id: member.id } })).toBeNull();
    });

    it('al owner no se le quita (403)', async () => {
      const { owner, shop } = await newShop();
      const ownerRow = await prisma.shopMember.findFirstOrThrow({ where: { shop_id: shop.id, account_id: owner.id } });
      await expect(shops.removeMember(shop.id, ownerRow.id)).rejects.toThrow(ForbiddenException);
    });

    it('un miembro de OTRO taller no se puede quitar desde este (404)', async () => {
      const a = await newShop();
      const b = await newShop();
      const memberOfB = await shops.invite(b.shop.id, b.owner, { email: uniqueEmail(), role: 'mechanic' });

      await expect(shops.removeMember(a.shop.id, memberOfB.id)).rejects.toThrow(NotFoundException);
      await expect(shops.removeMember(a.shop.id, 'no-es-uuid')).rejects.toThrow(NotFoundException);
      expect(await prisma.shopMember.findUnique({ where: { id: memberOfB.id } })).not.toBeNull();
    });
  });

  it('listMembers: dueño + invitaciones con su email', async () => {
    const { owner, shop } = await newShop();
    const email = uniqueEmail();
    await shops.invite(shop.id, owner, { email, role: 'mechanic' });

    const members = await shops.listMembers(shop.id);
    expect(members.map((m) => [m.role, m.status, m.email])).toEqual([
      ['owner', 'active', null],
      ['mechanic', 'invited', email],
    ]);
  });
});
