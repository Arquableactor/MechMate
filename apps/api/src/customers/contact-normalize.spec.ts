import { normalizeCedula, normalizeEmail, normalizeName, normalizePhone } from './contact-normalize';

describe('normalizePhone (RD → E.164)', () => {
  it.each([
    ['809-555-1234', '+18095551234'],
    ['(829) 555 1234', '+18295551234'],
    ['8495551234', '+18495551234'],
    ['1 809 555 1234', '+18095551234'],
    ['+1 809-555-1234', '+18095551234'],
    ['+34 612 345 678', '+34612345678'], // extranjero
  ])('%s → %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each(['555-1234', '123', '', '+0123456789', '809-555-12345-99', 'no es teléfono'])(
    'inválido: %p',
    (input) => {
      expect(normalizePhone(input)).toBeNull();
    },
  );
});

describe('normalizeCedula', () => {
  it('quita guiones y espacios', () => {
    expect(normalizeCedula('001-1234567-8')).toBe('00112345678');
    expect(normalizeCedula(' 402 2345678 9 ')).toBe('40223456789');
  });

  it.each(['001-123456-8', '0011234567890', 'abc'])('inválida: %p', (input) => {
    expect(normalizeCedula(input)).toBeNull();
  });
});

describe('normalizeEmail / normalizeName', () => {
  it('email en minúsculas y sin espacios', () => {
    expect(normalizeEmail('  Juan@Mail.DO ')).toBe('juan@mail.do');
  });

  it('nombre sin espacios de más', () => {
    expect(normalizeName('  Juan    Pérez  ')).toBe('Juan Pérez');
  });
});
