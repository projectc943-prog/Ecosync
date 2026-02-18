import React, { useEffect, useState, useCallback } from 'react';
import { Brain, Thermometer, Activity, AlertTriangle, CloudRain, ShieldCheck, Wind, Droplets, Clock, TrendingUp, TrendingDown, Minus, History } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// Trend arrow helper
const Trend = ({ current, historical, unit = '' }) => {
    if (current == null || historical == null) return <span className="text-slate-500">—</span>;
    const diff = current - historical;
    const absDiff = Math.abs(diff).toFixed(1);
    if (Math.abs(diff) < 0.5) return <span className="text-slate-400 flex items-center gap-1"><Minus size={12} /> Stable</span>;
    if (diff > 0) return <span className="text-red-400 flex items-center gap-1"><TrendingUp size={12} /> +{absDiff}{unit} vs last week</span>;
    return <span className="text-emerald-400 flex items-center gap-1"><TrendingDown size={12} /> -{absDiff}{unit} vs last week</span>;
};

const ExplainableAlert = ({ currentData, baselineData, alertReason, userEmail }) => {
    const [histCtx, setHistCtx] = useState(null);
    const [histLoading, setHistLoading] = useState(false);

    // Fetch historical context
    const fetchHistory = useCallback(async () => {
        setHistLoading(true);
        try {
            const url = userEmail
                ? `${API_BASE}/api/historical-context?user_email=${encodeURIComponent(userEmail)}`
                : `${API_BASE}/api/historical-context`;
            const res = await fetch(url);
            if (res.ok) setHistCtx(await res.json());
        } catch (e) {
            console.warn('Historical context fetch failed:', e);
        } finally {
            setHistLoading(false);
        }
    }, [userEmail]);

    useEffect(() => {
        if (currentData) fetchHistory();
    }, [currentData, fetchHistory]);

    if (!currentData) return null;

    const temp = currentData?.temperature;
    const gas = currentData?.gas;
    const hum = currentData?.humidity;
    const rainRaw = currentData?.rain;

    const tempBaseline = baselineData?.temperature || 24;
    const gasBaseline = baselineData?.gas || 40;
    const humBaseline = baselineData?.humidity || 50;

    const tempDev = temp != null ? (temp - tempBaseline) : 0;
    const gasDev = gas != null ? (gas - gasBaseline) : 0;
    const humDev = hum != null ? (hum - humBaseline) : 0;

    const rainStatus = rainRaw != null
        ? (rainRaw < 1000 ? 'RAINING' : rainRaw < 2000 ? 'DAMP' : 'DRY')
        : null;
    const isRaining = rainStatus === 'RAINING';
    const isDamp = rainStatus === 'DAMP';

    const isTempAlert = tempDev > 5;
    const isGasAlert = gasDev > 50;
    const isHumAlert = Math.abs(humDev) > 20;
    const isRainAlert = isRaining;
    const isAlert = isTempAlert || isGasAlert || isHumAlert || isRainAlert || alertReason;

    const getMainCause = () => {
        if (isTempAlert && isGasAlert) return "Compound Risk: Thermal + Chemical Spike";
        if (isTempAlert) return "Thermal Anomaly Detected";
        if (isGasAlert) return "Chemical Vapor Leakage";
        if (isHumAlert) return "Humidity Out of Safe Range";
        if (isRainAlert) return "Active Precipitation Detected";
        return alertReason || "Anomaly Pattern Match";
    };

    // Dynamic precautions with historical context
    const precautions = [];
    const lw = histCtx?.last_week;
    const yd = histCtx?.yesterday;

    if (isTempAlert) {
        const lwNote = lw?.temperature != null
            ? ` Last week at this time it was ${lw.temperature}°C — ${temp > lw.temperature ? 'warmer than usual' : 'cooler than usual'}.`
            : '';
        precautions.push({ icon: '🌡️', label: 'High Temperature', action: `Increase ventilation, avoid direct sun exposure, check cooling systems.${lwNote}` });
    }
    if (isGasAlert) {
        const lwNote = lw?.gas != null
            ? ` Last week gas was ${lw.gas} ppm — ${gas > lw.gas ? 'significantly elevated today' : 'similar levels'}.`
            : '';
        precautions.push({ icon: '💨', label: 'Elevated Gas Level', action: `Evacuate area, open windows, avoid ignition sources immediately.${lwNote}` });
    }
    if (hum > 80) {
        precautions.push({ icon: '💧', label: 'High Humidity', action: 'Run dehumidifiers, check for water leaks, prevent mold growth.' });
    } else if (hum < 20) {
        precautions.push({ icon: '🏜️', label: 'Low Humidity', action: 'Use humidifier, stay hydrated, protect sensitive electronics.' });
    }
    if (isRaining) {
        precautions.push({ icon: '🌧️', label: 'Rain Detected', action: 'Secure outdoor equipment, check drainage, avoid electrical hazards near water.' });
    } else if (isDamp) {
        precautions.push({ icon: '🌦️', label: 'Damp Conditions', action: 'Monitor for moisture buildup, ensure proper sealing of equipment.' });
    }

    // Parse narrative into segments
    const narrativeSegments = histCtx?.narrative
        ? histCtx.narrative.split(' | ').filter(Boolean)
        : [];

    return (
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden space-y-5">

            {/* Header */}
            <div className="flex items-center gap-3 relative z-10">
                <div className={`p-2 rounded-lg ${isAlert ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    <Brain size={24} />
                </div>
                <div>
                    <h3 className="text-white font-bold flex items-center gap-2">
                        Explainable AI Insight
                        {isAlert && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded animate-pulse">ACTION REQUIRED</span>}
                    </h3>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Real-time + Historical Analysis</p>
                </div>
            </div>

            {/* Sensor Grid 2x2 */}
            <div className="grid grid-cols-2 gap-3 relative z-10">
                {/* Temperature */}
                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-slate-500 font-bold uppercase">Temperature</span>
                        <Thermometer size={14} className={isTempAlert ? "text-red-400" : "text-emerald-400"} />
                    </div>
                    <span className="text-2xl font-mono font-black text-white">{temp?.toFixed(1) ?? '--'}°C</span>
                    <div className="text-xs mt-1 space-y-0.5">
                        <span className={`block font-bold ${isTempAlert ? 'text-red-400' : 'text-emerald-400'}`}>
                            {tempDev > 0 ? '+' : ''}{tempDev.toFixed(1)}° from baseline
                        </span>
                        <Trend current={temp} historical={lw?.temperature} unit="°C" />
                    </div>
                </div>

                {/* Gas */}
                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-slate-500 font-bold uppercase">Gas Level</span>
                        <Wind size={14} className={isGasAlert ? "text-red-400" : "text-emerald-400"} />
                    </div>
                    <span className="text-2xl font-mono font-black text-white">{gas?.toFixed(0) ?? '--'}</span>
                    <span className="text-xs text-slate-500 ml-1">PPM</span>
                    <div className="text-xs mt-1 space-y-0.5">
                        <span className={`block font-bold ${isGasAlert ? 'text-red-400' : 'text-emerald-400'}`}>
                            {gasDev > 0 ? '+' : ''}{gasDev.toFixed(0)} from baseline
                        </span>
                        <Trend current={gas} historical={lw?.gas} unit=" ppm" />
                    </div>
                </div>

                {/* Humidity */}
                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-slate-500 font-bold uppercase">Humidity</span>
                        <Droplets size={14} className={isHumAlert ? "text-orange-400" : "text-emerald-400"} />
                    </div>
                    <span className="text-2xl font-mono font-black text-white">{hum?.toFixed(1) ?? '--'}%</span>
                    <div className="text-xs mt-1 space-y-0.5">
                        <span className={`block font-bold ${isHumAlert ? 'text-orange-400' : 'text-emerald-400'}`}>
                            {humDev > 0 ? '+' : ''}{humDev.toFixed(1)}% from baseline
                        </span>
                        <Trend current={hum} historical={lw?.humidity} unit="%" />
                    </div>
                </div>

                {/* Rain */}
                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-slate-500 font-bold uppercase">Rain Sensor</span>
                        <CloudRain size={14} className={isRaining ? "text-blue-400" : isDamp ? "text-cyan-400" : "text-emerald-400"} />
                    </div>
                    <span className={`text-xl font-mono font-black ${isRaining ? 'text-blue-400' : isDamp ? 'text-cyan-400' : 'text-emerald-400'}`}>
                        {rainStatus ?? '---'}
                    </span>
                    <div className="text-xs mt-1 text-slate-500">
                        {rainRaw != null ? `ADC: ${rainRaw}` : 'No data'}
                    </div>
                </div>
            </div>

            {/* Cause + Severity */}
            <div className="bg-slate-800/30 rounded-lg p-4 border border-indigo-500/20 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                <div className="flex items-center gap-3 w-full">
                    <AlertTriangle size={20} className="text-indigo-400 shrink-0" />
                    <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-0.5">ESTIMATED CAUSE</span>
                        <span className="text-white font-bold">{getMainCause()}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-700 pt-3 md:pt-0 md:pl-4">
                    <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-0.5">SEVERITY</span>
                        <span className={`font-black text-lg ${isAlert ? 'text-red-400' : 'text-emerald-400'}`}>
                            {isAlert ? 'HIGH' : 'LOW'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Historical AI Context */}
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <History size={16} className="text-indigo-400" />
                    <span className="text-xs text-indigo-400 uppercase tracking-widest font-bold">AI Historical Context</span>
                    {histLoading && <span className="text-[10px] text-slate-500 animate-pulse">Analyzing...</span>}
                </div>

                {narrativeSegments.length > 0 ? (
                    <div className="space-y-2">
                        {narrativeSegments.map((seg, i) => (
                            <div key={i} className="bg-indigo-950/30 border border-indigo-500/20 rounded-lg px-4 py-3">
                                <p className="text-slate-300 text-xs leading-relaxed">{seg}</p>
                            </div>
                        ))}

                        {/* 7-day averages comparison */}
                        {histCtx?.week_averages && (
                            <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50 mt-2">
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-2">7-Day Averages vs Now</span>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    {[
                                        { label: 'Temp', avg: histCtx.week_averages.temperature, current: temp, unit: '°C' },
                                        { label: 'Humidity', avg: histCtx.week_averages.humidity, current: hum, unit: '%' },
                                        { label: 'Gas', avg: histCtx.week_averages.gas, current: gas, unit: 'ppm' },
                                    ].map(({ label, avg, current, unit }) => {
                                        const diff = avg != null && current != null ? current - avg : null;
                                        const color = diff == null ? 'text-slate-500' : Math.abs(diff) < 1 ? 'text-emerald-400' : diff > 0 ? 'text-red-400' : 'text-emerald-400';
                                        return (
                                            <div key={label} className="bg-slate-900/50 rounded p-2">
                                                <span className="text-[10px] text-slate-500 uppercase block">{label}</span>
                                                <span className="text-white font-mono font-bold text-sm">{avg ?? '—'}{unit}</span>
                                                {diff != null && (
                                                    <span className={`text-[10px] font-bold block ${color}`}>
                                                        {diff > 0 ? '+' : ''}{diff.toFixed(1)} now
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-slate-800/30 rounded-lg px-4 py-3 border border-slate-700/30">
                        <p className="text-slate-500 text-xs">
                            {histLoading ? 'Loading historical data...' : 'No historical data available yet. Data will appear after 24 hours of monitoring.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Precautions */}
            {precautions.length > 0 && (
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck size={16} className="text-emerald-400" />
                        <span className="text-xs text-emerald-400 uppercase tracking-widest font-bold">Recommended Precautions</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {precautions.map((p, i) => (
                            <div key={i} className="bg-emerald-950/30 border border-emerald-500/20 rounded-lg px-4 py-3 flex items-start gap-3">
                                <span className="text-lg leading-none mt-0.5">{p.icon}</span>
                                <div>
                                    <span className="text-emerald-400 font-bold text-xs uppercase tracking-wide block mb-0.5">{p.label}</span>
                                    <span className="text-slate-300 text-xs leading-relaxed">{p.action}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
        </div>
    );
};

export default ExplainableAlert;
