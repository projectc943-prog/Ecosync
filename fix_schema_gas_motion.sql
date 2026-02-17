-- 1. Alter table to remove old columns and add new ones
ALTER TABLE public.sensor_readings 
  DROP COLUMN IF EXISTS air_quality, 
  DROP COLUMN IF EXISTS raw_air_quality,
  DROP COLUMN IF EXISTS wind_speed,
  DROP COLUMN IF EXISTS raw_wind_speed;

ALTER TABLE public.sensor_readings 
  ADD COLUMN IF NOT EXISTS gas numeric,
  ADD COLUMN IF NOT EXISTS raw_gas numeric,
  ADD COLUMN IF NOT EXISTS motion numeric, -- Using numeric to match others, though boolean/integer works too (0 or 1)
  ADD COLUMN IF NOT EXISTS raw_motion numeric;

-- 2. Explicitly GRANT permissions for new columns (just in case)
GRANT ALL ON TABLE public.sensor_readings TO anon;
GRANT ALL ON TABLE public.sensor_readings TO authenticated;
GRANT ALL ON TABLE public.sensor_readings TO service_role;

-- 3. Force PostgREST to refresh its schema cache
NOTIFY pgrst, 'reload schema';
