import { randomUUID } from 'node:crypto';
import { ConflictException, HttpStatus, NotFoundException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { PaymentCapturedPayload, WorkOrderStatusChangedPayload } from '@repo/types';
import { AccountsService } from '../accounts/accounts.service';
import { addBusinessDays } from '../common/business-days';
import { CustomersService } from '../customers/customers.service';
import { PendingFiscalProvider } from '../invoices/fiscal-provider';
import { InvoicesService } from '../invoices/invoices.service';
import { LedgerAccountsService } from '../ledger/ledger-accounts.service';
import { LedgerService } from '../ledger/ledger.service';
import { InvoicePaymentsService } from '../payments/invoice-payments.service';
import { CardnetProvider } from '../payments/providers/cardnet.provider';
import type { PaymentProvider } from '../payments/providers/payment-provider.interface';
import { PayoutsService } from '../payouts/payouts.service';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import type { VinService } from '../vin/vin.service';
import { WorkOrderItemsService } from '../work-orders/work-order-items.service';
import { WorkOrdersService } from '../work-orders/work-orders.service';
import { ChargesService } from './charges.service';

/**
 * Cobro de OT contra Postgres REAL: el dinero cuadra en el ledger, nunca se
 * cobra dos veces, y la deuda de comisiones en efectivo sale del próximo payout.
 */
let prisma: PrismaService;
let shops: ShopsService;
let customers: CustomersService;
let vehicles: VehiclesService;
let workOrders: WorkOrdersService;
let items: WorkOrderItemsService;
let invoices: InvoicesService;
let ledgerAccounts: LedgerAccountsService;

function chargesWith(provider: PaymentProvider) {
  const ledger = new LedgerService(prisma);
  return new ChargesService(
    prisma,
    workOrders,
    invoices,
    new InvoicePaymentsService(prisma, ledger, ledgerAccounts, provider),
    new PayoutsService(prisma, ledger, ledgerAccounts, shops),
    shops,
  );
}

let charges: ChargesService;

beforeAll(async () => {
  prisma = new PrismaService();
  await prisma.$connect();
  shops = new ShopsService(prisma, new AccountsService(prisma));
  customers = new CustomersService(prisma);
  vehicles = new VehiclesService(prisma, customers, {} as VinService);
  workOrders = new WorkOrdersService(prisma, customers, vehicles, shops);
  items = new WorkOrderItemsService(prisma, workOrders);
  invoices = new InvoicesService(prisma, workOrders, customers, vehicles, shops, new PendingFiscalProvider());
  ledgerAccounts = new LedgerAccountsService(prisma);
  const cardnet = new CardnetProvider({ get: () => 'secreto-de-pruebas' } as unknown as ConfigService);
  charges = chargesWith(cardnet);
});

afterAll(async () => {
  await prisma.$disconnect();
});

const key = () => `test-${randomUUID()}`;

async function newShop() {
  const owner = await prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } });
  const shopId = (await shops.create(owner.id, { name: 'Taller', type: 'mechanic_shop' })).id; // comisión 8%
  return { shopId, ownerId: owner.id };
}

/** OT facturada por `priceCents` + ITBIS 18% (1 línea de mano de obra). */
async function invoicedWorkOrder(ctx: { shopId: string; ownerId: string }, priceCents = '180000') {
  const customer = await customers.create(ctx.shopId, { full_name: 'María Gómez' });
  const vehicle = await vehicles.create(ctx.shopId, {
    customer_id: customer.id,
    plate: `C${String(Math.floor(Math.random() * 1e6)).padStart(6, '0')}`,
    make: 'Toyota',
  });
  const wo = await workOrders.create(ctx.shopId, ctx.ownerId, { customer_id: customer.id, vehicle_id: vehicle.id, complaint: 'Frenos' });
  await items.add(ctx.shopId, wo.id, { type: 'labor', description: 'Frenos', quantity: '1', unit_price_cents: priceCents });
  await workOrders.transition(ctx.shopId, wo.id, 'in_progress', { accountId: ctx.ownerId });
  await workOrders.transition(ctx.shopId, wo.id, 'completed', { accountId: ctx.ownerId });
  const invoice = await invoices.issue(ctx.shopId, wo.id, ctx.ownerId);
  return { woId: wo.id, invoice, customerId: customer.id };
}

const balanceOf = async (ownerId: string, ownerType: 'seller' | 'buyer') => {
  const { _sum } = await prisma.ledgerPosting.aggregate({
    where: { account: { owner_type: ownerType, owner_id: ownerId, kind: 'available' } },
    _sum: { amount_cents: true },
  });
  return _sum.amount_cents ?? 0n;
};

describe('Cobro de OT (integración, Postgres real)', () => {
  it('tarjeta: CardNet → asiento de 3 líneas que suma 0, factura y OT pagadas, payout T+2 hábiles', async () => {
    const ctx = await newShop();
    const { woId, invoice, customerId } = await invoicedWorkOrder(ctx); // 1,800 + ITBIS = 2,124.00
    const view = await charges.charge(ctx.shopId, woId, { method: 'card', idempotencyKey: key(), accountId: ctx.ownerId });

    expect(view).toMatchObject({
      payment: { method: 'card', status: 'captured', amount_cents: '212400', commission_cents: '16992', currency: 'DOP' },
      invoice: { id: invoice.id, code: 'FAC-0001', status: 'paid' },
      work_order: { code: 'OT-0001', status: 'paid' },
      payout: { amount_cents: '195408', scheduled_for: addBusinessDays(new Date(), 2) },
      replayed: false,
    });
    expect(view.payment.provider_ref).toMatch(/^cardnet_mock_/);

    const postings = await prisma.ledgerPosting.findMany({
      where: { entry: { external_ref: `payment:${view.payment.id}` } },
      include: { account: true },
    });
    expect(postings.map((p) => [p.account.owner_type, p.amount_cents])).toEqual(
      expect.arrayContaining([
        ['buyer', -212400n],
        ['seller', 195408n],
        ['platform', 16992n],
      ]),
    );
    expect(postings.reduce((acc, p) => acc + p.amount_cents, 0n)).toBe(0n);
    // El pagador en el ledger es el CLIENTE del taller; el saldo del taller se fue a payout.
    expect(await balanceOf(customerId, 'buyer')).toBe(-212400n);
    expect(await balanceOf(ctx.shopId, 'seller')).toBe(0n);

    const [captured] = await prisma.outboxEvent.findMany({
      where: { topic: 'PaymentCaptured', payload: { path: ['paymentId'], equals: view.payment.id } },
    });
    expect(captured.payload).toMatchObject({
      workOrderId: woId, invoiceId: invoice.id, customerId, method: 'card', buyerAccountId: null,
    } satisfies Partial<PaymentCapturedPayload>);
    const statusEvents = await prisma.outboxEvent.findMany({
      where: { topic: 'WorkOrderStatusChanged', payload: { path: ['workOrderId'], equals: woId } },
    });
    expect(statusEvents.map((e) => (e.payload as unknown as WorkOrderStatusChangedPayload).to)).toContain('paid');
  });

  describe('nunca se cobra dos veces', () => {
    it('misma Idempotency-Key: responde lo mismo (replayed) sin otro pago, asiento ni payout', async () => {
      const ctx = await newShop();
      const { woId } = await invoicedWorkOrder(ctx);
      const k = key();
      const first = await charges.charge(ctx.shopId, woId, { method: 'card', idempotencyKey: k, accountId: ctx.ownerId });
      const again = await charges.charge(ctx.shopId, woId, { method: 'card', idempotencyKey: k, accountId: ctx.ownerId });

      expect(again).toMatchObject({ replayed: true, payment: { id: first.payment.id, commission_cents: '16992' }, payout: { id: first.payout!.id } });
      expect(await prisma.payment.count({ where: { work_order_id: woId } })).toBe(1);
      expect(await prisma.payout.count({ where: { shop_id: ctx.shopId } })).toBe(1);
    });

    it('misma key con otro método → 409; otra key sobre factura pagada → 409', async () => {
      const ctx = await newShop();
      const { woId } = await invoicedWorkOrder(ctx);
      const k = key();
      await charges.charge(ctx.shopId, woId, { method: 'card', idempotencyKey: k, accountId: ctx.ownerId });

      await expect(charges.charge(ctx.shopId, woId, { method: 'cash', idempotencyKey: k, accountId: ctx.ownerId })).rejects.toThrow(
        /reutilizada con un cobro distinto/,
      );
      await expect(charges.charge(ctx.shopId, woId, { method: 'card', idempotencyKey: key(), accountId: ctx.ownerId })).rejects.toThrow(
        /ya está pagada/,
      );
    });

    it('concurrencia: 5 cobros a la vez con keys distintas (doble toque) → la TARJETA se cobra UNA vez', async () => {
      const ctx = await newShop();
      const { woId } = await invoicedWorkOrder(ctx);
      // Cuenta las capturas en el PROCESADOR: la base podría tener un solo pago
      // "captured" y aun así haberle cobrado varias veces a la tarjeta.
      const cardnet = new CardnetProvider({ get: () => 'x' } as unknown as ConfigService);
      let captures = 0;
      const counting: PaymentProvider = Object.assign(Object.create(cardnet) as PaymentProvider, {
        capture: async (p: Parameters<PaymentProvider['capture']>[0]) => {
          captures++;
          await new Promise((r) => setTimeout(r, 50)); // latencia del procesador
          return cardnet.capture(p);
        },
      });
      const counted = chargesWith(counting);
      const results = await Promise.allSettled(
        Array.from({ length: 5 }, () => counted.charge(ctx.shopId, woId, { method: 'card', idempotencyKey: key(), accountId: ctx.ownerId })),
      );

      expect(captures).toBe(1);

      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      for (const r of results) if (r.status === 'rejected') expect(r.reason).toBeInstanceOf(ConflictException);
      expect(await prisma.payment.count({ where: { work_order_id: woId, status: 'captured' } })).toBe(1);
      expect(await prisma.payout.count({ where: { shop_id: ctx.shopId } })).toBe(1);
      expect(await prisma.ledgerEntry.count({ where: { external_ref: { startsWith: 'payment:' }, postings: { some: { account: { owner_id: ctx.shopId } } } } })).toBe(1);
    });

    it('concurrencia: la MISMA key dos veces a la vez → un solo pago', async () => {
      const ctx = await newShop();
      const { woId } = await invoicedWorkOrder(ctx);
      const k = key();
      await Promise.allSettled([
        charges.charge(ctx.shopId, woId, { method: 'card', idempotencyKey: k, accountId: ctx.ownerId }),
        charges.charge(ctx.shopId, woId, { method: 'card', idempotencyKey: k, accountId: ctx.ownerId }),
      ]);
      expect(await prisma.payment.count({ where: { work_order_id: woId } })).toBe(1);
      expect((await workOrders.get(ctx.shopId, woId)).status).toBe('paid');
    });
  });

  describe('efectivo / transferencia', () => {
    it('efectivo: factura y OT pagadas, SIN payout; la comisión queda como deuda del taller', async () => {
      const ctx = await newShop();
      const { woId } = await invoicedWorkOrder(ctx);
      const view = await charges.charge(ctx.shopId, woId, { method: 'cash', idempotencyKey: key(), accountId: ctx.ownerId });

      expect(view).toMatchObject({
        payment: { method: 'cash', status: 'captured', commission_cents: '16992', provider_ref: null },
        invoice: { status: 'paid' },
        work_order: { status: 'paid' },
        payout: null,
      });
      expect(await balanceOf(ctx.shopId, 'seller')).toBe(-16992n); // el taller le debe 169.92 a la plataforma
      const payment = await prisma.payment.findUniqueOrThrow({ where: { id: view.payment.id } });
      expect(payment.provider).toBe('offline');
    });

    it('la deuda del efectivo se DESCUENTA del siguiente payout con tarjeta', async () => {
      const ctx = await newShop();
      const cash = await invoicedWorkOrder(ctx); // comisión 169.92 → deuda
      await charges.charge(ctx.shopId, cash.woId, { method: 'transfer', idempotencyKey: key(), accountId: ctx.ownerId });
      const card = await invoicedWorkOrder(ctx); // neto 1,954.08
      const view = await charges.charge(ctx.shopId, card.woId, { method: 'card', idempotencyKey: key(), accountId: ctx.ownerId });

      expect(view.payout?.amount_cents).toBe((195408n - 16992n).toString()); // 1,784.16
      expect(await balanceOf(ctx.shopId, 'seller')).toBe(0n);
    });

    it('si la deuda supera al cobro con tarjeta, no hay payout (saldo <= 0)', async () => {
      const ctx = await newShop();
      for (let i = 0; i < 2; i++) {
        const big = await invoicedWorkOrder(ctx, '5000000'); // comisión 8% de 59,000 = 4,720 c/u
        await charges.charge(ctx.shopId, big.woId, { method: 'cash', idempotencyKey: key(), accountId: ctx.ownerId });
      }
      const small = await invoicedWorkOrder(ctx, '1000'); // neto ~10.86
      const view = await charges.charge(ctx.shopId, small.woId, { method: 'card', idempotencyKey: key(), accountId: ctx.ownerId });
      expect(view.payout).toBeNull();
      expect(await balanceOf(ctx.shopId, 'seller')).toBeLessThan(0n);
    });
  });

  it('tarjeta rechazada: 402, pago failed, factura y OT sin cambios; otra key después sí cobra', async () => {
    const ctx = await newShop();
    const { woId } = await invoicedWorkOrder(ctx);
    const declining = chargesWith({
      name: 'fake',
      createIntent: async () => ({ providerRef: 'ref-x', status: 'requires_action' }),
      capture: async () => ({ providerRef: 'ref-x', status: 'failed' }),
      refund: async () => ({ providerRef: 'ref-x', status: 'failed' }),
      verifyWebhookSignature: () => false,
    });

    const k = key();
    await expect(declining.charge(ctx.shopId, woId, { method: 'card', idempotencyKey: k, accountId: ctx.ownerId })).rejects.toMatchObject({
      status: HttpStatus.PAYMENT_REQUIRED,
    });
    expect((await prisma.payment.findUniqueOrThrow({ where: { idempotency_key: k } })).status).toBe('failed');
    expect((await workOrders.get(ctx.shopId, woId)).status).toBe('invoiced');
    expect(await balanceOf(ctx.shopId, 'seller')).toBe(0n);
    // Reintentar la MISMA key devuelve el mismo rechazo (no reintenta en silencio).
    await expect(declining.charge(ctx.shopId, woId, { method: 'card', idempotencyKey: k, accountId: ctx.ownerId })).rejects.toMatchObject({
      status: HttpStatus.PAYMENT_REQUIRED,
    });
    await expect(charges.charge(ctx.shopId, woId, { method: 'card', idempotencyKey: key(), accountId: ctx.ownerId })).resolves.toMatchObject({
      work_order: { status: 'paid' },
    });
  });

  it('OT sin facturar → 409; otro taller → 404', async () => {
    const a = await newShop();
    const b = await newShop();
    const { woId } = await invoicedWorkOrder(a);
    await expect(charges.charge(b.shopId, woId, { method: 'card', idempotencyKey: key(), accountId: b.ownerId })).rejects.toThrow(NotFoundException);

    const customer = await customers.create(a.shopId, { full_name: 'Sin factura' });
    const vehicle = await vehicles.create(a.shopId, { customer_id: customer.id, plate: `N${Date.now() % 1e6}`, make: 'Kia' });
    const draft = await workOrders.create(a.shopId, a.ownerId, { customer_id: customer.id, vehicle_id: vehicle.id, complaint: 'x y z' });
    await expect(charges.charge(a.shopId, draft.id, { method: 'card', idempotencyKey: key(), accountId: a.ownerId })).rejects.toThrow(
      /antes de cobrarla/,
    );
  });

  it('reconciliación global del ledger: SUM(todos los postings) = 0', async () => {
    const { _sum } = await prisma.ledgerPosting.aggregate({ _sum: { amount_cents: true } });
    expect((_sum.amount_cents ?? 0n).toString()).toBe('0');
  });
});
