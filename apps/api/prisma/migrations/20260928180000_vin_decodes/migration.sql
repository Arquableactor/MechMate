-- VIN (Día 4): caché global de VINs decodificados (datos públicos, no tenant).
-- Generado con `prisma migrate diff` y EDITADO a mano: se quitaron el DROP del
-- índice NULLS NOT DISTINCT de ledger_accounts y el cambio citext→TEXT de
-- accounts.email (drift conocido que Prisma no modela; NO deben aplicarse).

-- CreateTable
CREATE TABLE "vin_decodes" (
    "id" UUID NOT NULL,
    "vin" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT,
    "year" INTEGER,
    "trim" TEXT,
    "engine" TEXT,
    "fuel_type" TEXT,
    "body_class" TEXT,
    "drive_type" TEXT,
    "transmission" TEXT,
    "provider_warnings" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "raw" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "vin_decodes_pkey" PRIMARY KEY ("id"),
    -- Solo VINs normalizados y con formato válido (17, sin I/O/Q).
    CONSTRAINT "vin_decodes_vin_format_check" CHECK ("vin" ~ '^[A-HJ-NPR-Z0-9]{17}$')
);

-- CreateIndex
CREATE UNIQUE INDEX "vin_decodes_vin_key" ON "vin_decodes"("vin");
