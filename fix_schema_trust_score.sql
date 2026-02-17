-- 1. Add trust_score column
ALTER TABLE public.sensor_readings ADD COLUMN IF NOT EXISTS trust_score numeric;

-- 2. Grant permissions
GRANT ALL ON TABLE public.sensor_readings TO anon;
GRANT ALL ON TABLE public.sensor_readings TO service_role;

-- 3. Reload Schema Cache
NOTIFY pgrst, 'reload schema';

-- 4. Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sensor_readings';
