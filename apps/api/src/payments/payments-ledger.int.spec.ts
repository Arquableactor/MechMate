import { randomUUID } from 'node:crypto';
import { LedgerAccountsService } from '../ledger/ledger-accounts.service';
import { LedgerService } from '../ledger/ledger.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService, type CaptureInput } from './payments.service';
import type { PaymentProvider } from './providers/payment-provider.interface';

/**
 * Los 6 tests-joya del ledger, contra Postgres REAL (embedded-postgres local /
 * service postgres en CI). Prueban las invariantes EN LA DB (triggers), no solo
 * en la capa de app. El provider no se usa en capture(), así que va un stub.
 */
let prisma: PrismaService;
let ledger: LedgerService;
let ledgerAccounts: LedgerAccountsService;
let payments: PaymentsService;

beforeAll(async () => {
  prisma = new PrismaService();
  await prisma.$connect();
  ledger = new LedgerService(prisma);
  ledgerAccounts = new LedgerAccountsService(prisma);
  payments = new PaymentsService(prisma, ledger, ledgerAccounts, {} as PaymentProvider);
});

afterAll(async () => {
  await prisma.$disconnect();
});

async function createShop(commissionBps = 800) {
  const owner = await prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } });
  const buyer = await prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } });
  const shop = await prisma.shop.create({
    data: { owner_id: owner.id, type: 'mechanic_shop', name: 'Taller Test', commission_bps: commissionBps },
  });
  return { shop, buyer };
}

const captureInput = (over: Partial<CaptureInput> & Pick<CaptureInput, 'shopId' | 'buyerAccountId'>): CaptureInput => ({
  idempotencyKey: `key-${randomUUID()}`,
  totalCents: 100000n,
  currency: 'DOP',
  ...over,
});

describe('Ledger + Payments (integración, Postgres real)', () => {
  it('(a) trigger de balance: un asiento desbalanceado se rechaza EN LA DB', async () => {
    const acc = await ledgerAccounts.getOrCreateSingleton('platform', 'commission_revenue', 'DOP');
    await expect(
      prisma.$transaction(async (tx) => {
        const entryId = randomUUID();
        await tx.$executeRawUnsafe(
          `INSERT INTO ledger_entries (id, created_at) VALUES ($1::uuid, now())`,
          entryId,
        );
        await tx.$executeRawUnsafe(
          `INSERT INTO ledger_postings (id, entry_id, account_id, amount_cents, currency, created_at)
           VALUES (gen_random_uuid(), $1::uuid, $2::uuid, 100, 'DOP', now())`,
          entryId,
          acc,
        );
        await tx.$executeRawUnsafe(
          `INSERT INTO ledger_postings (id, entry_id, account_id, amount_cents, currency, created_at)
           VALUES (gen_random_uuid(), $1::uuid, $2::uuid, 50, 'DOP', now())`,
          entryId,
          acc,
        );
      }),
    ).rejects.toThrow(/desbalanceado|SUM/i);
  });

  it('(b) inmutabilidad: UPDATE/DELETE/TRUNCATE lanzan; una reversa (INSERT) sí pasa', async () => {
    const a = await ledgerAccounts.getOrCreateOwned('buyer', randomUUID(), 'available', 'DOP');
    const b = await ledgerAccounts.getOrCreateSingleton('platform', 'commission_revenue', 'DOP');
    const { entryId } = await ledger.postEntry({
      externalRef: `imm-${randomUUID()}`,
      postings: [
        { accountId: a, amountCents: -100n, currency: 'DOP' },
        { accountId: b, amountCents: 100n, currency: 'DOP' },
      ],
    });

    await expect(
      prisma.$executeRawUnsafe(`UPDATE ledger_entries SET description = 'x' WHERE id = $1::uuid`, entryId),
    ).rejects.toThrow(/append-only/i);
    await expect(
      prisma.$executeRawUnsafe(`DELETE FROM ledger_postings WHERE entry_id = $1::uuid`, entryId),
    ).rejects.toThrow(/append-only/i);
    await expect(
      prisma.$executeRawUnsafe(`DELETE FROM ledger_entries WHERE id = $1::uuid`, entryId),
    ).rejects.toThrow(/append-only/i);
    await expect(prisma.$executeRawUnsafe(`TRUNCATE ledger_postings`)).rejects.toThrow(/append-only/i);

    // Reversa: nuevo asiento con líneas invertidas (NO se bloquea).
    const reversal = await ledger.postEntry({
      externalRef: `reversal:${entryId}`,
      postings: [
        { accountId: a, amountCents: 100n, currency: 'DOP' },
        { accountId: b, amountCents: -100n, currency: 'DOP' },
      ],
    });
    expect(reversal.entryId).toBeTruthy();
  });

  it('(c) multi-moneda en un mismo asiento se rechaza EN LA DB', async () => {
    const acc = await ledgerAccounts.getOrCreateSingleton('platform', 'commission_revenue', 'DOP');
    await expect(
      prisma.$transaction(async (tx) => {
        const entryId = randomUUID();
        await tx.$executeRawUnsafe(
          `INSERT INTO ledger_entries (id, created_at) VALUES ($1::uuid, now())`,
          entryId,
        );
        await tx.$executeRawUnsafe(
          `INSERT INTO ledger_postings (id, entry_id, account_id, amount_cents, currency, created_at)
           VALUES (gen_random_uuid(), $1::uuid, $2::uuid, -100, 'DOP', now())`,
          entryId,
          acc,
        );
        await tx.$executeRawUnsafe(
          `INSERT INTO ledger_postings (id, entry_id, account_id, amount_cents, currency, created_at)
           VALUES (gen_random_uuid(), $1::uuid, $2::uuid, 100, 'USD', now())`,
          entryId,
          acc,
        );
      }),
    ).rejects.toThrow(/moneda|monedas|currenc/i);
  });

  it('(d) captura: asiento de 3 líneas que suma 0 y comisión exacta al centavo', async () => {
    const { shop, buyer } = await createShop(800);
    const view = await payments.capture(
      captureInput({ shopId: shop.id, buyerAccountId: buyer.id, totalCents: 100000n }),
    );
    expect(view.status).toBe('captured');
    expect(view.amount_cents).toBe('100000');

    const postings = await prisma.$queryRawUnsafe<{ amount_cents: bigint; kind: string }[]>(
      `SELECT p.amount_cents, a.kind
         FROM ledger_postings p
         JOIN ledger_entries e ON e.id = p.entry_id
         JOIN ledger_accounts a ON a.id = p.account_id
        WHERE e.external_ref = $1`,
      `payment:${view.id}`,
    );
    expect(postings).toHaveLength(3);
    const sum = postings.reduce((acc, r) => acc + BigInt(r.amount_cents), 0n);
    expect(sum).toBe(0n);
    const commission = postings.find((r) => r.kind === 'commission_revenue');
    expect(BigInt(commission!.amount_cents)).toBe(8000n);

    // Outbox escopado a ESTE pago: exactamente PaymentCaptured + CommissionAccrued.
    const events = await prisma.outboxEvent.findMany({
      where: { payload: { path: ['paymentId'], equals: view.id } },
    });
    expect(events.map((e) => e.topic).sort()).toEqual(['CommissionAccrued', 'PaymentCaptured']);
  });

  it('(e) idempotencia concurrente: misma key 2x → 1 payment, 1 asiento, 3 postings', async () => {
    const { shop, buyer } = await createShop(800);
    const input = captureInput({ shopId: shop.id, buyerAccountId: buyer.id, totalCents: 50000n });
    const [first, second] = await Promise.all([payments.capture(input), payments.capture(input)]);

    expect(first.id).toBe(second.id);
    const count = await prisma.payment.count({ where: { idempotency_key: input.idempotencyKey } });
    expect(count).toBe(1);

    const rows = await prisma.$queryRawUnsafe<{ n: number }[]>(
      `SELECT count(*)::int AS n
         FROM ledger_postings p JOIN ledger_entries e ON e.id = p.entry_id
        WHERE e.external_ref = $1`,
      `payment:${first.id}`,
    );
    expect(rows[0].n).toBe(3);
  });

  it('(f) reconciliación global: SUM(todos los postings) = 0', async () => {
    const { shop, buyer } = await createShop(750);
    await payments.capture(
      captureInput({ shopId: shop.id, buyerAccountId: buyer.id, totalCents: 33333n }),
    );
    const rows = await prisma.$queryRawUnsafe<{ total: bigint }[]>(
      `SELECT COALESCE(SUM(amount_cents), 0)::bigint AS total FROM ledger_postings`,
    );
    expect(BigInt(rows[0].total)).toBe(0n);
  });

  it('(g) refund: webhook captured→refunded postea asiento de reversa; idempotente; reconciliación 0', async () => {
    const { shop, buyer } = await createShop(800);
    const view = await payments.capture(
      captureInput({ shopId: shop.id, buyerAccountId: buyer.id, totalCents: 70000n }),
    );

    const res = await payments.handleWebhook({ paymentId: view.id, status: 'refunded' });
    expect(res.applied).toBe(true);

    const refreshed = await prisma.payment.findUniqueOrThrow({ where: { id: view.id } });
    expect(refreshed.status).toBe('refunded');

    // La reversa es un asiento NUEVO de 3 líneas con montos invertidos.
    const reversal = await prisma.$queryRawUnsafe<{ amount_cents: bigint }[]>(
      `SELECT p.amount_cents
         FROM ledger_postings p JOIN ledger_entries e ON e.id = p.entry_id
        WHERE e.external_ref = $1`,
      `reversal:payment:${view.id}`,
    );
    expect(reversal).toHaveLength(3);
    expect(reversal.reduce((acc, r) => acc + BigInt(r.amount_cents), 0n)).toBe(0n);

    // Idempotente: re-entregar el mismo webhook no re-postea.
    const again = await payments.handleWebhook({ paymentId: view.id, status: 'refunded' });
    expect(again.applied).toBe(false);

    // Capturado (+) y revertido (−) ⇒ el neto del pago en el ledger queda en 0.
    const recon = await prisma.$queryRawUnsafe<{ total: bigint }[]>(
      `SELECT COALESCE(SUM(amount_cents), 0)::bigint AS total FROM ledger_postings`,
    );
    expect(BigInt(recon[0].total)).toBe(0n);
  });
});
