import { isUUID } from 'class-validator';
import { uuid7 } from './uuid7';

describe('uuid7', () => {
  it('es un UUID válido de versión 7 y variante RFC', () => {
    const id = uuid7();
    expect(isUUID(id, 7)).toBe(true);
    expect(id[14]).toBe('7');
    expect('89ab').toContain(id[19]);
  });

  it('codifica el timestamp en los primeros 48 bits', () => {
    const t = Date.UTC(2026, 8, 29, 12, 0, 0);
    expect(parseInt(uuid7(t).replace(/-/g, '').slice(0, 12), 16)).toBe(t);
  });

  it('se ordena por tiempo (como las PK de Prisma/Postgres)', () => {
    const ids = [1, 2, 3].map((d) => uuid7(Date.UTC(2026, 0, d)));
    expect([...ids].sort()).toEqual(ids);
  });

  it('dos ids en el mismo milisegundo son distintos', () => {
    const t = Date.now();
    expect(new Set(Array.from({ length: 1000 }, () => uuid7(t))).size).toBe(1000);
  });
});
