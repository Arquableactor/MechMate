-- Cobro de OT (Día 7): método de pago (tarjeta/efectivo/transferencia), vínculo
-- con taller/OT/factura/cliente, y trazabilidad del payout.
-- Escrita a mano (mismo resultado que `prisma migrate diff`, sin el drift
-- conocido de ledger_accounts/accounts.email) + CHECKs de coherencia.

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('card', 'cash', 'transfer');

-- AlterEnum: efectivo/transferencia no pasan por un procesador.
ALTER TYPE "PaymentProvider" ADD VALUE 'offline';

-- AlterTable
ALTER TABLE "payments"
    ADD COLUMN "shop_id" UUID,
    ADD COLUMN "work_order_id" UUID,
    ADD COLUMN "invoice_id" UUID,
    ADD COLUMN "payer_customer_id" UUID,
    ADD COLUMN "method" "PaymentMethod" NOT NULL DEFAULT 'card',
    -- Un pago de factura siempre sabe de qué taller y OT es.
    ADD CONSTRAINT "payments_invoice_context_check" CHECK ("invoice_id" IS NULL OR ("shop_id" IS NOT NULL AND "work_order_id" IS NOT NULL));

-- CreateIndex
CREATE INDEX "payments_invoice_id_idx" ON "payments"("invoice_id");

-- AlterTable
ALTER TABLE "payouts" ADD COLUMN "source_payment_id" UUID;

