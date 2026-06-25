import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { isBalanced, sumCents } from '../common/money';
import { PrismaService } from '../prisma/prisma.service';

/** Una línea del asiento. `amountCents` positivo = crédito, negativo = débito. */
export interface PostingInput {
  accountId: string;
  amountCents: bigint;
  currency: string;
}

export interface OutboxEventInput {
  topic: string;
  payload: Prisma.InputJsonValue;
}

export interface PostEntryInput {
  externalRef?: string;
  description?: string;
  postings: PostingInput[];
  /** Eventos de dominio a escribir en la MISMA tx (outbox transaccional). */
  outboxEvents?: OutboxEventInput[];
}

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Primitiva atómica del ledger. Valida en app (`SUM=0`, una sola moneda,
   * moneda de la línea = moneda de la cuenta) **antes** de escribir, para dar un
   * error legible; el `CONSTRAINT TRIGGER` diferido de la DB es la red de
   * seguridad (su error emerge al COMMIT). Escribe entry + postings (+ outbox)
   * en una sola transacción. Si recibe `tx`, escribe en ella; si no, abre una.
   */
  async postEntry(
    input: PostEntryInput,
    tx?: Prisma.TransactionClient,
  ): Promise<{ entryId: string }> {
    const { postings } = input;
    if (postings.length < 2) {
      throw new BadRequestException('Un asiento requiere al menos 2 líneas');
    }
    const amounts = postings.map((p) => p.amountCents);
    if (!isBalanced(amounts)) {
      throw new BadRequestException(
        `Asiento desbalanceado: SUM(amount_cents) = ${sumCents(amounts).toString()}`,
      );
    }
    if (new Set(postings.map((p) => p.currency)).size > 1) {
      throw new BadRequestException('Un asiento no puede mezclar monedas');
    }

    const run = async (db: Prisma.TransactionClient): Promise<{ entryId: string }> => {
      await this.assertPostingCurrencies(db, postings);

      const entry = await db.ledgerEntry.create({
        data: { external_ref: input.externalRef, description: input.description },
      });
      await db.ledgerPosting.createMany({
        data: postings.map((p) => ({
          entry_id: entry.id,
          account_id: p.accountId,
          amount_cents: p.amountCents,
          currency: p.currency,
        })),
      });
      if (input.outboxEvents?.length) {
        await db.outboxEvent.createMany({
          data: input.outboxEvents.map((e) => ({ topic: e.topic, payload: e.payload })),
        });
      }
      return { entryId: entry.id };
    };

    return tx ? run(tx) : this.prisma.$transaction(run);
  }

  /** Cada línea debe tener la misma moneda que su cuenta contable. */
  private async assertPostingCurrencies(
    db: Prisma.TransactionClient,
    postings: PostingInput[],
  ): Promise<void> {
    const ids = [...new Set(postings.map((p) => p.accountId))];
    const accounts = await db.ledgerAccount.findMany({
      where: { id: { in: ids } },
      select: { id: true, currency: true },
    });
    const currencyById = new Map(accounts.map((a) => [a.id, a.currency]));
    for (const p of postings) {
      const accCurrency = currencyById.get(p.accountId);
      if (!accCurrency) {
        throw new BadRequestException(`Cuenta contable ${p.accountId} no existe`);
      }
      if (accCurrency !== p.currency) {
        throw new BadRequestException(
          `Moneda de la línea (${p.currency}) ≠ moneda de la cuenta (${accCurrency})`,
        );
      }
    }
  }
}
