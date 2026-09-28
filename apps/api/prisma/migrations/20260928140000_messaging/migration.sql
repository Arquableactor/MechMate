-- Messaging (Día 3): registro auditable de mensajes salientes.
-- Generado con `prisma migrate diff` y EDITADO a mano: se quitaron el DROP del
-- índice NULLS NOT DISTINCT de ledger_accounts y el cambio citext→TEXT de
-- accounts.email (drift conocido que Prisma no modela; NO deben aplicarse).

-- CreateEnum
CREATE TYPE "MessageChannel" AS ENUM ('email', 'push', 'whatsapp');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('queued', 'sent', 'failed');

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "account_id" UUID,
    "channel" "MessageChannel" NOT NULL,
    "recipient" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "status" "MessageStatus" NOT NULL DEFAULT 'queued',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "provider_ref" TEXT,
    "dedupe_key" TEXT NOT NULL,
    "sent_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "messages_dedupe_key_key" ON "messages"("dedupe_key");

-- CreateIndex
CREATE INDEX "messages_account_id_idx" ON "messages"("account_id");

-- CreateIndex
CREATE INDEX "messages_status_idx" ON "messages"("status");
