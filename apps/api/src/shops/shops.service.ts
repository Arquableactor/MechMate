import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { type Account, Prisma, type Shop, type ShopMember } from '@prisma/client';
import type {
  InvitableShopRole,
  ShopMemberInvitedPayload,
  ShopMemberRole,
  ShopMemberView,
  ShopType,
  ShopView,
} from '@repo/types';
import { isUUID } from 'class-validator';
import { type AccountContact, AccountsService } from '../accounts/accounts.service';
import { recordOutboxEvents } from '../outbox/outbox.writer';
import { PrismaService } from '../prisma/prisma.service';

/** Nombre del taller + contacto de su dueño (para notificaciones). */
export interface ShopOwnerContact {
  shopName: string;
  owner: AccountContact;
}

const NOT_FOUND = 'Taller no encontrado';

type MemberWithAccount = ShopMember & {
  account: Pick<Account, 'email' | 'full_name'> | null;
};

export function toMemberView(m: MemberWithAccount): ShopMemberView {
  return {
    id: m.id,
    role: m.role,
    status: m.status,
    account_id: m.account_id,
    email: m.account?.email ?? m.invited_email,
    full_name: m.account?.full_name ?? null,
    created_at: m.created_at.toISOString(),
  };
}

const isUniqueViolation = (e: unknown) =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';

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

  /**
   * Talleres donde la cuenta es miembro activo, del más antiguo al más nuevo.
   * Antes reclama sus invitaciones pendientes: es lo primero que consulta la
   * app al iniciar sesión, así que ahí "entra" al taller que lo invitó.
   */
  async listMine(account: Pick<Account, 'id' | 'email' | 'email_verified'>): Promise<ShopView[]> {
    await this.claimInvitations(account);
    const memberships = await this.prisma.shopMember.findMany({
      where: { account_id: account.id, status: 'active' },
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

  // --- Miembros e invitaciones ---

  async listMembers(shopId: string): Promise<ShopMemberView[]> {
    const members = await this.prisma.shopMember.findMany({
      where: { shop_id: shopId },
      include: { account: { select: { email: true, full_name: true } } },
      orderBy: { created_at: 'asc' },
    });
    return members.map(toMemberView);
  }

  /**
   * Invita a alguien por email. Si ya tiene cuenta con ese email VERIFICADO,
   * entra al instante (`active`); si no, queda `invited` hasta que inicie sesión
   * con ese email verificado. En la misma tx se escribe `ShopMemberInvited`
   * (la notificación sale por el outbox, una sola vez).
   * Idempotente: reinvitar un email pendiente devuelve la misma invitación sin
   * volver a notificar. Invitar a quien ya es miembro activo → 409.
   */
  async invite(
    shopId: string,
    inviter: Pick<Account, 'full_name'>,
    input: { email: string; role: InvitableShopRole },
  ): Promise<ShopMemberView> {
    const email = input.email.trim().toLowerCase();
    const shop = await this.getOrThrow(shopId);
    const account = await this.accounts.findByEmail(email);
    const verifiedAccountId = account?.email_verified ? account.id : null;

    const existing = await this.prisma.shopMember.findFirst({
      where: {
        shop_id: shopId,
        OR: [{ invited_email: email }, ...(account ? [{ account_id: account.id }] : [])],
      },
      include: { account: { select: { email: true, full_name: true } } },
    });
    if (existing?.status === 'active') {
      throw new ConflictException('Esa persona ya es miembro del taller.');
    }
    if (existing) return toMemberView(existing); // invitación pendiente: no se renotifica

    try {
      const member = await this.prisma.$transaction(async (tx) => {
        const created = await tx.shopMember.create({
          data: {
            shop_id: shopId,
            invited_email: email,
            role: input.role,
            status: verifiedAccountId ? 'active' : 'invited',
            account_id: verifiedAccountId,
          },
          include: { account: { select: { email: true, full_name: true } } },
        });
        await recordOutboxEvents(tx, [
          {
            topic: 'ShopMemberInvited',
            payload: {
              memberId: created.id,
              shopId,
              shopName: shop.name,
              email,
              role: input.role,
              status: created.status,
              invitedByName: inviter.full_name,
            } satisfies ShopMemberInvitedPayload,
          },
        ]);
        return created;
      });
      return toMemberView(member);
    } catch (error) {
      // Carrera: otra invitación concurrente al mismo email ganó el UNIQUE.
      if (!isUniqueViolation(error)) throw error;
      const winner = await this.prisma.shopMember.findFirstOrThrow({
        where: { shop_id: shopId, invited_email: email },
        include: { account: { select: { email: true, full_name: true } } },
      });
      return toMemberView(winner);
    }
  }

  /** Quita a un miembro o cancela una invitación. Al owner no se le quita. */
  async removeMember(shopId: string, memberId: string): Promise<void> {
    const member = isUUID(memberId)
      ? await this.prisma.shopMember.findFirst({ where: { id: memberId, shop_id: shopId } })
      : null;
    if (!member) throw new NotFoundException('Miembro no encontrado');
    if (member.role === 'owner') {
      throw new ForbiddenException('Al dueño del taller no se le puede quitar.');
    }
    await this.prisma.shopMember.delete({ where: { id: member.id } });
  }

  /**
   * Vincula las invitaciones pendientes al email VERIFICADO de la cuenta. Sin
   * email verificado no reclama nada (el email solo prueba identidad si Auth0
   * lo confirmó). Devuelve cuántas se activaron.
   */
  async claimInvitations(account: Pick<Account, 'id' | 'email' | 'email_verified'>): Promise<number> {
    if (!account.email || !account.email_verified) return 0;
    const pending = await this.prisma.shopMember.findMany({
      where: { invited_email: account.email.toLowerCase(), status: 'invited', account_id: null },
    });

    let claimed = 0;
    for (const invite of pending) {
      try {
        await this.prisma.shopMember.update({
          where: { id: invite.id },
          data: { account_id: account.id, status: 'active' },
        });
        claimed++;
      } catch (error) {
        // Ya era miembro de ese taller por otra vía: la invitación sobra.
        if (!isUniqueViolation(error)) throw error;
        await this.prisma.shopMember.delete({ where: { id: invite.id } });
      }
    }
    return claimed;
  }

  private async getOrThrow(shopId: string): Promise<Shop> {
    const shop = isUUID(shopId) ? await this.prisma.shop.findUnique({ where: { id: shopId } }) : null;
    if (!shop) throw new NotFoundException(NOT_FOUND);
    return shop;
  }
}
