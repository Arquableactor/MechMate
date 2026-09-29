-- DVI (Día 6): inspección, hallazgos y fotos (metadatos; los archivos viven en R2).
-- Generado con `prisma migrate diff` y EDITADO a mano: sin el drift conocido de
-- ledger_accounts/accounts.email, y con CHECKs (tipo/tamaño de foto, coherencia
-- de estado, y que la clave en R2 quede bajo la carpeta del propio taller).

-- CreateEnum
CREATE TYPE "FindingSeverity" AS ENUM ('ok', 'attention', 'urgent');

-- CreateEnum
CREATE TYPE "PhotoStatus" AS ENUM ('pending', 'uploaded');

-- CreateTable
CREATE TABLE "inspections" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "work_order_id" UUID NOT NULL,
    "notes" TEXT,
    "created_by_account_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_findings" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "inspection_id" UUID NOT NULL,
    "area" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" "FindingSeverity" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "inspection_findings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "inspection_findings_area_check" CHECK (length(btrim("area")) > 0),
    CONSTRAINT "inspection_findings_title_check" CHECK (length(btrim("title")) > 0)
);

-- CreateTable
CREATE TABLE "inspection_photos" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "finding_id" UUID NOT NULL,
    "storage_key" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "status" "PhotoStatus" NOT NULL DEFAULT 'pending',
    "uploaded_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "inspection_photos_pkey" PRIMARY KEY ("id"),
    -- Solo imágenes, hasta 10 MB.
    CONSTRAINT "inspection_photos_content_type_check" CHECK ("content_type" IN ('image/jpeg', 'image/png', 'image/webp', 'image/heic')),
    CONSTRAINT "inspection_photos_size_check" CHECK ("size_bytes" BETWEEN 1 AND 10485760),
    -- La clave en R2 SIEMPRE cae bajo la carpeta de su taller: una foto no puede apuntar a otro.
    CONSTRAINT "inspection_photos_key_tenant_check" CHECK ("storage_key" LIKE 'shops/' || "shop_id"::text || '/%'),
    CONSTRAINT "inspection_photos_uploaded_at_check" CHECK (("status" = 'uploaded') = ("uploaded_at" IS NOT NULL))
);

-- CreateIndex
CREATE UNIQUE INDEX "inspections_work_order_id_shop_id_key" ON "inspections"("work_order_id", "shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "inspections_id_shop_id_key" ON "inspections"("id", "shop_id");

-- CreateIndex
CREATE INDEX "inspection_findings_inspection_id_idx" ON "inspection_findings"("inspection_id");

-- CreateIndex
CREATE UNIQUE INDEX "inspection_findings_id_shop_id_key" ON "inspection_findings"("id", "shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "inspection_photos_storage_key_key" ON "inspection_photos"("storage_key");

-- CreateIndex
CREATE INDEX "inspection_photos_finding_id_idx" ON "inspection_photos"("finding_id");

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_work_order_id_shop_id_fkey" FOREIGN KEY ("work_order_id", "shop_id") REFERENCES "work_orders"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_findings" ADD CONSTRAINT "inspection_findings_inspection_id_shop_id_fkey" FOREIGN KEY ("inspection_id", "shop_id") REFERENCES "inspections"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_photos" ADD CONSTRAINT "inspection_photos_finding_id_shop_id_fkey" FOREIGN KEY ("finding_id", "shop_id") REFERENCES "inspection_findings"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
