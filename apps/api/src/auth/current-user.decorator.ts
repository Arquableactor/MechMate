import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { type Account, type AccountRole } from '@prisma/client';

/** Cuenta provisionada (JIT) adjunta a la request por `JwtStrategy`. */
export type AuthenticatedAccount = Account & { roles: AccountRole[] };

/** Inyecta la cuenta autenticada/provisionada en el handler. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedAccount => {
    return ctx.switchToHttp().getRequest<{ user: AuthenticatedAccount }>().user;
  },
);
