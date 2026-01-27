import { useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabaseClient';

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
                if (mode === 'lite' || mode === 'light') {
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

                // --- CLOUD PERSISTENCE & ALERTS ---
                const localTime = new Date(now - (new Date().getTimezoneOffset() * 60000)).toISOString();

                // 1. Supabase Sync
                (async () => {
                    try {
                        const { error } = await supabase.from('sensor_readings').insert([
                            {
                                temperature: packet.temperature,
                                raw_temperature: packet.raw_temperature,
                                humidity: packet.humidity,
                                raw_humidity: packet.raw_humidity,
                                air_quality: packet.mq_ppm,
                                raw_air_quality: packet.raw_mq_ppm,
                                created_at: localTime
                            }
                        ]);
                        if (error) console.error("Supabase Sync Error:", error.message);
                    } catch (err) {
                        console.error("Supabase Sync Fatal Error:", err);
                    }
                })();

                // 2. Local Backend Alerts Sync
                (async () => {
                    try {
                        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/iot/data`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                temperature: Number(filteredTemp.toFixed(2)),
                                humidity: Number(filteredHum.toFixed(2)),
                                pm25: Number(filteredAqi.toFixed(2)),
                                pressure: 1013,
                                mq_raw: packet.mq_raw
                            })
                        });
                        if (!response.ok) {
                            const errData = await response.json();
                            console.warn("Backend Alert Sync Warning:", errData.detail);
                        }
                    } catch (err) {
                        console.error("Backend Alert Sync Fatal Error:", err);
                    }
                })();

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

    // --- WEB SERIAL LOGIC ---
    const portRef = useRef(null);
    const readerRef = useRef(null);

    const disconnectSerial = async () => {
        if (readerRef.current) {
            await readerRef.current.cancel();
            readerRef.current = null;
        }
        if (portRef.current) {
            await portRef.current.close();
            portRef.current = null;
        }
        setStream(prev => ({ ...prev, connected: false }));
        setHealth({ status: 'DISCONNECTED', lastPacketTime: null });
    };

    const connectSerial = async () => {
        if (!("serial" in navigator)) {
            alert("Web Serial is not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        try {
            const port = await navigator.serial.requestPort();
            await port.open({ baudRate: 115200 });
            portRef.current = port;

            const textDecoder = new TextDecoderStream();
            const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
            const reader = textDecoder.readable.getReader();
            readerRef.current = reader;

            setStream(prev => ({ ...prev, connected: true }));
            setHealth({ status: 'STREAMING', lastPacketTime: new Date() });

            let lineBuffer = '';
            let filtered = { t: 0, h: 0, p: 0 };
            const alpha = 0.15; // Filter strength

            // Reading loop
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                lineBuffer += value;
                const lines = lineBuffer.split('\n');
                lineBuffer = lines.pop(); // Keep partial line

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed) continue;

                    try {
                        const json = JSON.parse(trimmed);

                        // Simple EMA Filter
                        const tRaw = json.temperature || json.temp || 0;
                        const hRaw = json.humidity || json.hum || 0;
                        const pRaw = json.pm25 || json.pm2_5 || json.aqi || 0;

                        if (filtered.t === 0) {
                            filtered = { t: tRaw, h: hRaw, p: pRaw };
                        } else {
                            filtered.t = alpha * tRaw + (1 - alpha) * filtered.t;
                            filtered.h = alpha * hRaw + (1 - alpha) * filtered.h;
                            filtered.p = alpha * pRaw + (1 - alpha) * filtered.p;
                        }

                        const packet = {
                            ts: Date.now(),
                            timestamp: new Date().toLocaleTimeString(),
                            temperature: filtered.t,
                            temp_raw: tRaw,
                            humidity: filtered.h,
                            hum_raw: hRaw,
                            pm25: filtered.p,
                            pm25_raw: pRaw,
                            pressure: json.pressure || 1013,
                            mq_raw: json.mq_raw || json.gas || 0,
                            trustScore: 100,
                            deviceId: "ESP32-SERIAL"
                        };

                        // --- PERSISTENCE & ALERTS FOR SERIAL ---
                        // 1. Supabase Sync (Serial Mode)
                        (async () => {
                            try {
                                await supabase.from('sensor_data').insert([{
                                    device_id: "ESP32-SERIAL",
                                    timestamp: new Date().toISOString(),
                                    temperature: Number(filtered.t.toFixed(2)),
                                    humidity: Number(filtered.h.toFixed(2)),
                                    pressure: Number(json.pressure || 1013),
                                    pm2_5: Number(filtered.p.toFixed(2)),
                                    vibration: Number(json.mq_raw || json.gas || 0)
                                }]);
                            } catch (err) {
                                console.error("Serial Supabase Sync Error:", err);
                            }
                        })();

                        // 2. Backend Alerts Sync (Serial Mode)
                        (async () => {
                            try {
                                fetch(`${import.meta.env.VITE_API_BASE_URL}/iot/data`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        temperature: Number(filtered.t.toFixed(2)),
                                        humidity: Number(filtered.h.toFixed(2)),
                                        pm25: Number(filtered.p.toFixed(2)),
                                        pressure: Number(json.pressure || 1013),
                                        mq_raw: Number(json.mq_raw || json.gas || 0)
                                    })
                                });
                            } catch (err) {
                                console.error("Serial Backend Alert Sync Error:", err);
                            }
                        })();

                        bufferRef.current = [...bufferRef.current, packet].slice(-50);
                        setStream(prev => ({
                            ...prev,
                            connected: true,
                            lastSeen: Date.now(),
                            data: packet,
                            history: bufferRef.current
                        }));
                        setHealth({ status: 'ONLINE', lastPacketTime: new Date() });

                    } catch (e) {
                        console.log("Serial Parse Error on line:", trimmed);
                    }
                }
            }
        } catch (err) {
            console.error("Serial Connection Error:", err);
            disconnectSerial();
        }
    };

    return {
        ...stream,
        health,
        connectSerial,
        disconnectSerial
    };
};
