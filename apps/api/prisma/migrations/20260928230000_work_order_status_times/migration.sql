-- Momentos de cada transición de la OT (Día 5.3): historial y métricas.
ALTER TABLE "work_orders"
    ADD COLUMN "started_at" TIMESTAMPTZ(6),
    ADD COLUMN "completed_at" TIMESTAMPTZ(6),
    ADD COLUMN "cancelled_at" TIMESTAMPTZ(6),
    ADD COLUMN "cancellation_reason" TEXT,
    -- Coherencia estado ↔ fechas: una OT completada tiene completed_at, una
    -- cancelada tiene cancelled_at (y nunca las dos).
    ADD CONSTRAINT "work_orders_completed_at_check" CHECK ("status" NOT IN ('completed', 'invoiced', 'paid') OR "completed_at" IS NOT NULL),
    ADD CONSTRAINT "work_orders_cancelled_at_check" CHECK (("status" = 'cancelled') = ("cancelled_at" IS NOT NULL));
