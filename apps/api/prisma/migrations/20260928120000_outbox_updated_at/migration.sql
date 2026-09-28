-- outbox.updated_at (CLAUDE.md: created_at/updated_at en toda tabla).
-- El DEFAULT se queda (no se dropea): durante un deploy la versión anterior de
-- la API sigue insertando en outbox sin conocer esta columna; sin default esos
-- INSERT violarían el NOT NULL. Las filas existentes toman now().
ALTER TABLE "outbox" ADD COLUMN "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;
