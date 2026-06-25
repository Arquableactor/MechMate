import { BadRequestException, Injectable } from '@nestjs/common';
import { LedgerAccountsService } from '../ledger/ledger-accounts.service';
import { LedgerService } from '../ledger/ledger.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayoutsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: LedgerService,
    private readonly ledgerAccounts: LedgerAccountsService,
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
    await this.prisma.shop.findUniqueOrThrow({ where: { id: shopId } });

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
}
