-- Shops (Día 4): membresía y roles dentro del taller (base del aislamiento multi-tenant).
-- Generado con `prisma migrate diff` y EDITADO a mano: se quitaron el DROP del
-- índice NULLS NOT DISTINCT de ledger_accounts y el cambio citext→TEXT de
-- accounts.email (drift conocido que Prisma no modela; NO deben aplicarse).

-- CreateEnum
CREATE TYPE "ShopMemberRole" AS ENUM ('owner', 'mechanic', 'advisor');

-- CreateEnum
CREATE TYPE "ShopMemberStatus" AS ENUM ('invited', 'active');

-- CreateTable
CREATE TABLE "shop_members" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "account_id" UUID,
    "invited_email" TEXT,
    "role" "ShopMemberRole" NOT NULL,
    "status" "ShopMemberStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "shop_members_pkey" PRIMARY KEY ("id"),
    -- Una fila identifica a alguien: por cuenta o por email invitado.
    CONSTRAINT "shop_members_identity_check" CHECK ("account_id" IS NOT NULL OR "invited_email" IS NOT NULL),
    -- Un miembro activo siempre tiene cuenta (solo las invitaciones no).
    CONSTRAINT "shop_members_active_has_account_check" CHECK ("status" <> 'active' OR "account_id" IS NOT NULL),
    -- Emails normalizados: el UNIQUE (shop_id, invited_email) no se burla con mayúsculas.
    CONSTRAINT "shop_members_invited_email_lower_check" CHECK ("invited_email" = lower("invited_email"))
);

-- CreateIndex
CREATE INDEX "shop_members_account_id_idx" ON "shop_members"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "shop_members_shop_id_account_id_key" ON "shop_members"("shop_id", "account_id");

-- CreateIndex
CREATE UNIQUE INDEX "shop_members_shop_id_invited_email_key" ON "shop_members"("shop_id", "invited_email");

-- AddForeignKey
ALTER TABLE "shop_members" ADD CONSTRAINT "shop_members_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_members" ADD CONSTRAINT "shop_members_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill: el dueño de cada taller existente pasa a ser miembro `owner`
-- (sin esto perdería el acceso al activarse el ShopAccessGuard). uuidv7() es
-- nativo desde Postgres 18 (Neon, CI y tests corren 18).
INSERT INTO "shop_members" ("id", "shop_id", "account_id", "role", "status", "updated_at")
SELECT uuidv7(), s."id", s."owner_id", 'owner', 'active', CURRENT_TIMESTAMP
FROM "shops" s
ON CONFLICT ("shop_id", "account_id") DO NOTHING;
