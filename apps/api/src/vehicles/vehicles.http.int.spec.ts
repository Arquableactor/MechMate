import { randomUUID } from 'node:crypto';
import { type CanActivate, type ExecutionContext, type INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { Page, ShopView, VehicleView } from '@repo/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsModule } from '../shops/shops.module';
import { VIN_DECODER, type VinDecoder } from '../vin/vin-decoder.interface';
import { VehiclesModule } from './vehicles.module';

/** Rutas de vehículos por HTTP real. El proveedor de VIN es un fake (CI sin red). */
let app: INestApplication;
let prisma: PrismaService;
let base: string;

const HONDA_VIN = '1HGCM82633A004352';
const fakeDecoder: VinDecoder = {
  provider: 'nhtsa',
  decode: async (vin) =>
    vin === HONDA_VIN
      ? {
          make: 'HONDA', model: 'Accord', year: 2003, trim: 'EX-V6', engine: '3.0L V6', fuelType: 'Gasolina',
          bodyClass: 'Coupe', driveType: null, transmission: 'Automatic', warnings: [], raw: {},
        }
      : null,
};

const fakeJwt: CanActivate = {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<{ headers: Record<string, string>; user?: { id: string } }>();
    req.user = { id: req.headers['x-test-account'] };
    return Boolean(req.user.id);
  },
};

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }), PrismaModule, ShopsModule, VehiclesModule],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue(fakeJwt)
    .overrideProvider(VIN_DECODER)
    .useValue(fakeDecoder)
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

async function setup() {
  const owner = await prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } });
  const shop = await json<ShopView>(await call(owner.id, 'POST', '/shops', { name: 'Taller V' }));
  const customer = await prisma.customer.create({ data: { shop_id: shop.id, full_name: 'Cliente' } });
  return { ownerId: owner.id, shopId: shop.id, customerId: customer.id };
}

describe('Vehículos por HTTP', () => {
  it('alta con VIN (autocompleta), alta manual, y listado por cliente', async () => {
    const { ownerId, shopId, customerId } = await setup();
    const withVin = await call(ownerId, 'POST', `/shops/${shopId}/vehicles`, { customer_id: customerId, vin: HONDA_VIN });
    expect(withVin.status).toBe(201);
    expect(await json<VehicleView>(withVin)).toMatchObject({ make: 'HONDA', engine: '3.0L V6', data_source: 'vin_decode' });

    const manual = await call(ownerId, 'POST', `/shops/${shopId}/vehicles`, {
      customer_id: customerId, chassis_number: 'NZE121-7654321', plate: 'a-555 001', make: 'Toyota', year: 2006,
    });
    expect(manual.status).toBe(201);
    expect(await json<VehicleView>(manual)).toMatchObject({ plate: 'A555001', data_source: 'manual' });

    const page = await json<Page<VehicleView>>(await call(ownerId, 'GET', `/shops/${shopId}/customers/${customerId}/vehicles`));
    expect(page.items).toHaveLength(2);
    const found = await json<Page<VehicleView>>(await call(ownerId, 'GET', `/shops/${shopId}/vehicles?q=555001`));
    expect(found.items.map((v) => v.chassis_number)).toEqual(['NZE121-7654321']);
  });

  it('validación: 400 por body inválido', async () => {
    const { ownerId, shopId, customerId } = await setup();
    const path = `/shops/${shopId}/vehicles`;
    for (const body of [
      { plate: 'A123456', make: 'Kia' }, // sin customer_id
      { customer_id: 'no-uuid', plate: 'A123456', make: 'Kia' },
      { customer_id: customerId, plate: 'A123456', make: 'Kia', year: 1800 },
      { customer_id: customerId, plate: 'A123456', make: 'Kia', mileage_km: -5 },
      { customer_id: customerId, make: 'Kia' }, // sin identificador
    ]) {
      expect((await call(ownerId, 'POST', path, body)).status).toBe(400);
    }
  });

  it('otro taller: 404 en ruta ajena, en cliente ajeno y en vehículo ajeno', async () => {
    const a = await setup();
    const b = await setup();
    const v = await json<VehicleView>(
      await call(a.ownerId, 'POST', `/shops/${a.shopId}/vehicles`, { customer_id: a.customerId, plate: 'B100200', make: 'Kia' }),
    );

    expect((await call(b.ownerId, 'GET', `/shops/${a.shopId}/vehicles`)).status).toBe(404);
    expect((await call(b.ownerId, 'GET', `/shops/${b.shopId}/vehicles/${v.id}`)).status).toBe(404);
    expect((await call(b.ownerId, 'GET', `/shops/${b.shopId}/customers/${a.customerId}/vehicles`)).status).toBe(404);
    expect(
      (await call(b.ownerId, 'POST', `/shops/${b.shopId}/vehicles`, { customer_id: a.customerId, plate: 'C100200', make: 'Kia' })).status,
    ).toBe(404);
  });
});
