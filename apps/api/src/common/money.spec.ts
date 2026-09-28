import { BadRequestException } from '@nestjs/common';
import { commissionCents, formatMoney, isBalanced, lineAmounts, netCents, sumCents } from './money';

describe('money (BigInt, half-up)', () => {
  it('comisión 8% de 100000 = 8000; net = 92000', () => {
    expect(commissionCents(100000n, 800)).toBe(8000n);
    expect(netCents(100000n, 800)).toBe(92000n);
  });

  it('redondeo half-up en el empate .5 (total=1, bps=5000 → 0.5 → 1)', () => {
    expect(commissionCents(1n, 5000)).toBe(1n);
  });

  it('no pierde precisión con montos enormes (BigInt puro, sin Number)', () => {
    const total = 10n ** 18n; // excede Number.MAX_SAFE_INTEGER por mucho
    const c = commissionCents(total, 833);
    const n = netCents(total, 833);
    expect(c + n).toBe(total); // el asiento balancea siempre
    expect(c).toBe((total * 833n + 5000n) / 10000n);
  });

  it.each([
    [0n, 0],
    [1n, 1],
    [9999n, 800],
    [10000n, 800],
    [10001n, 9999],
    [123456789n, 833],
    [10n ** 18n, 10000],
  ])('invariantes para total=%s bps=%s: commission+net=total, ambos >= 0', (total, bps) => {
    const c = commissionCents(total, bps);
    const n = netCents(total, bps);
    expect(c).toBeGreaterThanOrEqual(0n);
    expect(n).toBeGreaterThanOrEqual(0n);
    expect(c + n).toBe(total);
  });

  it('bps=0 → comisión 0; bps=10000 → comisión total', () => {
    expect(commissionCents(5000n, 0)).toBe(0n);
    expect(commissionCents(5000n, 10000)).toBe(5000n);
  });

  it('rechaza total negativo y bps fuera de [0,10000]', () => {
    expect(() => commissionCents(-1n, 800)).toThrow(BadRequestException);
    expect(() => commissionCents(100n, -1)).toThrow(BadRequestException);
    expect(() => commissionCents(100n, 10001)).toThrow(BadRequestException);
  });

  it('sumCents / isBalanced', () => {
    expect(sumCents([-100n, 92n, 8n])).toBe(0n);
    expect(isBalanced([-100n, 92n, 8n])).toBe(true);
    expect(isBalanced([-100n, 92n, 7n])).toBe(false);
  });
});

describe('formatMoney', () => {
  it.each([
    [100000n, 'DOP', 'RD$1,000.00'],
    [5n, 'DOP', 'RD$0.05'],
    [123456789n, 'USD', 'US$1,234,567.89'],
    [99n, 'EUR', 'EUR 0.99'],
    [-150n, 'DOP', '-RD$1.50'],
    [900719925474099300n, 'DOP', 'RD$9,007,199,254,740,993.00'],
  ])('%s %s → %s', (cents, currency, expected) => {
    expect(formatMoney(cents, currency)).toBe(expected);
  });
});

describe('lineAmounts (líneas de OT/factura con ITBIS)', () => {
  it('1.5 h × RD$1,200.00 con ITBIS 18% = 1,800.00 + 324.00 = 2,124.00', () => {
    expect(lineAmounts(1500n, 120000n, 1800)).toEqual({ subtotal: 180000n, tax: 32400n, total: 212400n });
  });

  it('exento (0%): sin ITBIS', () => {
    expect(lineAmounts(2000n, 45050n, 0)).toEqual({ subtotal: 90100n, tax: 0n, total: 90100n });
  });

  it('redondeo half-up del subtotal: 0.333 × 100 = 33.3 → 33; 0.335 × 100 = 33.5 → 34', () => {
    expect(lineAmounts(333n, 100n, 0).subtotal).toBe(33n);
    expect(lineAmounts(335n, 100n, 0).subtotal).toBe(34n);
  });

  it('redondeo half-up del ITBIS por línea: 18% de 5 = 0.9 → 1; de 2 = 0.36 → 0; de 25 = 4.5 → 5', () => {
    expect(lineAmounts(1000n, 5n, 1800).tax).toBe(1n);
    expect(lineAmounts(1000n, 2n, 1800).tax).toBe(0n);
    expect(lineAmounts(1000n, 25n, 1800).tax).toBe(5n);
  });

  it('montos enormes sin perder precisión (BigInt)', () => {
    expect(lineAmounts(1000n, 900719925474099300n, 1800)).toEqual({
      subtotal: 900719925474099300n,
      tax: 162129586585337874n,
      total: 1062849512059437174n,
    });
  });

  it('rechaza cantidad <= 0, precio negativo y tasa fuera de rango', () => {
    expect(() => lineAmounts(0n, 100n, 1800)).toThrow(BadRequestException);
    expect(() => lineAmounts(1000n, -1n, 1800)).toThrow(BadRequestException);
    expect(() => lineAmounts(1000n, 100n, 10001)).toThrow(BadRequestException);
  });
});
