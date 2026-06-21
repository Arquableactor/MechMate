import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '@repo/types';
import { ROLES_KEY } from './roles.decorator';

interface RequestWithAccount {
  user?: { roles?: { role: Role }[] };
}

/**
 * Permite el acceso si la cuenta tiene al menos uno de los roles requeridos por
 * `@Roles(...)`. Sin requisitos ⇒ pasa. Falta de rol ⇒ 403. Asume `JwtAuthGuard`
 * antes (la cuenta ya está en `request.user`).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest<RequestWithAccount>();
    const roles = new Set((user?.roles ?? []).map((r) => r.role));
    const allowed = required.some((role) => roles.has(role));
    if (!allowed) {
      throw new ForbiddenException('La cuenta no tiene el rol requerido.');
    }
    return true;
  }
}
