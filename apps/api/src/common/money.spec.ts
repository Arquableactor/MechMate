import { BadRequestException } from '@nestjs/common';
import { commissionCents, isBalanced, netCents, sumCents } from './money';

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
