-- Coherencia método ↔ proveedor. Va en su propia migración porque Postgres no
-- permite usar un valor de enum ('offline') en la misma transacción que lo agrega.
ALTER TABLE "payments"
    ADD CONSTRAINT "payments_method_provider_check" CHECK (("method" = 'card') = ("provider" = 'cardnet'));
