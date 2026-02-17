-- 1. Alter table (Uses IF NOT EXISTS to be safe to run multiple times)
ALTER TABLE public.sensor_readings ADD COLUMN IF NOT EXISTS gas numeric;
ALTER TABLE public.sensor_readings ADD COLUMN IF NOT EXISTS raw_gas numeric;
ALTER TABLE public.sensor_readings ADD COLUMN IF NOT EXISTS motion numeric;
ALTER TABLE public.sensor_readings ADD COLUMN IF NOT EXISTS raw_motion numeric;

-- 2. Drop old columns (Optional, but keeps things clean)
ALTER TABLE public.sensor_readings DROP COLUMN IF EXISTS air_quality;
ALTER TABLE public.sensor_readings DROP COLUMN IF EXISTS raw_air_quality;
ALTER TABLE public.sensor_readings DROP COLUMN IF EXISTS wind_speed;
ALTER TABLE public.sensor_readings DROP COLUMN IF EXISTS raw_wind_speed;

-- 3. Grant permissions again (Crucial for new columns)
GRANT ALL ON TABLE public.sensor_readings TO anon;
GRANT ALL ON TABLE public.sensor_readings TO service_role;

-- 4. Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';

-- 5. VERIFICATION: This should show the new columns in the output
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sensor_readings';
