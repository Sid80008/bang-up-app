-- Migration: add location unit and address; convert location_radius to numeric when needed
BEGIN;

-- Add new columns if they don't exist
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS location_radius_unit text DEFAULT 'km';
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS address text;

-- Try to convert existing location_radius text values to numeric (keep if already numeric)
DO $$
DECLARE
  col_type text;
BEGIN
  SELECT data_type INTO col_type
  FROM information_schema.columns
  WHERE table_name = 'profiles' AND column_name = 'location_radius';

  IF col_type IS NULL THEN
    -- Column missing: create numeric column
    BEGIN
      ALTER TABLE profiles ADD COLUMN location_radius numeric;
    EXCEPTION WHEN duplicate_column THEN
      -- ignore
    END;
  ELSIF col_type IN ('character varying','text') THEN
    -- Convert textual radius like '5 km', '50km', 'anywhere' into numeric (kilometers assumed by default)
    -- Use regexp to extract numeric portion; if empty, set NULL
    ALTER TABLE profiles ALTER COLUMN location_radius TYPE numeric USING (
      NULLIF(regexp_replace(location_radius, '[^0-9\\.]', '', 'g'), '')::numeric
    );
  END IF;
END$$;

-- Ensure a sensible default for any null radii
UPDATE profiles SET location_radius = 5 WHERE location_radius IS NULL;

COMMIT;

-- Notes:
-- If your existing values use different units encoded in the string (e.g. '3 miles'), you'll need a more advanced migration to convert miles/meters into km.
-- Review a sample of your data before running this on production.
