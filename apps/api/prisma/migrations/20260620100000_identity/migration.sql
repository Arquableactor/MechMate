-- Identity (Día 2): cuentas vinculadas a Auth0 por `auth0_sub`, multi-rol, shops.
-- `email` se materializa como citext (unique case-insensitive a nivel de columna).

-- Extensions
CREATE EXTENSION IF NOT EXISTS "citext";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('mechanic', 'seller', 'customer', 'courier', 'admin');

-- CreateEnum
CREATE TYPE "ShopType" AS ENUM ('mechanic_shop', 'parts_seller');

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL,
    "auth0_sub" TEXT NOT NULL,
    "email" CITEXT,
    "phone" TEXT,
    "full_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "kyc_status" TEXT NOT NULL DEFAULT 'none',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_roles" (
    "account_id" UUID NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "account_roles_pkey" PRIMARY KEY ("account_id", "role")
);

-- CreateTable
CREATE TABLE "shops" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "type" "ShopType" NOT NULL,
    "name" TEXT NOT NULL,
    "commission_bps" INTEGER NOT NULL DEFAULT 800,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_auth0_sub_key" ON "accounts"("auth0_sub");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_phone_key" ON "accounts"("phone");

-- AddForeignKey
ALTER TABLE "account_roles" ADD CONSTRAINT "account_roles_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
