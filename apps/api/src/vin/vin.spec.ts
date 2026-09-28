import honda from './__fixtures__/nhtsa-honda-accord-2003.json';
import tesla from './__fixtures__/nhtsa-tesla-model3-2019.json';
import { NhtsaVinDecoder } from './nhtsa-vin-decoder';
import { hasValidCheckDigit, isValidVinFormat, normalizeVin } from './vin';

describe('normalizeVin / isValidVinFormat', () => {
  it('normaliza mayúsculas, espacios y guiones', () => {
    expect(normalizeVin(' 1hgcm-8263 3a004352 ')).toBe('1HGCM82633A004352');
  });

  it.each([
    ['1HGCM82633A004352', true],
    ['1HGCM82633A00435', false], // 16
    ['1HGCM82633A0043521', false], // 18
    ['1HGCM82633A00435I', false], // I prohibida
    ['1HGCM82633A00435O', false], // O prohibida
    ['1HGCM82633A00435Q', false], // Q prohibida
    ['NZE121-1234567', false], // chasis japonés
  ])('%s → %s', (vin, expected) => {
    expect(isValidVinFormat(vin)).toBe(expected);
  });
});

describe('hasValidCheckDigit', () => {
  it.each([
    ['1HGCM82633A004352', true],
    ['11111111111111111', true],
    ['1M8GDM9AXKP042788', true], // dígito verificador X
    ['5YJ3E1EA7KF317000', false],
    ['1HGCM82643A004352', false], // un dígito cambiado
  ])('%s → %s', (vin, expected) => {
    expect(hasValidCheckDigit(vin)).toBe(expected);
  });
});

describe('NhtsaVinDecoder (respuestas reales de NHTSA)', () => {
  const reply = (status: number, body: unknown) =>
    jest.fn().mockResolvedValue({ ok: status < 300, status, json: async () => body });

  it('Honda Accord 2003: marca, modelo, año, motor legible, combustible en español', async () => {
    const fetchFn = reply(200, honda);
    const v = await new NhtsaVinDecoder(fetchFn).decode('1HGCM82633A004352');

    expect(v).toMatchObject({
      make: 'HONDA',
      model: 'Accord',
      year: 2003,
      trim: 'EX-V6',
      engine: '3.0L V6',
      fuelType: 'Gasolina',
      bodyClass: 'Coupe',
      transmission: 'Automatic',
      warnings: [],
    });
    expect(v?.raw.Make).toBe('HONDA');
    expect(fetchFn.mock.calls[0][0]).toBe(
      'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/1HGCM82633A004352?format=json',
    );
    expect(fetchFn.mock.calls[0][1].signal).toBeDefined(); // con timeout
  });

  it('Tesla: eléctrico sin motor de combustión, con el aviso del proveedor', async () => {
    const v = await new NhtsaVinDecoder(reply(200, tesla)).decode('5YJ3E1EA7KF317000');
    expect(v).toMatchObject({ make: 'TESLA', model: 'Model 3', year: 2019, engine: null, fuelType: 'Eléctrico' });
    expect(v?.warnings[0]).toMatch(/Check Digit/);
  });

  it('VIN que NHTSA no conoce (marca vacía) → null', async () => {
    const body = { Results: [{ Make: '', Model: '', ModelYear: '', ErrorCode: '1,7,11,400' }] };
    await expect(new NhtsaVinDecoder(reply(200, body)).decode('ZZZZZZZZZZZZZZZZZ')).resolves.toBeNull();
  });

  it('NHTSA caído (5xx) → lanza (el servicio lo trata como no disponible)', async () => {
    await expect(new NhtsaVinDecoder(reply(503, {})).decode('1HGCM82633A004352')).rejects.toThrow('NHTSA 503');
  });
});
