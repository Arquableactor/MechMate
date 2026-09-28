-- Clientes del taller (Día 4). Multi-tenant por shop_id.
-- Generado con `prisma migrate diff` y EDITADO a mano: se quitaron el DROP del
-- índice NULLS NOT DISTINCT de ledger_accounts y el cambio citext→TEXT de
-- accounts.email (drift conocido que Prisma no modela; NO deben aplicarse).
-- Los CHECK garantizan EN LA DB el formato normalizado: así los UNIQUE por
-- taller detectan al mismo cliente aunque lo escriban distinto.

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "document_id" TEXT,
    "account_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "customers_full_name_check" CHECK (length(btrim("full_name")) > 0),
    -- E.164: +<código de país><número>, p. ej. +18095551234.
    CONSTRAINT "customers_phone_e164_check" CHECK ("phone" ~ '^\+[1-9][0-9]{7,14}$'),
    -- Cédula dominicana: 11 dígitos sin guiones.
    CONSTRAINT "customers_document_id_check" CHECK ("document_id" ~ '^[0-9]{11}$'),
    CONSTRAINT "customers_email_lower_check" CHECK ("email" = lower("email"))
);

-- CreateIndex
CREATE INDEX "customers_shop_id_created_at_idx" ON "customers"("shop_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "customers_shop_id_phone_key" ON "customers"("shop_id", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "customers_shop_id_document_id_key" ON "customers"("shop_id", "document_id");

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
