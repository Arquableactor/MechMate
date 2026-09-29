import { addBusinessDays, localDate } from './business-days';

// Instantes en hora de RD (UTC-4) para leer los casos fácilmente.
const rd = (isoLocal: string) => new Date(`${isoLocal}-04:00`);

describe('localDate', () => {
  it('usa la fecha de Santo Domingo, no la de UTC', () => {
    // 22:30 del lunes en RD = 02:30 del martes en UTC.
    expect(localDate(rd('2026-09-28T22:30:00'))).toBe('2026-09-28');
  });
});

describe('addBusinessDays (T+2)', () => {
  it.each([
    ['lunes', '2026-09-28T10:00:00', '2026-09-30'],
    ['jueves', '2026-10-01T10:00:00', '2026-10-05'],
    ['viernes', '2026-10-02T10:00:00', '2026-10-06'],
    ['sábado', '2026-10-03T10:00:00', '2026-10-06'],
    ['domingo', '2026-10-04T10:00:00', '2026-10-06'],
    ['viernes 23:30 en RD (ya sábado en UTC)', '2026-10-02T23:30:00', '2026-10-06'],
  ])('%s → %s', (_label, at, expected) => {
    expect(addBusinessDays(rd(at), 2)).toBe(expected);
  });
});
