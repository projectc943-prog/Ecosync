
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
// Manually parse .env file to avoid dependencies
const envPath = path.resolve(process.cwd(), '.env');
let env = {};

try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, ...rest] = line.split('=');
        if (key && rest.length > 0) {
            let val = rest.join('=').trim();
            // Strip quotes if present
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
            }
            env[key.trim()] = val;
        }
    });
} catch (e) {
    console.error("❌ ERROR: Could not read .env file");
    process.exit(1);
}

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ ERROR: Missing Supabase Credentials in .env");
    console.error("Found keys:", Object.keys(env));
    process.exit(1);
}

console.log("DEBUG: URL:", supabaseUrl);
console.log("DEBUG: Key Length:", supabaseKey.length);
console.log("DEBUG: Key Start:", supabaseKey.substring(0, 5));
console.log("DEBUG: Key End:", supabaseKey.substring(supabaseKey.length - 5));

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyStorage() {
    console.log("🔍 Checking Supabase Storage...");

    // Fetch last 5 records
    const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("❌ FAILED to fetch data:", error.message);
        if (error.code === '42P01') {
            console.log("💡 HINT: The table 'sensor_readings' does not exist.");
            console.log("   Please run the SQL migration to create the table.");
        }
        return;
    }

    if (!data || data.length === 0) {
        console.log("⚠️  Connection Successful, but TABLE IS EMPTY.");
        console.log("   (Wait 30 seconds for the next sync packet)");
        return;
    }

    console.log(`✅ SUCCESS: Found ${data.length} recent records!`);
    console.table(data.map(d => ({
        Time: new Date(d.created_at).toLocaleTimeString(),
        Temp_Raw: d.raw_temperature,
        Temp_Cal: d.temperature,
        AQI_Raw: d.raw_air_quality,
        AQI_Cal: d.air_quality,
        Device: d.device_id
    })));
}

verifyStorage();
