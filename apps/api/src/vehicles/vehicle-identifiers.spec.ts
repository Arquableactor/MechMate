import { normalizeChassis, normalizePlate } from './vehicle-identifiers';

describe('normalizePlate', () => {
  it.each([
    [' a-123 456 ', 'A123456'],
    ['G123456', 'G123456'],
    ['l 000123', 'L000123'],
  ])('%p → %p', (input, expected) => {
    expect(normalizePlate(input)).toBe(expected);
  });

  it.each(['A1', '', '---', 'ABCDEFGHIJK1'])('inválida: %p', (input) => {
    expect(normalizePlate(input)).toBeNull();
  });
});

describe('normalizeChassis', () => {
  it('mayúsculas y sin espacios, conservando el guion', () => {
    expect(normalizeChassis('nze121 - 1234567')).toBe('NZE121-1234567');
    expect(normalizeChassis('GRX130-6012345')).toBe('GRX130-6012345');
  });

  it.each(['ab', 'NZE121_123', '!!'])('inválido: %p', (input) => {
    expect(normalizeChassis(input)).toBeNull();
  });
});
