import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hasValidCheckDigit } from './vin';
import type { DecodedVehicle, VinDecoder } from './vin-decoder.interface';
import { VinService } from './vin.service';

/** VinService contra Postgres REAL (caché, UNIQUE, CHECK de formato). El proveedor es un fake. */
let prisma: PrismaService;

beforeAll(async () => {
  prisma = new PrismaService();
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

const vehicle: DecodedVehicle = {
  make: 'HONDA',
  model: 'Accord',
  year: 2003,
  trim: 'EX-V6',
  engine: '3.0L V6',
  fuelType: 'Gasolina',
  bodyClass: 'Coupe',
  driveType: null,
  transmission: 'Automatic',
  warnings: [],
  raw: { Make: 'HONDA' },
};

function fakeDecoder(behavior: 'found' | 'unknown' | 'down' = 'found') {
  const decode = jest.fn(async () => {
    if (behavior === 'down') throw new Error('ETIMEDOUT');
    return behavior === 'found' ? vehicle : null;
  });
  const decoder: VinDecoder = { provider: 'nhtsa', decode };
  return { decoder, decode };
}

/** VIN único por test con dígito verificador válido (la caché es global). */
function randomValidVin(): string {
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  for (;;) {
    const vin = Array.from({ length: 17 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    if (hasValidCheckDigit(vin)) return vin;
  }
}

describe('VinService (integración, Postgres real)', () => {
  it('primera consulta va al proveedor y se guarda; la segunda sale de la caché', async () => {
    const vin = randomValidVin();
    const { decoder, decode } = fakeDecoder();
    const service = new VinService(prisma, decoder);

    const first = await service.decode(vin);
    const second = await service.decode(vin.toLowerCase());

    expect(first).toMatchObject({ vin, found: true, source: 'nhtsa', check_digit_valid: true, warnings: [] });
    expect(first.vehicle).toMatchObject({ make: 'HONDA', engine: '3.0L V6', fuel_type: 'Gasolina' });
    expect(second).toMatchObject({ found: true, source: 'cache', vehicle: first.vehicle });
    expect(decode).toHaveBeenCalledTimes(1);
  });

  it('VIN desconocido: found=false y NO se guarda (se puede reintentar)', async () => {
    const vin = randomValidVin();
    const result = await new VinService(prisma, fakeDecoder('unknown').decoder).decode(vin);

    expect(result).toMatchObject({ found: false, source: null, provider_unavailable: false, vehicle: null });
    expect(await prisma.vinDecode.count({ where: { vin } })).toBe(0);
  });

  it('proveedor caído: no rompe el flujo, avisa provider_unavailable', async () => {
    const vin = randomValidVin();
    const result = await new VinService(prisma, fakeDecoder('down').decoder).decode(vin);
    expect(result).toMatchObject({ found: false, provider_unavailable: true });
  });

  it('dígito verificador que no cuadra: se decodifica igual, con aviso en español', async () => {
    const result = await new VinService(prisma, fakeDecoder().decoder).decode('5YJ3E1EA7KF317000');
    expect(result.check_digit_valid).toBe(false);
    expect(result.found).toBe(true);
    expect(result.warnings[0]).toMatch(/dígito verificador/);
  });

  it('formato inválido (chasis japonés, I/O/Q, largo): 400 sin llamar al proveedor', async () => {
    const { decoder, decode } = fakeDecoder();
    const service = new VinService(prisma, decoder);
    for (const bad of ['NZE121-1234567', '1HGCM82633A00435I', '123']) {
      await expect(service.decode(bad)).rejects.toThrow(BadRequestException);
    }
    expect(decode).not.toHaveBeenCalled();
  });

  it('concurrencia: muchas consultas simultáneas del mismo VIN → todas responden y queda una fila', async () => {
    const service = new VinService(prisma, fakeDecoder().decoder);
    for (let round = 0; round < 10; round++) {
      const vin = randomValidVin();
      const results = await Promise.all(Array.from({ length: 8 }, () => service.decode(vin)));
      expect(results.every((r) => r.found && r.vehicle?.make === 'HONDA')).toBe(true);
      expect(await prisma.vinDecode.count({ where: { vin } })).toBe(1);
    }
  });

  it('la DB rechaza un VIN sin normalizar (CHECK)', async () => {
    await expect(
      prisma.vinDecode.create({ data: { vin: 'abc', provider: 'x', make: 'X', raw: {} } }),
    ).rejects.toThrow(/vin_decodes_vin_format_check/);
  });
});
