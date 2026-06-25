import './bigint-serializer';

describe('bigint-serializer', () => {
  it('serializa BigInt como string (sin pérdida de precisión)', () => {
    expect(JSON.stringify({ amount_cents: 9007199254740993n })).toBe(
      '{"amount_cents":"9007199254740993"}',
    );
  });

  it('BigInt.prototype.toJSON devuelve el string del valor', () => {
    expect((123n).toJSON()).toBe('123');
  });
});
