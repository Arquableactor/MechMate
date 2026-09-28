/**
 * Cantidades con hasta 3 decimales (1.5 horas, 0.25 galones) guardadas como
 * enteros en milésimas: nada de floats en cálculos que terminan en dinero.
 */
const QUANTITY = /^(\d{1,6})(?:\.(\d{1,3}))?$/;

/** `"1.5"` / `1.5` / `"2"` → 1500n / 1500n / 2000n; null si no es válida o es 0. */
export function parseQuantityMilli(input: string | number): bigint | null {
  const text = typeof input === 'number' ? String(input) : input.trim();
  const m = QUANTITY.exec(text);
  if (!m) return null;
  const milli = BigInt(m[1]) * 1000n + BigInt((m[2] ?? '').padEnd(3, '0') || '0');
  return milli > 0n ? milli : null;
}

/** 1500 → `"1.5"`, 2000 → `"2"`, 250 → `"0.25"`. */
export function formatQuantity(milli: number | bigint): string {
  const value = BigInt(milli);
  const whole = value / 1000n;
  const frac = (value % 1000n).toString().padStart(3, '0').replace(/0+$/, '');
  return frac ? `${whole}.${frac}` : `${whole}`;
}
