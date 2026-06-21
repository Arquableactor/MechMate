-- Baseline (Día 1): tabla trivial de healthcheck.

-- CreateTable
CREATE TABLE "_healthcheck" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "_healthcheck_pkey" PRIMARY KEY ("id")
);
