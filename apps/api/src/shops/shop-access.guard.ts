import {
  applyDecorators,
  type CanActivate,
  createParamDecorator,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiForbiddenResponse } from '@nestjs/swagger';
import type { ShopMember } from '@prisma/client';
import type { ShopMemberRole } from '@repo/types';
import { ShopsService } from './shops.service';

const SHOP_ROLES_KEY = 'shopRoles';

/** Restringe un endpoint de taller a ciertos roles DENTRO del taller. */
export const ShopRoles = (...roles: ShopMemberRole[]) => SetMetadata(SHOP_ROLES_KEY, roles);

/**
 * Mostrador: solo dueño y asesor (secretaria/recepción). El mecánico trabaja
 * en sus órdenes asignadas, pero no registra clientes, no crea ni cancela
 * órdenes, no envía enlaces de aprobación, no factura ni cobra.
 */
export const FrontDeskOnly = () =>
  applyDecorators(
    ShopRoles('owner', 'advisor'),
    ApiForbiddenResponse({ description: 'Solo el dueño o el asesor del taller.' }),
  );

interface ShopRequest {
  user?: { id: string };
  params: { shopId?: string };
  shopMember?: ShopMember;
}

/**
 * Aislamiento multi-tenant: en `/v1/shops/:shopId/...` solo pasa un miembro
 * ACTIVO de ese taller. Todo lo demás es 404 (no 403): quien no es miembro no
 * debe poder saber si el taller existe. Con `@ShopRoles(...)`, un miembro sin
 * el rol recibe 403 (ya sabe que el taller existe).
 * Va DESPUÉS de JwtAuthGuard (necesita `request.user`).
 */
@Injectable()
export class ShopAccessGuard implements CanActivate {
  constructor(
    private readonly shops: ShopsService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ShopRequest>();
    const shopId = request.params.shopId;
    const accountId = request.user?.id;

    const member =
      shopId && accountId ? await this.shops.findActiveMembership(shopId, accountId) : null;
    if (!member) throw new NotFoundException('Taller no encontrado');

    const required = this.reflector.getAllAndOverride<ShopMemberRole[] | undefined>(
      SHOP_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (required?.length && !required.includes(member.role)) {
      throw new ForbiddenException('Tu rol en este taller no permite esta acción.');
    }

    request.shopMember = member;
    return true;
  }
}

/** Membresía del usuario en el taller de la ruta (la adjunta ShopAccessGuard). */
export const CurrentMember = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ShopMember =>
    ctx.switchToHttp().getRequest<{ shopMember: ShopMember }>().shopMember,
);
