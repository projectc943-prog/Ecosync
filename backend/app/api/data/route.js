import { NextResponse } from 'next/server';

// BLYNK CONFIG (Ideally move these to .env)
const BLYNK_TOKEN = "MkSpbws2is9fJBmCSYiiBgCUSQLYAKGS";
const BLYNK_URL = `https://blynk.cloud/external/api/get?token=${BLYNK_TOKEN}&v5&v6&v7`;

export async function GET() {
    try {
        // 1. Fetch from Blynk
        const response = await fetch(BLYNK_URL, { cache: 'no-store' });
        const textData = await response.text();

        // Blynk returns data like: "24.5" (if single pin) or JSON if multiple (we need to parse)
        // Actually, asking for &v5&v6&v7 returns a JSON object.

        // Let's assume we get JSON. If not, we might need to fetch pins individually.
        // For safety, let's fetch individually to guarantee format.

        const [resT, resH, resG] = await Promise.all([
            fetch(`https://blynk.cloud/external/api/get?token=${BLYNK_TOKEN}&v5`).then(r => r.text()),
            fetch(`https://blynk.cloud/external/api/get?token=${BLYNK_TOKEN}&v6`).then(r => r.text()),
            fetch(`https://blynk.cloud/external/api/get?token=${BLYNK_TOKEN}&v7`).then(r => r.text())
        ]);

        // 2. Format for Frontend
        const data = {
            temperature: parseFloat(resT) || 0,
            humidity: parseFloat(resH) || 0,
            aqi: parseFloat(resG) || 0, // Gas Value
            status: "Online",
            last_updated: new Date().toISOString()
        };

        return NextResponse.json(data);

    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch from EcoSync Hardware", details: error.message },
            { status: 500 }
        );
    }
}
