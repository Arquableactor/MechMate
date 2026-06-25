import { Injectable } from '@nestjs/common';
import { LedgerAccountKind, LedgerOwnerType, Prisma } from '@prisma/client';
import {
  PLATFORM_CLEARING_DOP,
  PLATFORM_COMMISSION_REVENUE_DOP,
} from '../common/ledger-accounts.constants';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Resuelve (find-or-create) cuentas contables. SIEMPRE se llama **fuera** de la
 * transacción de captura: en Postgres un unique-violation aborta toda la tx
 * interactiva, así que provisionar dentro la envenenaría. Race-safe vía el patrón
 * findFirst → create → catch P2002 → findFirst (igual que accounts.service.ts).
 */
@Injectable()
export class LedgerAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Cuenta con dueño (buyer/seller). `ownerId` NOT NULL. */
  async getOrCreateOwned(
    ownerType: LedgerOwnerType,
    ownerId: string,
    kind: LedgerAccountKind,
    currency: string,
  ): Promise<string> {
    return this.getOrCreate(ownerType, ownerId, kind, currency);
  }

  /** Cuenta singleton de plataforma/impuestos (owner_id NULL). */
  async getOrCreateSingleton(
    ownerType: LedgerOwnerType,
    kind: LedgerAccountKind,
    currency: string,
  ): Promise<string> {
    // Fast-path por constante para las cuentas DOP ya sembradas en la migración.
    if (currency === 'DOP') {
      if (ownerType === 'platform' && kind === 'commission_revenue') {
        return PLATFORM_COMMISSION_REVENUE_DOP;
      }
      if (ownerType === 'platform' && kind === 'clearing') {
        return PLATFORM_CLEARING_DOP;
      }
    }
    return this.getOrCreate(ownerType, null, kind, currency);
  }

  private async getOrCreate(
    ownerType: LedgerOwnerType,
    ownerId: string | null,
    kind: LedgerAccountKind,
    currency: string,
  ): Promise<string> {
    const where = { owner_type: ownerType, owner_id: ownerId, kind, currency };
    const existing = await this.prisma.ledgerAccount.findFirst({ where });
    if (existing) return existing.id;

    try {
      const created = await this.prisma.ledgerAccount.create({
        data: { owner_type: ownerType, owner_id: ownerId, kind, currency },
      });
      return created.id;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const row = await this.prisma.ledgerAccount.findFirstOrThrow({ where });
        return row.id;
      }
      throw error;
    }
  }
}
