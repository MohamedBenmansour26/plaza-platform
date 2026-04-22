-- PLZ-059: Ensure drivers.phone has a unique constraint.
-- The original CREATE TABLE IF NOT EXISTS was skipped on remote because
-- the drivers table already existed, leaving the unique constraint unset.
-- This migration adds it idempotently.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   pg_constraint
    WHERE  conrelid = 'drivers'::regclass
    AND    contype  = 'u'
    AND    conname  = 'drivers_phone_unique'
  ) THEN
    ALTER TABLE drivers ADD CONSTRAINT drivers_phone_unique UNIQUE (phone);
  END IF;
END $$;
