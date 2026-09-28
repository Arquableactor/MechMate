import { randomUUID } from 'node:crypto';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';
import { CustomersService } from './customers.service';

/** Clientes contra Postgres REAL: UNIQUE/CHECK por taller y aislamiento multi-tenant. */
let prisma: PrismaService;
let shops: ShopsService;
let customers: CustomersService;

beforeAll(async () => {
  prisma = new PrismaService();
  await prisma.$connect();
  shops = new ShopsService(prisma, new AccountsService(prisma));
  customers = new CustomersService(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

async function newShop() {
  const owner = await prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } });
  return (await shops.create(owner.id, { name: 'Taller', type: 'mechanic_shop' })).id;
}

/** Teléfono RD único por test (los UNIQUE son por taller, pero así no dependemos de eso). */
const phone = () => `809${String(Math.floor(Math.random() * 1e7)).padStart(7, '0')}`;

describe('Clientes (integración, Postgres real)', () => {
  it('crea normalizando nombre, teléfono, cédula y email', async () => {
    const shopId = await newShop();
    const c = await customers.create(shopId, {
      full_name: '  Juan    Pérez ',
      phone: '(809) 555-0101',
      document_id: '001-1234567-8',
      email: ' Juan@Mail.DO ',
    });
    expect(c).toMatchObject({
      full_name: 'Juan Pérez',
      phone: '+18095550101',
      document_id: '00112345678',
      email: 'juan@mail.do',
      account_id: null,
    });
  });

  it('datos inválidos → 400 con mensaje claro', async () => {
    const shopId = await newShop();
    await expect(customers.create(shopId, { full_name: 'Ana', phone: '555-1234' })).rejects.toThrow(/Teléfono inválido/);
    await expect(customers.create(shopId, { full_name: 'Ana', document_id: '123' })).rejects.toThrow(/Cédula inválida/);
    await expect(customers.create(shopId, { full_name: ' ' })).rejects.toThrow(BadRequestException);
  });

  it('mismo teléfono escrito distinto en el MISMO taller → 409 con el id existente', async () => {
    const shopId = await newShop();
    const p = phone();
    const first = await customers.create(shopId, { full_name: 'Ana', phone: p });

    const dup = customers.create(shopId, { full_name: 'Ana Otra', phone: `+1 ${p.slice(0, 3)}-${p.slice(3, 6)}-${p.slice(6)}` });
    await expect(dup).rejects.toThrow(ConflictException);
    await dup.catch((e: ConflictException) =>
      expect(e.getResponse()).toMatchObject({ existing_customer_id: first.id }),
    );
  });

  it('misma cédula en el mismo taller → 409; en OTRO taller sí se puede', async () => {
    const a = await newShop();
    const b = await newShop();
    await customers.create(a, { full_name: 'Ana', document_id: '40212345678' });

    await expect(customers.create(a, { full_name: 'Otra Ana', document_id: '402-1234567-8' })).rejects.toThrow(ConflictException);
    await expect(customers.create(b, { full_name: 'Ana', document_id: '40212345678' })).resolves.toBeDefined();
  });

  describe('aislamiento entre talleres', () => {
    it('get / update / assertInShop de un cliente de OTRO taller → 404', async () => {
      const a = await newShop();
      const b = await newShop();
      const ofA = await customers.create(a, { full_name: 'Cliente de A' });

      await expect(customers.get(b, ofA.id)).rejects.toThrow(NotFoundException);
      await expect(customers.update(b, ofA.id, { full_name: 'Hackeado' })).rejects.toThrow(NotFoundException);
      await expect(customers.assertInShop(b, ofA.id)).rejects.toThrow(NotFoundException);
      await expect(customers.get(a, 'no-es-uuid')).rejects.toThrow(NotFoundException);
      expect((await customers.get(a, ofA.id)).full_name).toBe('Cliente de A');
    });

    it('la búsqueda nunca devuelve clientes de otro taller', async () => {
      const a = await newShop();
      const b = await newShop();
      await customers.create(a, { full_name: 'Zacarías Único' });

      expect((await customers.search(b, { q: 'Zacarías' })).items).toEqual([]);
      expect((await customers.search(b, {})).items).toEqual([]);
    });
  });

  it('update: normaliza, null borra el dato, y choca (409) con el teléfono de otro cliente', async () => {
    const shopId = await newShop();
    const p = phone();
    await customers.create(shopId, { full_name: 'Ana', phone: p });
    const pedro = await customers.create(shopId, { full_name: 'Pedro', email: 'p@mail.do', notes: 'VIP' });

    const updated = await customers.update(shopId, pedro.id, { email: null, notes: '  ', full_name: ' Pedro  Díaz ' });
    expect(updated).toMatchObject({ full_name: 'Pedro Díaz', email: null, notes: null });
    await expect(customers.update(shopId, pedro.id, { phone: p })).rejects.toThrow(ConflictException);
  });

  describe('búsqueda', () => {
    it('por nombre (parcial, sin distinguir mayúsculas), teléfono parcial y cédula', async () => {
      const shopId = await newShop();
      const juan = await customers.create(shopId, { full_name: 'Juan Pérez', phone: '8095550199' });
      const maria = await customers.create(shopId, { full_name: 'María Gómez', document_id: '00198765432' });

      const ids = async (q: string) => (await customers.search(shopId, { q })).items.map((c) => c.id);
      expect(await ids('pérez')).toEqual([juan.id]);
      expect(await ids('0199')).toEqual([juan.id]);
      expect(await ids('809-555')).toEqual([juan.id]);
      expect(await ids('001-987')).toEqual([maria.id]);
      expect(await ids('nadie')).toEqual([]);
    });

    it('paginación por cursor: del más nuevo al más viejo, sin repetir ni saltar', async () => {
      const shopId = await newShop();
      const created = [];
      for (let i = 1; i <= 5; i++) created.push(await customers.create(shopId, { full_name: `Cliente ${i}` }));

      const seen: string[] = [];
      let cursor: string | undefined;
      do {
        const page = await customers.search(shopId, { limit: 2, cursor });
        seen.push(...page.items.map((c) => c.full_name));
        cursor = page.next_cursor ?? undefined;
      } while (cursor);

      expect(seen).toEqual(['Cliente 5', 'Cliente 4', 'Cliente 3', 'Cliente 2', 'Cliente 1']);
    });
  });

  it('la DB rechaza datos sin normalizar (CHECK), aunque alguien se salte el servicio', async () => {
    const shopId = await newShop();
    await expect(
      prisma.customer.create({ data: { shop_id: shopId, full_name: 'X', phone: '809-555-1234' } }),
    ).rejects.toThrow(/customers_phone_e164_check/);
    await expect(
      prisma.customer.create({ data: { shop_id: shopId, full_name: 'X', document_id: '001-1234567-8' } }),
    ).rejects.toThrow(/customers_document_id_check/);
  });
});
