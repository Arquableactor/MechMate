import { BadRequestException } from '@nestjs/common';
import { LedgerService, type PostEntryInput } from './ledger.service';
import { PrismaService } from '../prisma/prisma.service';

/** tx mock: cuentas DOP que existen; create/createMany no-op. */
const txMock = {
  ledgerAccount: {
    findMany: jest.fn().mockResolvedValue([
      { id: 'a', currency: 'DOP' },
      { id: 'b', currency: 'DOP' },
    ]),
  },
  ledgerEntry: { create: jest.fn().mockResolvedValue({ id: 'entry-1' }) },
  ledgerPosting: { createMany: jest.fn().mockResolvedValue({ count: 2 }) },
  outboxEvent: { createMany: jest.fn().mockResolvedValue({ count: 0 }) },
};

const prismaMock = {
  $transaction: jest.fn((cb: (tx: typeof txMock) => unknown) => cb(txMock)),
} as unknown as PrismaService;

const build = () => new LedgerService(prismaMock);

const balanced: PostEntryInput = {
  externalRef: 'test',
  postings: [
    { accountId: 'a', amountCents: -100n, currency: 'DOP' },
    { accountId: 'b', amountCents: 100n, currency: 'DOP' },
  ],
};

describe('LedgerService.postEntry — validación de app (red de seguridad = trigger DB)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rechaza un asiento con menos de 2 líneas', async () => {
    await expect(
      build().postEntry({ postings: [{ accountId: 'a', amountCents: 0n, currency: 'DOP' }] }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rechaza un asiento desbalanceado (SUM != 0)', async () => {
    await expect(
      build().postEntry({
        postings: [
          { accountId: 'a', amountCents: -100n, currency: 'DOP' },
          { accountId: 'b', amountCents: 99n, currency: 'DOP' },
        ],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rechaza múltiples monedas en un mismo asiento', async () => {
    await expect(
      build().postEntry({
        postings: [
          { accountId: 'a', amountCents: -100n, currency: 'DOP' },
          { accountId: 'b', amountCents: 100n, currency: 'USD' },
        ],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rechaza si la moneda de la línea != moneda de la cuenta', async () => {
    txMock.ledgerAccount.findMany.mockResolvedValueOnce([
      { id: 'a', currency: 'USD' },
      { id: 'b', currency: 'USD' },
    ]);
    await expect(build().postEntry(balanced)).rejects.toThrow(BadRequestException);
  });

  it('escribe entry + postings cuando balancea', async () => {
    const res = await build().postEntry(balanced);
    expect(res.entryId).toBe('entry-1');
    expect(txMock.ledgerEntry.create).toHaveBeenCalledTimes(1);
    expect(txMock.ledgerPosting.createMany).toHaveBeenCalledTimes(1);
  });
});
