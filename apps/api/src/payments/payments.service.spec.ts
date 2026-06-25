import { BadRequestException, ConflictException } from '@nestjs/common';
import { PaymentsService, type CaptureInput } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { LedgerAccountsService } from '../ledger/ledger-accounts.service';
import type { PaymentProvider } from './providers/payment-provider.interface';

const existingPayment = {
  id: 'pay-1',
  order_id: null,
  provider: 'cardnet' as const,
  provider_ref: null,
  amount_cents: 100000n,
  currency: 'DOP',
  status: 'captured' as const,
  idempotency_key: 'key-1',
  created_at: new Date('2026-06-24T12:00:00.000Z'),
  updated_at: new Date('2026-06-24T12:00:00.000Z'),
};

const baseInput: CaptureInput = {
  idempotencyKey: 'key-1',
  totalCents: 100000n,
  currency: 'DOP',
  shopId: 'shop-1',
  buyerAccountId: 'buyer-1',
};

const build = (paymentFindUnique: jest.Mock) => {
  const prisma = { payment: { findUnique: paymentFindUnique } } as unknown as PrismaService;
  const ledger = {} as LedgerService;
  const ledgerAccounts = {} as LedgerAccountsService;
  const provider = {} as PaymentProvider;
  return new PaymentsService(prisma, ledger, ledgerAccounts, provider);
};

describe('PaymentsService.capture — idempotencia', () => {
  it('misma key + mismo payload → devuelve el pago existente sin re-postear', async () => {
    const findUnique = jest.fn().mockResolvedValue(existingPayment);
    const view = await build(findUnique).capture(baseInput);
    expect(view.id).toBe('pay-1');
    expect(view.amount_cents).toBe('100000'); // string en el wire
    expect(findUnique).toHaveBeenCalledTimes(1);
  });

  it('misma key + payload distinto (otro monto) → 409 Conflict', async () => {
    const findUnique = jest.fn().mockResolvedValue(existingPayment);
    await expect(
      build(findUnique).capture({ ...baseInput, totalCents: 999n }),
    ).rejects.toThrow(ConflictException);
  });

  it('rechaza totalCents <= 0', async () => {
    const findUnique = jest.fn();
    await expect(build(findUnique).capture({ ...baseInput, totalCents: 0n })).rejects.toThrow(
      BadRequestException,
    );
    expect(findUnique).not.toHaveBeenCalled();
  });
});

describe('PaymentsService.handleWebhook — máquina de estados', () => {
  const buildWith = (payment: unknown, update = jest.fn()) => {
    const prisma = {
      payment: { findFirst: jest.fn().mockResolvedValue(payment), update },
    } as unknown as PrismaService;
    return new PaymentsService(
      prisma,
      {} as LedgerService,
      {} as LedgerAccountsService,
      {} as PaymentProvider,
    );
  };

  it('idempotente: mismo status entrante → no-op (applied=false)', async () => {
    const update = jest.fn();
    const svc = buildWith({ ...existingPayment, status: 'captured' }, update);
    const res = await svc.handleWebhook({ paymentId: 'pay-1', status: 'captured' });
    expect(res.applied).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });

  it('transición inválida (refunded → captured) → 409', async () => {
    const svc = buildWith({ ...existingPayment, status: 'refunded' });
    await expect(svc.handleWebhook({ paymentId: 'pay-1', status: 'captured' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('transición válida requires_action → failed actualiza el status', async () => {
    const update = jest.fn().mockResolvedValue(undefined);
    const svc = buildWith({ ...existingPayment, status: 'requires_action' }, update);
    const res = await svc.handleWebhook({ paymentId: 'pay-1', status: 'failed' });
    expect(res.applied).toBe(true);
    expect(update).toHaveBeenCalledWith({ where: { id: 'pay-1' }, data: { status: 'failed' } });
  });
});
