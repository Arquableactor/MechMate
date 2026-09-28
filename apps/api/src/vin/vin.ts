/**
 * VIN (ISO 3779): 17 caracteres, sin I, O ni Q (se confunden con 1 y 0).
 * Muchos vehículos en RD (importados de Japón) NO tienen VIN sino número de
 * chasis corto (p. ej. `NZE121-1234567`): esos se registran a mano.
 */
export const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

/** Mayúsculas y sin espacios ni guiones (como se suele dictar o copiar). */
export function normalizeVin(input: string): string {
  return input.toUpperCase().replace(/[\s-]/g, '');
}

export function isValidVinFormat(vin: string): boolean {
  return VIN_PATTERN.test(vin);
}

const TRANSLITERATION: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
};
const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

/**
 * Dígito verificador (posición 9). Obligatorio solo en vehículos de
 * Norteamérica: en europeos/asiáticos puede no cuadrar y el VIN ser legítimo.
 * Por eso NO se usa para rechazar, solo como advertencia.
 */
export function hasValidCheckDigit(vin: string): boolean {
  if (!isValidVinFormat(vin)) return false;
  const sum = [...vin].reduce((acc, ch, i) => {
    const value = /\d/.test(ch) ? Number(ch) : TRANSLITERATION[ch];
    return acc + value * WEIGHTS[i];
  }, 0);
  const remainder = sum % 11;
  return vin[8] === (remainder === 10 ? 'X' : String(remainder));
}
