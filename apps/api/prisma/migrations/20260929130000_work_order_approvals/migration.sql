-- Aprobación del cliente (Día 6): líneas propuestas/aprobadas/rechazadas y
-- solicitudes de aprobación con enlace firmado (el token NO se guarda).
-- Escrita a mano (mismo resultado que `prisma migrate diff`, sin el drift
-- conocido de ledger_accounts/accounts.email) + CHECKs de coherencia.

-- CreateEnum
CREATE TYPE "ItemApprovalStatus" AS ENUM ('approved', 'proposed', 'declined');

-- CreateEnum
CREATE TYPE "ApprovalRequestStatus" AS ENUM ('pending', 'completed', 'revoked');

-- Las líneas existentes quedan 'approved' (el taller ya las cobraba).
ALTER TABLE "work_order_items"
    ADD COLUMN "approval_status" "ItemApprovalStatus" NOT NULL DEFAULT 'approved',
    ADD COLUMN "decided_at" TIMESTAMPTZ(6),
    -- Una línea rechazada siempre registra cuándo lo decidió el cliente.
    ADD CONSTRAINT "work_order_items_declined_at_check" CHECK ("approval_status" <> 'declined' OR "decided_at" IS NOT NULL);

-- CreateTable
CREATE TABLE "work_order_approvals" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "work_order_id" UUID NOT NULL,
    "status" "ApprovalRequestStatus" NOT NULL DEFAULT 'pending',
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "decided_at" TIMESTAMPTZ(6),
    "created_by_account_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "work_order_approvals_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "work_order_approvals_expiry_check" CHECK ("expires_at" > "created_at"),
    -- Solo una solicitud completada tiene fecha de decisión.
    CONSTRAINT "work_order_approvals_decided_at_check" CHECK (("status" = 'completed') = ("decided_at" IS NOT NULL))
);

-- CreateIndex
CREATE INDEX "work_order_approvals_work_order_id_idx" ON "work_order_approvals"("work_order_id");

-- AddForeignKey: la solicitud es de una OT del MISMO taller.
ALTER TABLE "work_order_approvals" ADD CONSTRAINT "work_order_approvals_work_order_id_shop_id_fkey" FOREIGN KEY ("work_order_id", "shop_id") REFERENCES "work_orders"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
