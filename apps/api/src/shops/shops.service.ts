import { Injectable, NotFoundException } from '@nestjs/common';
import type { Shop, ShopMember } from '@prisma/client';
import type { ShopMemberRole, ShopType, ShopView } from '@repo/types';
import { isUUID } from 'class-validator';
import { type AccountContact, AccountsService } from '../accounts/accounts.service';
import { PrismaService } from '../prisma/prisma.service';

/** Nombre del taller + contacto de su dueño (para notificaciones). */
export interface ShopOwnerContact {
  shopName: string;
  owner: AccountContact;
}

const NOT_FOUND = 'Taller no encontrado';

export function toShopView(shop: Shop, myRole: ShopMemberRole): ShopView {
  return {
    id: shop.id,
    name: shop.name,
    type: shop.type,
    commission_bps: shop.commission_bps,
    my_role: myRole,
    created_at: shop.created_at.toISOString(),
  };
}

/**
 * Dueño de `shops` y `shop_members`. Los demás módulos (pagos, payouts,
 * notificaciones) leen talleres SOLO a través de este servicio: nada de
 * `prisma.shop` fuera de aquí (CLAUDE.md: sin SQL cruzado entre módulos).
 */
@Injectable()
export class ShopsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accounts: AccountsService,
  ) {}

  /**
   * Crea el taller y deja a quien lo crea como miembro `owner`, en una sola tx.
   * Además le da el rol global que corresponde (mechanic/seller), idempotente.
   */
  async create(ownerId: string, input: { name: string; type: ShopType }): Promise<ShopView> {
    const shop = await this.prisma.$transaction(async (tx) => {
      const created = await tx.shop.create({
        data: { owner_id: ownerId, name: input.name, type: input.type },
      });
      await tx.shopMember.create({
        data: { shop_id: created.id, account_id: ownerId, role: 'owner', status: 'active' },
      });
      return created;
    });
    await this.accounts.addRole(ownerId, input.type === 'mechanic_shop' ? 'mechanic' : 'seller');
    return toShopView(shop, 'owner');
  }

  /** Talleres donde la cuenta es miembro activo, del más antiguo al más nuevo. */
  async listMine(accountId: string): Promise<ShopView[]> {
    const memberships = await this.prisma.shopMember.findMany({
      where: { account_id: accountId, status: 'active' },
      include: { shop: true },
      orderBy: { created_at: 'asc' },
    });
    return memberships.map((m) => toShopView(m.shop, m.role));
  }

  /**
   * Membresía ACTIVA de la cuenta en el taller, o `null`. Un id mal formado
   * también da `null` (el guard responde 404 igual, sin filtrar nada).
   */
  async findActiveMembership(shopId: string, accountId: string): Promise<ShopMember | null> {
    if (!isUUID(shopId)) return null;
    const member = await this.prisma.shopMember.findUnique({
      where: { shop_id_account_id: { shop_id: shopId, account_id: accountId } },
    });
    return member?.status === 'active' ? member : null;
  }

  /** El taller visto por un miembro (ya autorizado por el guard). */
  async getView(shopId: string, myRole: ShopMemberRole): Promise<ShopView> {
    return toShopView(await this.getOrThrow(shopId), myRole);
  }

  /** Comisión de la plataforma para el taller (lo usa Payments al capturar). */
  async getCommissionBps(shopId: string): Promise<number> {
    return (await this.getOrThrow(shopId)).commission_bps;
  }

  /** Lanza 404 si el taller no existe (lo usa Payouts). */
  async assertExists(shopId: string): Promise<void> {
    await this.getOrThrow(shopId);
  }

  /** Nombre del taller + contacto del dueño, o `null` si no existe. */
  async getOwnerContact(shopId: string): Promise<ShopOwnerContact | null> {
    if (!isUUID(shopId)) return null;
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) return null;
    const owner = await this.accounts.getContact(shop.owner_id);
    return owner && { shopName: shop.name, owner };
  }

  private async getOrThrow(shopId: string): Promise<Shop> {
    const shop = isUUID(shopId) ? await this.prisma.shop.findUnique({ where: { id: shopId } }) : null;
    if (!shop) throw new NotFoundException(NOT_FOUND);
    return shop;
  }
}
