import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const guard = new JwtAuthGuard();

  it('rechaza con 401 cuando no hay usuario (token ausente/inválido)', () => {
    expect(() => guard.handleRequest(null, false, undefined, {} as never)).toThrow(
      UnauthorizedException,
    );
  });

  it('rechaza con 401 cuando passport reporta un error', () => {
    expect(() =>
      guard.handleRequest(new Error('jwt expired'), false, undefined, {} as never),
    ).toThrow();
  });

  it('devuelve la cuenta cuando el token es válido', () => {
    const account = { id: 'acc-1', roles: [] };
    expect(guard.handleRequest(null, account, undefined, {} as never)).toBe(account);
  });
});
