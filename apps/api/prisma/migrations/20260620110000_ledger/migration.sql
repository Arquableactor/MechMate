-- Payments + Ledger de doble entrada (Día 3).
-- Las invariantes contables se materializan como triggers en SQL crudo (Prisma no
-- los modela). El ledger es append-only: correcciones por asiento de reversa.

-- CreateEnum
CREATE TYPE "LedgerOwnerType" AS ENUM ('platform', 'seller', 'buyer', 'courier', 'tax');

-- CreateEnum
CREATE TYPE "LedgerAccountKind" AS ENUM ('escrow_pending', 'available', 'commission_revenue', 'tax_payable', 'clearing');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('cardnet');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('requires_action', 'captured', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('scheduled', 'paid', 'failed');

-- CreateTable
CREATE TABLE "ledger_accounts" (
    "id" UUID NOT NULL,
    "owner_type" "LedgerOwnerType" NOT NULL,
    "owner_id" UUID,
    "kind" "LedgerAccountKind" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'DOP',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ledger_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" UUID NOT NULL,
    "external_ref" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_postings" (
    "id" UUID NOT NULL,
    "entry_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "amount_cents" BIGINT NOT NULL,
    "currency" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "order_id" UUID,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'cardnet',
    "provider_ref" TEXT,
    "amount_cents" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'DOP',
    "status" "PaymentStatus" NOT NULL DEFAULT 'requires_action',
    "idempotency_key" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "amount_cents" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'DOP',
    "status" "PayoutStatus" NOT NULL DEFAULT 'scheduled',
    "scheduled_for" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox" (
    "id" UUID NOT NULL,
    "topic" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ledger_postings_account_id_idx" ON "ledger_postings"("account_id");

-- CreateIndex
CREATE INDEX "ledger_postings_entry_id_idx" ON "ledger_postings"("entry_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_idempotency_key_key" ON "payments"("idempotency_key");

-- CreateIndex
CREATE INDEX "outbox_published_at_idx" ON "outbox"("published_at");

-- AddForeignKey
ALTER TABLE "ledger_postings" ADD CONSTRAINT "ledger_postings_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "ledger_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_postings" ADD CONSTRAINT "ledger_postings_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "ledger_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =====================================================================
-- SQL crudo (no modelado por Prisma) — el corazón auditable del ledger.
-- =====================================================================

-- Unicidad de cuenta contable por (owner_type, owner_id, kind, currency).
-- NULLS NOT DISTINCT (PG15+) ⇒ las cuentas singleton platform/tax (owner_id NULL)
-- también se deduplican. Prisma no modela este modificador: drift esperado.
CREATE UNIQUE INDEX "ledger_accounts_owner_kind_currency_key"
  ON "ledger_accounts" ("owner_type", "owner_id", "kind", "currency") NULLS NOT DISTINCT;

-- Cuentas singleton de la plataforma/impuestos (owner_id NULL). UUIDs fijos:
-- la app las referencia por estas constantes (ver common/ledger-accounts.constants.ts).
INSERT INTO "ledger_accounts" ("id", "owner_type", "owner_id", "kind", "currency", "created_at", "updated_at")
VALUES
  ('00000000-0000-7000-8000-000000000001', 'platform', NULL, 'commission_revenue', 'DOP', now(), now()),
  ('00000000-0000-7000-8000-000000000002', 'platform', NULL, 'clearing',           'DOP', now(), now()),
  ('00000000-0000-7000-8000-000000000003', 'tax',      NULL, 'tax_payable',         'DOP', now(), now())
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------
-- Invariante de doble entrada: por entry_id, COUNT(*)>=2, SUM=0, una sola moneda.
-- CONSTRAINT TRIGGER DEFERRED ⇒ se valida al COMMIT, permitiendo insertar las N
-- líneas del asiento dentro de la tx antes del chequeo. Doble cobertura:
--   - trigger sobre ledger_entries  ⇒ atrapa asientos de 0/1 línea.
--   - trigger sobre ledger_postings ⇒ atrapa append a un asiento ya existente.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ledger_check_entry_balance() RETURNS trigger AS $$
DECLARE
  v_entry_id   uuid;
  v_count      integer;
  v_sum        bigint;
  v_currencies integer;
BEGIN
  IF TG_TABLE_NAME = 'ledger_entries' THEN
    v_entry_id := NEW.id;
  ELSE
    v_entry_id := NEW.entry_id;
  END IF;

  SELECT COUNT(*), COALESCE(SUM(amount_cents), 0), COUNT(DISTINCT currency)
    INTO v_count, v_sum, v_currencies
    FROM ledger_postings
   WHERE entry_id = v_entry_id;

  IF v_count < 2 THEN
    RAISE EXCEPTION 'Ledger entry % inválido: requiere >= 2 postings, tiene %', v_entry_id, v_count
      USING ERRCODE = 'P0001';
  END IF;
  IF v_sum <> 0 THEN
    RAISE EXCEPTION 'Ledger entry % desbalanceado: SUM(amount_cents) = %', v_entry_id, v_sum
      USING ERRCODE = 'P0001';
  END IF;
  IF v_currencies > 1 THEN
    RAISE EXCEPTION 'Ledger entry % con múltiples monedas (% distintas)', v_entry_id, v_currencies
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER ledger_entries_balance_check
  AFTER INSERT ON ledger_entries
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION ledger_check_entry_balance();

CREATE CONSTRAINT TRIGGER ledger_postings_balance_check
  AFTER INSERT ON ledger_postings
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION ledger_check_entry_balance();

-- ---------------------------------------------------------------------
-- Inmutabilidad: ni UPDATE/DELETE ni TRUNCATE sobre entries/postings.
-- Las reversas son INSERT de un asiento nuevo ⇒ NO se bloquean.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ledger_forbid_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Ledger append-only: % sobre % no está permitido (corrige por asiento de reversa)', TG_OP, TG_TABLE_NAME
    USING ERRCODE = 'P0001';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ledger_entries_immutable
  BEFORE UPDATE OR DELETE ON ledger_entries
  FOR EACH ROW EXECUTE FUNCTION ledger_forbid_mutation();

CREATE TRIGGER ledger_postings_immutable
  BEFORE UPDATE OR DELETE ON ledger_postings
  FOR EACH ROW EXECUTE FUNCTION ledger_forbid_mutation();

CREATE TRIGGER ledger_entries_no_truncate
  BEFORE TRUNCATE ON ledger_entries
  FOR EACH STATEMENT EXECUTE FUNCTION ledger_forbid_mutation();

CREATE TRIGGER ledger_postings_no_truncate
  BEFORE TRUNCATE ON ledger_postings
  FOR EACH STATEMENT EXECUTE FUNCTION ledger_forbid_mutation();
