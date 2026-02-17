-- 1. Explicitly GRANT permissions to the role used by the API (anon/service_role)
GRANT ALL ON TABLE public.sensor_readings TO anon;
GRANT ALL ON TABLE public.sensor_readings TO authenticated;
GRANT ALL ON TABLE public.sensor_readings TO service_role;

GRANT ALL ON SEQUENCE public.sensor_readings_id_seq TO anon;
GRANT ALL ON SEQUENCE public.sensor_readings_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.sensor_readings_id_seq TO service_role;

-- 2. Force PostgREST to refresh its schema cache
-- This is often required after creating a new table
NOTIFY pgrst, 'reload schema';
