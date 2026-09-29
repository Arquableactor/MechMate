import { BadRequestException, Injectable } from '@nestjs/common';
import type { Payout, Prisma } from '@prisma/client';
import { LedgerAccountsService } from '../ledger/ledger-accounts.service';
import { LedgerService } from '../ledger/ledger.service';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';

@Injectable()
export class PayoutsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: LedgerService,
    private readonly ledgerAccounts: LedgerAccountsService,
    private readonly shops: ShopsService,
  ) {}

  /**
   * Primitiva mínima de payout: crea la fila `payouts` y postea el asiento
   * `available −amount` / `clearing +amount` en una sola tx. Sin reglas de
   * scheduling todavía. `scheduledFor` es 'YYYY-MM-DD' (evita off-by-one UTC-4).
   */
  async schedulePayout(
    shopId: string,
    amountCents: bigint,
    scheduledFor: string,
    currency = 'DOP',
  ): Promise<{ payoutId: string; entryId: string }> {
    if (amountCents <= 0n) {
      throw new BadRequestException('El monto del payout debe ser > 0');
    }
    await this.shops.assertExists(shopId);

    const sellerAvailable = await this.ledgerAccounts.getOrCreateOwned(
      'seller',
      shopId,
      'available',
      currency,
    );
    const clearing = await this.ledgerAccounts.getOrCreateSingleton('platform', 'clearing', currency);

    return this.prisma.$transaction(async (tx) => {
      const payout = await tx.payout.create({
        data: {
          shop_id: shopId,
          amount_cents: amountCents,
          currency,
          status: 'scheduled',
          scheduled_for: new Date(`${scheduledFor}T00:00:00.000Z`),
        },
      });

      const { entryId } = await this.ledger.postEntry(
        {
          externalRef: `payout:${payout.id}`,
          description: `Payout programado ${payout.id}`,
          postings: [
            { accountId: sellerAvailable, amountCents: -amountCents, currency },
            { accountId: clearing, amountCents, currency },
          ],
        },
        tx,
      );

      return { payoutId: payout.id, entryId };
    });
  }

  /**
   * Cuentas del ledger de un payout (se provisionan FUERA de la tx del cobro).
   */
  async accounts(shopId: string, currency: string): Promise<{ shopAvailable: string; clearing: string }> {
    const [shopAvailable, clearing] = await Promise.all([
      this.ledgerAccounts.getOrCreateOwned('seller', shopId, 'available', currency),
      this.ledgerAccounts.getOrCreateSingleton('platform', 'clearing', currency),
    ]);
    return { shopAvailable, clearing };
  }

  /**
   * Programa el payout de TODO el saldo disponible del taller, en la tx del
   * llamador (tras asentar un cobro con tarjeta). Así la deuda de comisiones
   * por cobros en efectivo (saldo negativo) se descuenta sola. Sin saldo
   * positivo no hay payout (devuelve null).
   */
  async scheduleAvailableBalance(
    tx: Prisma.TransactionClient,
    input: {
      shopId: string;
      currency: string;
      scheduledFor: string;
      sourcePaymentId: string;
      accounts: { shopAvailable: string; clearing: string };
    },
  ): Promise<Payout | null> {
    const { _sum } = await tx.ledgerPosting.aggregate({
      where: { account_id: input.accounts.shopAvailable },
      _sum: { amount_cents: true },
    });
    const balance = _sum.amount_cents ?? 0n;
    if (balance <= 0n) return null;

    const payout = await tx.payout.create({
      data: {
        shop_id: input.shopId,
        amount_cents: balance,
        currency: input.currency,
        status: 'scheduled',
        scheduled_for: new Date(`${input.scheduledFor}T00:00:00.000Z`),
        source_payment_id: input.sourcePaymentId,
      },
    });
    await this.ledger.postEntry(
      {
        externalRef: `payout:${payout.id}`,
        description: `Payout programado ${payout.id} (${input.scheduledFor})`,
        postings: [
          { accountId: input.accounts.shopAvailable, amountCents: -balance, currency: input.currency },
          { accountId: input.accounts.clearing, amountCents: balance, currency: input.currency },
        ],
      },
      tx,
    );
    return payout;
  }
}
