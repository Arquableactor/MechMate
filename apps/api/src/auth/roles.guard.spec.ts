import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '@repo/types';
import { RolesGuard } from './roles.guard';

const contextWith = (roles: Role[]): ExecutionContext =>
  ({
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({ user: { roles: roles.map((role) => ({ role })) } }),
    }),
  }) as unknown as ExecutionContext;

const guardRequiring = (required: Role[] | undefined): RolesGuard => {
  const reflector = { getAllAndOverride: jest.fn().mockReturnValue(required) } as unknown as Reflector;
  return new RolesGuard(reflector);
};

describe('RolesGuard', () => {
  it('permite cuando no hay roles requeridos', () => {
    expect(guardRequiring(undefined).canActivate(contextWith([]))).toBe(true);
  });

  it('permite cuando la cuenta tiene el rol requerido', () => {
    expect(guardRequiring(['mechanic']).canActivate(contextWith(['customer', 'mechanic']))).toBe(
      true,
    );
  });

  it('lanza 403 (ForbiddenException) cuando falta el rol', () => {
    expect(() => guardRequiring(['admin']).canActivate(contextWith(['customer']))).toThrow(
      ForbiddenException,
    );
  });
});
