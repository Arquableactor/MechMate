import { Injectable } from '@nestjs/common';
import { Prisma, type Account, type AccountRole } from '@prisma/client';
import type { MeResponse, Role } from '@repo/types';
import { PrismaService } from '../prisma/prisma.service';

/** Claims relevantes del JWT de Auth0 para el JIT provisioning. */
export interface Auth0Claims {
  sub: string;
  email?: string;
  phone_number?: string;
  name?: string;
}

type AccountWithRoles = Account & { roles: AccountRole[] };

/** Contacto de una cuenta, para notificaciones. */
export interface AccountContact {
  accountId: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
}

export interface ShopOwnerContact {
  shopName: string;
  owner: AccountContact;
}

const toContact = (a: Pick<Account, 'id' | 'email' | 'phone' | 'full_name'>): AccountContact => ({
  accountId: a.id,
  email: a.email,
  phone: a.phone,
  fullName: a.full_name,
});

const ACCOUNT_WITH_ROLES = { roles: true } as const;

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * JIT provisioning: devuelve la cuenta vinculada a `claims.sub`, creándola en
   * la primera petición. Idempotente y race-safe: dos peticiones concurrentes
   * crean una sola cuenta (constraint único en `auth0_sub` + manejo de P2002).
   */
  async provisionFromClaims(claims: Auth0Claims): Promise<AccountWithRoles> {
    const existing = await this.prisma.account.findUnique({
      where: { auth0_sub: claims.sub },
      include: ACCOUNT_WITH_ROLES,
    });
    if (existing) return existing;

    try {
      return await this.prisma.account.create({
        data: {
          auth0_sub: claims.sub,
          email: claims.email ?? null,
          phone: claims.phone_number ?? null,
          full_name: claims.name ?? null,
        },
        include: ACCOUNT_WITH_ROLES,
      });
    } catch (error) {
      // Carrera: otra petición concurrente ya creó la cuenta para este `sub`.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return this.prisma.account.findUniqueOrThrow({
          where: { auth0_sub: claims.sub },
          include: ACCOUNT_WITH_ROLES,
        });
      }
      throw error;
    }
  }

  /**
   * Añade un rol a la cuenta. Idempotente: si ya lo tiene, no duplica (upsert
   * sobre la PK compuesta `(account_id, role)`).
   */
  async addRole(accountId: string, role: Role): Promise<AccountWithRoles> {
    await this.prisma.accountRole.upsert({
      where: { account_id_role: { account_id: accountId, role } },
      create: { account_id: accountId, role },
      update: {},
    });

    return this.prisma.account.findUniqueOrThrow({
      where: { id: accountId },
      include: ACCOUNT_WITH_ROLES,
    });
  }

  /**
   * Datos de contacto de una cuenta para notificar (email/teléfono). `null` si
   * no existe. Es la vía de otros módulos para leer contactos: NO consultan
   * `accounts` directamente (fronteras entre módulos).
   */
  async getContact(accountId: string): Promise<AccountContact | null> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: { id: true, email: true, phone: true, full_name: true },
    });
    return account && toContact(account);
  }

  /** Nombre del taller + contacto de su dueño. `null` si el taller no existe. */
  async getShopOwnerContact(shopId: string): Promise<ShopOwnerContact | null> {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: {
        name: true,
        owner: { select: { id: true, email: true, phone: true, full_name: true } },
      },
    });
    return shop && { shopName: shop.name, owner: toContact(shop.owner) };
  }

  /** Mapea la entidad Prisma al contrato público `MeResponse`. */
  toMeResponse(account: AccountWithRoles): MeResponse {
    return {
      id: account.id,
      auth0_sub: account.auth0_sub,
      email: account.email,
      phone: account.phone,
      full_name: account.full_name,
      status: account.status,
      kyc_status: account.kyc_status,
      roles: account.roles.map((r) => r.role),
      created_at: account.created_at.toISOString(),
    };
  }
}
