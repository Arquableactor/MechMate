-- Refuerzo del ledger: la moneda de cada línea debe coincidir con la moneda de su
-- cuenta contable. Antes solo se validaba en la app (LedgerService.postEntry);
-- ahora también en la misma costura auditable que SUM=0 (el trigger de balance).
-- CREATE OR REPLACE actualiza la función que ya usan los triggers existentes.

CREATE OR REPLACE FUNCTION ledger_check_entry_balance() RETURNS trigger AS $$
DECLARE
  v_entry_id   uuid;
  v_count      integer;
  v_sum        bigint;
  v_currencies integer;
  v_mismatch   integer;
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

  SELECT COUNT(*)
    INTO v_mismatch
    FROM ledger_postings p
    JOIN ledger_accounts a ON a.id = p.account_id
   WHERE p.entry_id = v_entry_id
     AND p.currency <> a.currency;
  IF v_mismatch > 0 THEN
    RAISE EXCEPTION 'Ledger entry %: moneda de línea distinta a la de su cuenta', v_entry_id
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
