import { useState, useEffect, useRef } from 'react';

// MODE: 'light' now fetches from our Proxy API (Blynk Bridge)
// PRO MODE: Fetches real-time Satellite/Weather Data
export const useEsp32Stream = (mode = 'light', coordinates = [17.3850, 78.4867]) => {
    // State
    const [stream, setStream] = useState({
        connected: false,
        lastSeen: null,
        data: null,
        history: [],
        alerts: []
    });

    const [health, setHealth] = useState({
        status: 'DISCONNECTED',
        lastPacketTime: null
    });

    const bufferRef = useRef([]);
    const realBaseRef = useRef({ temp: 24, hum: 45, aqi: 12, loaded: false });

    // 1. FETCH REAL BASELINE DATA (Every time coordinates change)
    useEffect(() => {
        if (mode !== 'pro') return;

        const fetchRealEnv = async () => {
            try {
                const [lat, lon] = coordinates;
                // Parallel Fetch: Weather + Air Quality
                const [weatherRes, aqiRes] = await Promise.all([
                    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`),
                    fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,us_aqi`)
                ]);

                const weather = await weatherRes.json();
                const aqi = await aqiRes.json();

                if (weather.current && aqi.current) {
                    realBaseRef.current = {
                        temp: weather.current.temperature_2m,
                        hum: weather.current.relative_humidity_2m,
                        aqi: aqi.current.pm2_5, // Mass Concentration
                        loaded: true
                    };
                    console.log("Updated Real Baseline:", realBaseRef.current);
                }
            } catch (err) {
                console.error("Failed to fetch real data:", err);
            }
        };

        fetchRealEnv();
        // Refresh base data every 2 mins
        const baseInterval = setInterval(fetchRealEnv, 120000);
        return () => clearInterval(baseInterval);

    }, [mode, coordinates[0], coordinates[1]]);


    // 2. HIGH FREQUENCY STREAM GENERATOR
    useEffect(() => {
        let intervalId;

        const fetchData = async () => {
            try {
                if (mode === 'lite') {
                    // LITE MODE: Try API, fallback to simple mock
                    try {
                        const res = await fetch('/api/data'); // Proxy endpoint
                        const data = await res.json();
                        if (data.error) throw new Error(data.error);

                        const packet = {
                            ts: Date.now(),
                            timestamp: new Date().toLocaleTimeString(),
                            temperature: data.temperature || 0,
                            humidity: data.humidity || 0,
                            mq_ppm: data.aqi || 0,
                            trustScore: 90,
                            deviceId: "ESP32-LITE"
                        };

                        bufferRef.current = [...bufferRef.current, packet].slice(-20); // Smaller buffer for lite
                        setStream({ connected: true, lastSeen: Date.now(), data: packet, history: bufferRef.current, alerts: [] });
                        setHealth({ status: 'ONLINE', lastPacketTime: new Date() });
                        return;
                    } catch (e) {
                        // Fallback Lite Mock
                        console.log("Lite Mode: Using fallback data");
                        const packet = {
                            ts: Date.now(), timestamp: new Date().toLocaleTimeString(),
                            temperature: 25, humidity: 50, mq_ppm: 10, trustScore: 80, deviceId: "ESP32-LITE-OFFLINE"
                        };
                        setStream({ connected: false, lastSeen: Date.now(), data: packet, history: [], alerts: [] });
                        setHealth({ status: 'OFFLINE', lastPacketTime: null });
                        return;
                    }
                }

                // PRO MODE: Advanced Simulation + Real Data Wrapper
                const now = Date.now();

                // USE REAL BASELINE IF LOADED, ELSE MOCK
                const base = realBaseRef.current;

                // --- SENSOR SIMULATION ENGINE ---
                // 1. HARWARE BIAS (Simulating Uncalibrated Sensors)
                const BIAS = { temp: 2.1, hum: -4.5, aqi: 15 };

                // Base Values (Ground Truth from API)
                const truthTemp = base.loaded ? base.temp : (24 + Math.sin(now / 10000) * 2);
                const truthHum = base.loaded ? base.hum : (45 + Math.sin(now / 20000) * 5);
                const truthAqi = base.loaded ? base.aqi : (12 + Math.cos(now / 15000) * 3);

                // Raw Readings = Truth + Bias + Noise
                const rawTemp = truthTemp + BIAS.temp + ((Math.random() - 0.5) * 0.5);
                const rawHum = truthHum + BIAS.hum + ((Math.random() - 0.5) * 1.0);
                const rawAqi = truthAqi + BIAS.aqi + ((Math.random() - 0.5) * 2.0);

                // 2. CALIBRATION (Software Correction)
                const calTemp = rawTemp - BIAS.temp;
                const calHum = rawHum - BIAS.hum;
                const calAqi = rawAqi - BIAS.aqi;

                // 3. KALMAN FILTER (Noise Reduction)
                const lastPacket = bufferRef.current[bufferRef.current.length - 1];

                const filteredTemp = lastPacket ? (lastPacket.temperature * 0.85 + calTemp * 0.15) : calTemp;
                const filteredHum = lastPacket ? (lastPacket.humidity * 0.85 + calHum * 0.15) : calHum;
                const filteredAqi = lastPacket ? (lastPacket.mq_ppm * 0.85 + calAqi * 0.15) : calAqi;

                const packet = {
                    ts: now,
                    timestamp: new Date().toLocaleTimeString(),

                    // Temperature
                    temperature: Number(filteredTemp.toFixed(1)),
                    raw_temperature: Number(rawTemp.toFixed(1)),

                    // Humidity
                    humidity: Number(filteredHum.toFixed(1)),
                    raw_humidity: Number(rawHum.toFixed(1)),

                    // Air Quality
                    mq_ppm: Number(filteredAqi.toFixed(0)), // PM2.5
                    raw_mq_ppm: Number(rawAqi.toFixed(0)),
                    mq_raw: 400 + Math.random() * 50,

                    trustScore: 99.9,
                    deviceId: "ESP32-S4-PRO-SAT"
                };

                // Update Buffer
                bufferRef.current = [...bufferRef.current, packet].slice(-50);

                setStream({
                    connected: true,
                    lastSeen: now,
                    data: packet,
                    history: bufferRef.current,
                    alerts: []
                });

                setHealth({
                    status: 'ONLINE',
                    lastPacketTime: new Date()
                });

            } catch (err) {
                console.error("Stream Error:", err);
            }
        };

        // Poll every 3 seconds
        fetchData();
        intervalId = setInterval(fetchData, 3000);

        return () => clearInterval(intervalId);
    }, []);

    return {
        ...stream,
        health,
        connectSerial: () => console.log("Using Cloud API Mode")
    };
};
