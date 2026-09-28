-- Vehículos del taller (Día 4). Multi-tenant por shop_id.
-- Generado con `prisma migrate diff` y EDITADO a mano: se quitaron el DROP del
-- índice NULLS NOT DISTINCT de ledger_accounts y el cambio citext→TEXT de
-- accounts.email (drift conocido que Prisma no modela; NO deben aplicarse).

-- CreateEnum
CREATE TYPE "VehicleDataSource" AS ENUM ('vin_decode', 'manual');

-- Destino de la FK compuesta: (id, shop_id) de customers.
CREATE UNIQUE INDEX "customers_id_shop_id_key" ON "customers"("id", "shop_id");

-- CreateTable
CREATE TABLE "vehicles" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "vin" TEXT,
    "chassis_number" TEXT,
    "plate" TEXT,
    "make" TEXT NOT NULL,
    "model" TEXT,
    "year" INTEGER,
    "trim" TEXT,
    "engine" TEXT,
    "fuel_type" TEXT,
    "color" TEXT,
    "mileage_km" INTEGER,
    "data_source" "VehicleDataSource" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id"),
    -- Al menos un identificador: VIN, chasis (importados de Japón) o placa.
    CONSTRAINT "vehicles_identifier_check" CHECK ("vin" IS NOT NULL OR "chassis_number" IS NOT NULL OR "plate" IS NOT NULL),
    -- Formatos normalizados: así los UNIQUE por taller detectan duplicados.
    CONSTRAINT "vehicles_vin_format_check" CHECK ("vin" ~ '^[A-HJ-NPR-Z0-9]{17}$'),
    CONSTRAINT "vehicles_chassis_format_check" CHECK ("chassis_number" ~ '^[A-Z0-9-]{5,25}$'),
    CONSTRAINT "vehicles_plate_format_check" CHECK ("plate" ~ '^[A-Z0-9]{4,10}$'),
    CONSTRAINT "vehicles_make_check" CHECK (length(btrim("make")) > 0),
    CONSTRAINT "vehicles_year_check" CHECK ("year" BETWEEN 1900 AND 2100),
    CONSTRAINT "vehicles_mileage_check" CHECK ("mileage_km" >= 0)
);

-- CreateIndex
CREATE INDEX "vehicles_shop_id_customer_id_idx" ON "vehicles"("shop_id", "customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_shop_id_vin_key" ON "vehicles"("shop_id", "vin");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_shop_id_chassis_number_key" ON "vehicles"("shop_id", "chassis_number");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_shop_id_plate_key" ON "vehicles"("shop_id", "plate");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: el cliente debe ser del MISMO taller (imposible cruzar tenants en la DB).
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_customer_id_shop_id_fkey" FOREIGN KEY ("customer_id", "shop_id") REFERENCES "customers"("id", "shop_id") ON DELETE RESTRICT ON UPDATE CASCADE;
