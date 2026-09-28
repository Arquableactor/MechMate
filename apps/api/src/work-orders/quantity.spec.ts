import { formatQuantity, parseQuantityMilli } from './quantity';

describe('parseQuantityMilli', () => {
  it.each([
    ['1.5', 1500n],
    ['2', 2000n],
    [' 0.25 ', 250n],
    ['0.001', 1n],
    [3, 3000n],
    [1.5, 1500n],
    ['999999.999', 999999999n],
  ])('%p → %p', (input, expected) => {
    expect(parseQuantityMilli(input)).toBe(expected);
  });

  it.each(['0', '0.000', '-1', '1.2345', 'abc', '', '1,5', '1e3', '1000000'])('inválida: %p', (input) => {
    expect(parseQuantityMilli(input)).toBeNull();
  });
});

describe('formatQuantity', () => {
  it.each([
    [1500, '1.5'],
    [2000, '2'],
    [250, '0.25'],
    [1, '0.001'],
    [1234567, '1234.567'],
  ])('%p → %p', (milli, expected) => {
    expect(formatQuantity(milli)).toBe(expected);
  });
});
