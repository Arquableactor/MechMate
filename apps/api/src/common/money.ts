import { BadRequestException } from '@nestjs/common';

/**
 * Aritmética de dinero en **BigInt centavos** — nunca `Number` (perdería
 * precisión y desbordaría 2^53 al multiplicar montos grandes por bps).
 * Regla de redondeo: **half-up** (esperado por contadores en RD). El neto se
 * define como `total - commission`, así el resto absorbe el redondeo y el
 * asiento de 3 líneas **siempre** balancea a 0.
 */

/** Comisión = round_half_up(total * bps / 10000), todo en BigInt. */
export function commissionCents(total: bigint, bps: number): bigint {
  if (total < 0n) {
    throw new BadRequestException('total_cents no puede ser negativo');
  }
  if (!Number.isInteger(bps) || bps < 0 || bps > 10000) {
    throw new BadRequestException('commission_bps fuera de rango [0, 10000]');
  }
  // half-up sobre división entera: (n + 5000) / 10000 (truncamiento de BigInt).
  return (total * BigInt(bps) + 5000n) / 10000n;
}

/** Neto del vendedor = total - comisión (absorbe el redondeo ⇒ balancea). */
export function netCents(total: bigint, bps: number): bigint {
  return total - commissionCents(total, bps);
}

/** Suma de centavos (BigInt). */
export function sumCents(amounts: readonly bigint[]): bigint {
  return amounts.reduce((acc, n) => acc + n, 0n);
}

/** Un conjunto de líneas balancea si su suma es exactamente 0. */
export function isBalanced(amounts: readonly bigint[]): boolean {
  return sumCents(amounts) === 0n;
}

const CURRENCY_SYMBOL: Record<string, string> = { DOP: 'RD$', USD: 'US$' };

/**
 * Formatea centavos para humanos: `100000n, 'DOP'` → `RD$1,000.00`. Todo en
 * BigInt (sin pasar por Number), con separador de miles `,` y decimales `.`
 * como se usa en RD.
 */
export function formatMoney(cents: bigint, currency: string): string {
  const sign = cents < 0n ? '-' : '';
  const abs = cents < 0n ? -cents : cents;
  const whole = (abs / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const frac = (abs % 100n).toString().padStart(2, '0');
  return `${sign}${CURRENCY_SYMBOL[currency] ?? `${currency} `}${whole}.${frac}`;
}
