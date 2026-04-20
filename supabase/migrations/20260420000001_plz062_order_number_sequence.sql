-- PLZ-062 / SAAD-003: Replace client-side random order numbers with a
-- server-side Postgres sequence to guarantee collision-safe sequential values.

-- Create the sequence (starts at 1000 so numbers are always 4+ digits).
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

-- Function that generates the formatted order number from the sequence.
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT
LANGUAGE SQL
AS $$
  SELECT 'PLZ-' || LPAD(nextval('order_number_seq')::text, 4, '0');
$$;

-- Trigger function: only fill order_number when it is NULL (allows explicit
-- values during migrations / backfills but auto-generates for new rows).
CREATE OR REPLACE FUNCTION trg_set_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Attach the trigger to the orders table.
DROP TRIGGER IF EXISTS set_order_number ON orders;
CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trg_set_order_number();
