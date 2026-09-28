-- Órdenes de trabajo (Día 5). Multi-tenant por shop_id.
-- Generado con `prisma migrate diff` y EDITADO a mano: se quitaron el DROP del
-- índice NULLS NOT DISTINCT de ledger_accounts y el cambio citext→TEXT de
-- accounts.email (drift conocido que Prisma no modela; NO deben aplicarse).

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('draft', 'awaiting_approval', 'approved', 'in_progress', 'completed', 'invoiced', 'paid', 'cancelled');

-- CreateTable: contadores por taller (numeración de OT).
CREATE TABLE "shop_sequences" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "shop_sequences_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "shop_sequences_value_check" CHECK ("value" > 0)
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "customer_id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'draft',
    "complaint" TEXT NOT NULL,
    "notes" TEXT,
    "mileage_in" INTEGER,
    "assigned_member_id" UUID,
    "promised_at" TIMESTAMPTZ(6),
    "currency" TEXT NOT NULL DEFAULT 'DOP',
    "subtotal_cents" BIGINT NOT NULL DEFAULT 0,
    "tax_cents" BIGINT NOT NULL DEFAULT 0,
    "total_cents" BIGINT NOT NULL DEFAULT 0,
    "created_by_account_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "work_orders_number_check" CHECK ("number" > 0),
    CONSTRAINT "work_orders_complaint_check" CHECK (length(btrim("complaint")) > 0),
    CONSTRAINT "work_orders_mileage_check" CHECK ("mileage_in" >= 0),
    CONSTRAINT "work_orders_currency_check" CHECK ("currency" ~ '^[A-Z]{3}$'),
    -- Totales en centavos: nunca negativos y siempre cuadran (total = subtotal + ITBIS).
    CONSTRAINT "work_orders_totals_check" CHECK ("subtotal_cents" >= 0 AND "tax_cents" >= 0 AND "total_cents" = "subtotal_cents" + "tax_cents")
);

-- CreateIndex
CREATE UNIQUE INDEX "shop_sequences_shop_id_name_key" ON "shop_sequences"("shop_id", "name");

-- CreateIndex
CREATE INDEX "work_orders_shop_id_status_idx" ON "work_orders"("shop_id", "status");

-- CreateIndex
CREATE INDEX "work_orders_shop_id_customer_id_idx" ON "work_orders"("shop_id", "customer_id");

-- CreateIndex
CREATE INDEX "work_orders_shop_id_vehicle_id_idx" ON "work_orders"("shop_id", "vehicle_id");

-- CreateIndex
CREATE UNIQUE INDEX "work_orders_shop_id_number_key" ON "work_orders"("shop_id", "number");

-- Destino de la FK compuesta: (id, shop_id) de vehicles.
CREATE UNIQUE INDEX "vehicles_id_shop_id_key" ON "vehicles"("id", "shop_id");

-- AddForeignKey
ALTER TABLE "shop_sequences" ADD CONSTRAINT "shop_sequences_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: cliente y vehículo del MISMO taller (imposible cruzar tenants en la DB).
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_customer_id_shop_id_fkey" FOREIGN KEY ("customer_id", "shop_id") REFERENCES "customers"("id", "shop_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_vehicle_id_shop_id_fkey" FOREIGN KEY ("vehicle_id", "shop_id") REFERENCES "vehicles"("id", "shop_id") ON DELETE RESTRICT ON UPDATE CASCADE;
