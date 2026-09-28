import { randomUUID } from 'node:crypto';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { CustomersService } from '../customers/customers.service';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';
import { hasValidCheckDigit } from '../vin/vin';
import type { DecodedVehicle, VinDecoder } from '../vin/vin-decoder.interface';
import { VinService } from '../vin/vin.service';
import { VehiclesService } from './vehicles.service';

/** Vehículos contra Postgres REAL: FK compuesta, UNIQUE/CHECK por taller, aislamiento. */
let prisma: PrismaService;
let shops: ShopsService;
let customers: CustomersService;
let known: Set<string>;

const decoded: DecodedVehicle = {
  make: 'TOYOTA',
  model: 'Corolla',
  year: 2019,
  trim: 'LE',
  engine: '1.8L 4 cil.',
  fuelType: 'Gasolina',
  bodyClass: 'Sedan/Saloon',
  driveType: null,
  transmission: null,
  warnings: [],
  raw: {},
};

/** Proveedor fake: solo "conoce" los VINs de `known`. */
const decoder: VinDecoder = {
  provider: 'nhtsa',
  decode: async (vin) => (known.has(vin) ? decoded : null),
};

let vehicles: VehiclesService;

beforeAll(async () => {
  prisma = new PrismaService();
  await prisma.$connect();
  shops = new ShopsService(prisma, new AccountsService(prisma));
  customers = new CustomersService(prisma);
  known = new Set();
  vehicles = new VehiclesService(prisma, customers, new VinService(prisma, decoder));
});

afterAll(async () => {
  await prisma.$disconnect();
});

const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
function newVin(knownByProvider = true): string {
  for (;;) {
    const vin = Array.from({ length: 17 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    if (!hasValidCheckDigit(vin)) continue;
    if (knownByProvider) known.add(vin);
    return vin;
  }
}
const newPlate = () => `A${String(Math.floor(Math.random() * 1e6)).padStart(6, '0')}`;

async function shopWithCustomer() {
  const owner = await prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } });
  const shopId = (await shops.create(owner.id, { name: 'Taller', type: 'mechanic_shop' })).id;
  const customer = await customers.create(shopId, { full_name: 'Cliente' });
  return { shopId, customerId: customer.id };
}

describe('Vehículos (integración, Postgres real)', () => {
  it('con VIN: se autocompleta desde la decodificación (data_source vin_decode)', async () => {
    const { shopId, customerId } = await shopWithCustomer();
    const vin = newVin();
    const v = await vehicles.create(shopId, { customer_id: customerId, vin: vin.toLowerCase(), mileage_km: 85000 });

    expect(v).toMatchObject({
      vin,
      make: 'TOYOTA',
      model: 'Corolla',
      year: 2019,
      engine: '1.8L 4 cil.',
      fuel_type: 'Gasolina',
      mileage_km: 85000,
      data_source: 'vin_decode',
    });
  });

  it('lo escrito a mano gana sobre lo decodificado; null explícito lo deja vacío', async () => {
    const { shopId, customerId } = await shopWithCustomer();
    const v = await vehicles.create(shopId, {
      customer_id: customerId,
      vin: newVin(),
      model: 'Corolla Cross',
      trim: null,
      engine: '   ',
    });
    expect(v).toMatchObject({ make: 'TOYOTA', model: 'Corolla Cross', trim: null, engine: null, year: 2019 });
  });

  it('chasis japonés sin VIN: carga manual; sin marca → 400', async () => {
    const { shopId, customerId } = await shopWithCustomer();
    const chassis = `NZE121-${Math.floor(Math.random() * 1e7)}`;

    await expect(vehicles.create(shopId, { customer_id: customerId, chassis_number: chassis })).rejects.toThrow(
      /Indica la marca/,
    );
    const v = await vehicles.create(shopId, {
      customer_id: customerId,
      chassis_number: chassis.toLowerCase(),
      make: 'Toyota',
      model: 'Corolla Fielder',
      year: 2007,
    });
    expect(v).toMatchObject({ chassis_number: chassis, vin: null, make: 'Toyota', data_source: 'manual' });
  });

  it('VIN que el proveedor no conoce: pide la marca; con marca queda manual', async () => {
    const { shopId, customerId } = await shopWithCustomer();
    const vin = newVin(false);
    await expect(vehicles.create(shopId, { customer_id: customerId, vin })).rejects.toThrow(/No se pudo decodificar/);
    const v = await vehicles.create(shopId, { customer_id: customerId, vin, make: 'Kia' });
    expect(v).toMatchObject({ vin, make: 'Kia', data_source: 'manual' });
  });

  it('sin ningún identificador, o con formatos inválidos → 400', async () => {
    const { shopId, customerId } = await shopWithCustomer();
    for (const input of [
      { make: 'Kia' },
      { vin: 'NZE121-1234567', make: 'Kia' },
      { plate: 'A1', make: 'Kia' },
      { chassis_number: '!!', make: 'Kia' },
    ]) {
      await expect(vehicles.create(shopId, { customer_id: customerId, ...input })).rejects.toThrow(BadRequestException);
    }
  });

  it('placa repetida (escrita distinto) en el mismo taller → 409 con el id; en otro taller sí', async () => {
    const a = await shopWithCustomer();
    const b = await shopWithCustomer();
    const plate = newPlate();
    const first = await vehicles.create(a.shopId, { customer_id: a.customerId, plate, make: 'Honda' });

    const dup = vehicles.create(a.shopId, {
      customer_id: a.customerId,
      plate: `${plate[0].toLowerCase()}-${plate.slice(1)}`,
      make: 'Honda',
    });
    await expect(dup).rejects.toThrow(ConflictException);
    await dup.catch((e: ConflictException) => expect(e.getResponse()).toMatchObject({ existing_vehicle_id: first.id }));
    await expect(vehicles.create(b.shopId, { customer_id: b.customerId, plate, make: 'Honda' })).resolves.toBeDefined();
  });

  describe('aislamiento entre talleres', () => {
    it('no se puede asignar a un cliente de OTRO taller (404 en el servicio)', async () => {
      const a = await shopWithCustomer();
      const b = await shopWithCustomer();
      await expect(
        vehicles.create(a.shopId, { customer_id: b.customerId, plate: newPlate(), make: 'Kia' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('…y la DB tampoco lo permite (FK compuesta), aunque se salte el servicio', async () => {
      const a = await shopWithCustomer();
      const b = await shopWithCustomer();
      await expect(
        prisma.vehicle.create({
          data: { shop_id: a.shopId, customer_id: b.customerId, plate: newPlate(), make: 'Kia', data_source: 'manual' },
        }),
      ).rejects.toThrow(/vehicles_customer_id_shop_id_fkey|Foreign key constraint/);
    });

    it('get / update / búsqueda desde otro taller: 404 o vacío', async () => {
      const a = await shopWithCustomer();
      const b = await shopWithCustomer();
      const v = await vehicles.create(a.shopId, { customer_id: a.customerId, plate: newPlate(), make: 'Mazda' });

      await expect(vehicles.get(b.shopId, v.id)).rejects.toThrow(NotFoundException);
      await expect(vehicles.update(b.shopId, v.id, { mileage_km: 1 })).rejects.toThrow(NotFoundException);
      expect((await vehicles.search(b.shopId, { q: 'Mazda' })).items).toEqual([]);
      await expect(vehicles.search(b.shopId, { customerId: a.customerId })).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('kilometraje, placa normalizada y cambio de dueño dentro del taller', async () => {
      const { shopId, customerId } = await shopWithCustomer();
      const other = await customers.create(shopId, { full_name: 'Nuevo dueño' });
      const v = await vehicles.create(shopId, { customer_id: customerId, chassis_number: `CH-${Date.now()}`, make: 'Nissan' });

      const plate = newPlate();
      const updated = await vehicles.update(shopId, v.id, {
        mileage_km: 120000,
        plate: plate.toLowerCase(),
        customer_id: other.id,
      });
      expect(updated).toMatchObject({ mileage_km: 120000, plate, customer_id: other.id });
    });

    it('no se puede quitar el último identificador (400) ni la marca', async () => {
      const { shopId, customerId } = await shopWithCustomer();
      const v = await vehicles.create(shopId, { customer_id: customerId, plate: newPlate(), make: 'Nissan' });
      await expect(vehicles.update(shopId, v.id, { plate: null })).rejects.toThrow(/al menos un identificador/);
      await expect(vehicles.update(shopId, v.id, { make: '  ' })).rejects.toThrow(/marca/);
    });
  });

  it('búsqueda: placa parcial, marca, y vehículos de un cliente', async () => {
    const { shopId, customerId } = await shopWithCustomer();
    const other = await customers.create(shopId, { full_name: 'Otro' });
    const plate = newPlate();
    const mine = await vehicles.create(shopId, { customer_id: customerId, plate, make: 'Hyundai', model: 'Tucson' });
    const theirs = await vehicles.create(shopId, { customer_id: other.id, plate: newPlate(), make: 'Kia' });

    const ids = async (opts: { q?: string; customerId?: string }) =>
      (await vehicles.search(shopId, opts)).items.map((v) => v.id);
    expect(await ids({ q: plate.slice(-4) })).toEqual([mine.id]);
    expect(await ids({ q: `${plate[0]}-${plate.slice(1, 4)}` })).toEqual([mine.id]);
    expect(await ids({ q: 'tucson' })).toEqual([mine.id]);
    expect(await ids({ customerId: other.id })).toEqual([theirs.id]);
  });
});
