-- Ítems de la OT (Día 5.2): mano de obra y piezas, con ITBIS por línea.
-- Escrita a mano (mismo resultado que `prisma migrate diff`, sin el drift
-- conocido de ledger_accounts/accounts.email) + CHECKs de aritmética del dinero.

-- CreateEnum
CREATE TYPE "WorkOrderItemType" AS ENUM ('labor', 'part');

-- Destino de la FK compuesta: (id, shop_id) de work_orders.
CREATE UNIQUE INDEX "work_orders_id_shop_id_key" ON "work_orders"("id", "shop_id");

-- CreateTable
CREATE TABLE "work_order_items" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "work_order_id" UUID NOT NULL,
    "type" "WorkOrderItemType" NOT NULL,
    "description" TEXT NOT NULL,
    "part_number" TEXT,
    "quantity_milli" INTEGER NOT NULL,
    "unit_price_cents" BIGINT NOT NULL,
    "tax_rate_bps" INTEGER NOT NULL DEFAULT 1800,
    "subtotal_cents" BIGINT NOT NULL,
    "tax_cents" BIGINT NOT NULL,
    "total_cents" BIGINT NOT NULL,
    "marketplace_order_item_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "work_order_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "work_order_items_description_check" CHECK (length(btrim("description")) > 0),
    -- Cantidad en milésimas (1.5 = 1500), positiva y con tope razonable.
    CONSTRAINT "work_order_items_quantity_check" CHECK ("quantity_milli" > 0 AND "quantity_milli" <= 100000000),
    CONSTRAINT "work_order_items_price_check" CHECK ("unit_price_cents" >= 0),
    CONSTRAINT "work_order_items_tax_rate_check" CHECK ("tax_rate_bps" BETWEEN 0 AND 10000),
    -- Aritmética del dinero EN LA DB (half-up; round() de numeric redondea
    -- alejándose de cero, que para montos >= 0 es half-up):
    CONSTRAINT "work_order_items_subtotal_check" CHECK ("subtotal_cents" = round("quantity_milli"::numeric * "unit_price_cents" / 1000)),
    CONSTRAINT "work_order_items_tax_check" CHECK ("tax_cents" = round("subtotal_cents"::numeric * "tax_rate_bps" / 10000)),
    CONSTRAINT "work_order_items_total_check" CHECK ("total_cents" = "subtotal_cents" + "tax_cents")
);

-- CreateIndex
CREATE INDEX "work_order_items_work_order_id_idx" ON "work_order_items"("work_order_id");

-- AddForeignKey: el ítem es de una OT del MISMO taller. Borrar la OT borra sus ítems.
ALTER TABLE "work_order_items" ADD CONSTRAINT "work_order_items_work_order_id_shop_id_fkey" FOREIGN KEY ("work_order_id", "shop_id") REFERENCES "work_orders"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
