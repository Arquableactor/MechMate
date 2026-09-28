import type { DecodedVehicle, VinDecoder } from './vin-decoder.interface';

const BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues';
const TIMEOUT_MS = 8_000;

type NhtsaResult = Record<string, string | null | undefined>;

const FUEL_ES: Record<string, string> = {
  Gasoline: 'Gasolina',
  Diesel: 'Diésel',
  Electric: 'Eléctrico',
  'Flexible Fuel Vehicle (FFV)': 'Flex (gasolina/etanol)',
  'Compressed Natural Gas (CNG)': 'Gas natural (GNV)',
  'Liquefied Petroleum Gas (propane or LPG)': 'GLP',
};

const text = (v: string | null | undefined) => (v && v.trim() ? v.trim() : null);

/** `2.998832712` + `6` → `3.0L V6`; `1.8` + `4` → `1.8L 4 cil.` */
function describeEngine(r: NhtsaResult): string | null {
  const liters = Number(r.DisplacementL);
  const cylinders = Number(r.EngineCylinders);
  const parts: string[] = [];
  if (Number.isFinite(liters) && liters > 0) parts.push(`${liters.toFixed(1)}L`);
  if (Number.isInteger(cylinders) && cylinders > 0) {
    parts.push(cylinders >= 6 && r.EngineConfiguration?.startsWith('V') ? `V${cylinders}` : `${cylinders} cil.`);
  }
  return parts.length ? parts.join(' ') : null;
}

/**
 * NHTSA vPIC: catálogo oficial de EE. UU., gratis y sin API key. Cubre bien los
 * importados de EE. UU. (la mayoría del parque en RD); los modelos de mercado
 * japonés/europeo pueden no estar → `null` y el taller los carga a mano.
 */
export class NhtsaVinDecoder implements VinDecoder {
  readonly provider = 'nhtsa';

  constructor(private readonly fetchFn: typeof fetch = fetch) {}

  async decode(vin: string): Promise<DecodedVehicle | null> {
    const res = await this.fetchFn(`${BASE_URL}/${encodeURIComponent(vin)}?format=json`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`NHTSA ${res.status}`);

    const body = (await res.json()) as { Results?: NhtsaResult[] };
    const r = body.Results?.[0];
    const make = text(r?.Make);
    if (!r || !make) return null; // NHTSA no conoce este VIN

    // ErrorCode puede venir como lista ("1,7,11"); "0" = decodificado limpio.
    const codes = (r.ErrorCode ?? '').split(',').map((c) => c.trim()).filter(Boolean);
    const warnings = codes.some((c) => c !== '0') && r.ErrorText ? [r.ErrorText] : [];
    const year = Number(r.ModelYear);
    const fuel = text(r.FuelTypePrimary);

    return {
      make,
      model: text(r.Model),
      year: Number.isInteger(year) && year > 1900 ? year : null,
      trim: text(r.Trim),
      engine: describeEngine(r),
      fuelType: fuel ? (FUEL_ES[fuel] ?? fuel) : null,
      bodyClass: text(r.BodyClass),
      driveType: text(r.DriveType),
      transmission: text(r.TransmissionStyle),
      warnings,
      raw: Object.fromEntries(Object.entries(r).filter(([, v]) => v !== '' && v != null)),
    };
  }
}
