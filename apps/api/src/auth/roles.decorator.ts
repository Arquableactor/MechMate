import { SetMetadata } from '@nestjs/common';
import type { Role } from '@repo/types';

export const ROLES_KEY = 'roles';

/** Marca una ruta como protegida por rol; la evalúa `RolesGuard`. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
