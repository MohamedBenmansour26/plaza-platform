-- PLZ-059: Add city column to drivers table.
-- Used by the dispatch engine (PLZ-058) to match drivers to delivery zones.
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS city text;
CREATE INDEX IF NOT EXISTS drivers_city_idx ON drivers (city);
