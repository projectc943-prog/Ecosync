import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
    const envPath = path.resolve(__dirname, '../.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    let key = '';

    envFile.split('\n').forEach(line => {
        const [k, v] = line.split('=');
        if (k && k.trim() === 'VITE_SUPABASE_ANON_KEY') {
            key = v.trim();
        }
    });

    if (!key) {
        console.error("No Key found");
        process.exit(1);
    }

    // Remove any trailing comments or whitespace
    key = key.split('#')[0].trim();

    console.log("Found Key Start:", key.substring(0, 10) + "...");

    const parts = key.split('.');
    if (parts.length < 2) {
        console.error("Invalid JWT format properly");
        process.exit(1);
    }

    // Fix base64 padding if necessary
    let base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
        base64 += '=';
    }

    const payload = Buffer.from(base64, 'base64').toString('utf8');
    const claims = JSON.parse(payload);

    console.log("Decoded Payload:", JSON.stringify(claims, null, 2));

    if (claims.ref) {
        console.log(`\n✅ AUTHORITATIVE PROJECT ID: ${claims.ref}`);
        console.log(`✅ EXPECTED URL: https://${claims.ref}.supabase.co`);
    } else {
        console.log("\n❌ NO PROJECT ID (ref) FOUND IN KEY");
    }

} catch (e) {
    console.error("Error:", e.message);
}
