-- Facturación (Día 7): factura = snapshot INMUTABLE de la OT.
-- Generado con `prisma migrate diff` y EDITADO a mano: sin el drift conocido de
-- ledger_accounts/accounts.email, con CHECKs y con triggers de inmutabilidad y
-- de cuadre (mismas garantías que el ledger: lo primero que se audita).

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('issued', 'paid', 'voided');

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "work_order_id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "ncf" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'issued',
    "shop_name" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_document_id" TEXT,
    "vehicle_description" TEXT NOT NULL,
    "work_order_number" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "subtotal_cents" BIGINT NOT NULL,
    "tax_cents" BIGINT NOT NULL,
    "total_cents" BIGINT NOT NULL,
    "issued_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMPTZ(6),
    "issued_by_account_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "invoices_number_check" CHECK ("number" > 0 AND "work_order_number" > 0),
    CONSTRAINT "invoices_currency_check" CHECK ("currency" ~ '^[A-Z]{3}$'),
    CONSTRAINT "invoices_totals_check" CHECK ("subtotal_cents" >= 0 AND "tax_cents" >= 0 AND "total_cents" = "subtotal_cents" + "tax_cents"),
    -- NCF de la DGII: tradicional (B01 + 8 dígitos) o electrónico e-CF (E31 + 10 dígitos).,
    CONSTRAINT "invoices_ncf_format_check" CHECK ("ncf" ~ '^(B[0-9]{10}|E[0-9]{12})$'),
    CONSTRAINT "invoices_paid_at_check" CHECK (("status" = 'paid') = ("paid_at" IS NOT NULL))
);

-- CreateTable
CREATE TABLE "invoice_lines" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "type" "WorkOrderItemType" NOT NULL,
    "description" TEXT NOT NULL,
    "part_number" TEXT,
    "quantity_milli" INTEGER NOT NULL,
    "unit_price_cents" BIGINT NOT NULL,
    "tax_rate_bps" INTEGER NOT NULL,
    "subtotal_cents" BIGINT NOT NULL,
    "tax_cents" BIGINT NOT NULL,
    "total_cents" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_lines_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "invoice_lines_position_check" CHECK ("position" > 0),
    CONSTRAINT "invoice_lines_quantity_check" CHECK ("quantity_milli" > 0),
    CONSTRAINT "invoice_lines_money_check" CHECK ("unit_price_cents" >= 0 AND "tax_rate_bps" BETWEEN 0 AND 10000),
    -- Misma aritmética que work_order_items (half-up por línea).,
    CONSTRAINT "invoice_lines_subtotal_check" CHECK ("subtotal_cents" = round("quantity_milli"::numeric * "unit_price_cents" / 1000)),
    CONSTRAINT "invoice_lines_tax_check" CHECK ("tax_cents" = round("subtotal_cents"::numeric * "tax_rate_bps" / 10000)),
    CONSTRAINT "invoice_lines_total_check" CHECK ("total_cents" = "subtotal_cents" + "tax_cents")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoices_work_order_id_shop_id_key" ON "invoices"("work_order_id", "shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_shop_id_number_key" ON "invoices"("shop_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_id_shop_id_key" ON "invoices"("id", "shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_lines_invoice_id_position_key" ON "invoice_lines"("invoice_id", "position");

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_work_order_id_shop_id_fkey" FOREIGN KEY ("work_order_id", "shop_id") REFERENCES "work_orders"("id", "shop_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_invoice_id_shop_id_fkey" FOREIGN KEY ("invoice_id", "shop_id") REFERENCES "invoices"("id", "shop_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- === Inmutabilidad ===

-- Líneas de factura: append-only. Nada de UPDATE/DELETE/TRUNCATE.
CREATE OR REPLACE FUNCTION invoice_lines_forbid_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Factura inmutable: % sobre invoice_lines no está permitido (se anula con nota de crédito)', TG_OP
    USING ERRCODE = 'restrict_violation';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoice_lines_immutable
  BEFORE UPDATE OR DELETE ON "invoice_lines"
  FOR EACH ROW EXECUTE FUNCTION invoice_lines_forbid_mutation();

CREATE TRIGGER invoice_lines_no_truncate
  BEFORE TRUNCATE ON "invoice_lines"
  FOR EACH STATEMENT EXECUTE FUNCTION invoice_lines_forbid_mutation();

-- Cabecera: solo cambian status (issued → paid | voided), paid_at con él, y el
-- NCF UNA vez (de NULL a un valor). Todo lo demás (dinero, identidad, snapshot)
-- queda congelado. No se borra.
CREATE OR REPLACE FUNCTION invoices_guard() RETURNS trigger AS $$
BEGIN
  IF TG_OP IN ('DELETE', 'TRUNCATE') THEN
    RAISE EXCEPTION 'Factura inmutable: % sobre invoices no está permitido (se anula con status voided)', TG_OP
      USING ERRCODE = 'restrict_violation';
  END IF;
  IF (NEW.id, NEW.shop_id, NEW.work_order_id, NEW.number, NEW.shop_name, NEW.customer_name,
      NEW.customer_document_id, NEW.vehicle_description, NEW.work_order_number, NEW.currency,
      NEW.subtotal_cents, NEW.tax_cents, NEW.total_cents, NEW.issued_at, NEW.issued_by_account_id, NEW.created_at)
     IS DISTINCT FROM
     (OLD.id, OLD.shop_id, OLD.work_order_id, OLD.number, OLD.shop_name, OLD.customer_name,
      OLD.customer_document_id, OLD.vehicle_description, OLD.work_order_number, OLD.currency,
      OLD.subtotal_cents, OLD.tax_cents, OLD.total_cents, OLD.issued_at, OLD.issued_by_account_id, OLD.created_at) THEN
    RAISE EXCEPTION 'Factura % inmutable: solo pueden cambiar el estado y el NCF', OLD.number
      USING ERRCODE = 'restrict_violation';
  END IF;
  IF OLD.ncf IS NOT NULL AND NEW.ncf IS DISTINCT FROM OLD.ncf THEN
    RAISE EXCEPTION 'Factura %: el NCF ya asignado no se cambia', OLD.number USING ERRCODE = 'restrict_violation';
  END IF;
  IF NEW.status <> OLD.status AND NOT (OLD.status = 'issued' AND NEW.status IN ('paid', 'voided')) THEN
    RAISE EXCEPTION 'Factura %: transición de estado inválida % → %', OLD.number, OLD.status, NEW.status
      USING ERRCODE = 'restrict_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoices_immutable
  BEFORE UPDATE OR DELETE ON "invoices"
  FOR EACH ROW EXECUTE FUNCTION invoices_guard();

CREATE TRIGGER invoices_no_truncate
  BEFORE TRUNCATE ON "invoices"
  FOR EACH STATEMENT EXECUTE FUNCTION invoices_guard();

-- === Cuadre: SUM(líneas) = totales de la factura, verificado al COMMIT ===
-- (diferido: la cabecera y sus líneas se insertan en la misma tx). Una factura
-- sin líneas tampoco pasa.
CREATE OR REPLACE FUNCTION invoices_check_totals() RETURNS trigger AS $$
DECLARE
  v_invoice_id uuid;
  v_sub bigint; v_tax bigint; v_lines int;
  v_inv record;
BEGIN
  -- IF (no CASE): PL/pgSQL compila las dos ramas de un CASE y NEW.invoice_id
  -- no existe cuando el trigger corre sobre invoices.
  IF TG_TABLE_NAME = 'invoices' THEN
    v_invoice_id := NEW.id;
  ELSE
    v_invoice_id := NEW.invoice_id;
  END IF;
  SELECT subtotal_cents, tax_cents, number INTO v_inv FROM invoices WHERE id = v_invoice_id;
  SELECT COALESCE(SUM(subtotal_cents), 0), COALESCE(SUM(tax_cents), 0), COUNT(*)
    INTO v_sub, v_tax, v_lines FROM invoice_lines WHERE invoice_id = v_invoice_id;
  IF v_lines = 0 THEN
    RAISE EXCEPTION 'Factura % sin líneas', v_inv.number USING ERRCODE = 'check_violation';
  END IF;
  IF v_sub <> v_inv.subtotal_cents OR v_tax <> v_inv.tax_cents THEN
    RAISE EXCEPTION 'Factura % descuadrada: líneas % + %, cabecera % + %', v_inv.number, v_sub, v_tax, v_inv.subtotal_cents, v_inv.tax_cents
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER invoices_totals_balance_check
  AFTER INSERT ON "invoices"
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION invoices_check_totals();

CREATE CONSTRAINT TRIGGER invoice_lines_totals_balance_check
  AFTER INSERT ON "invoice_lines"
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION invoices_check_totals();
