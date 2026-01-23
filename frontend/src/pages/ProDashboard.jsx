import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Activity, Droplets, Thermometer, Wind, AlertTriangle, Zap, Shield } from 'lucide-react';
import API_BASE_URL from '../config';

const StatCard = ({ title, value, unit, icon: Icon, color, trend }) => (
    <div className="glass-panel p-6 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 p-24 bg-${color}-500/5 rounded-full -mr-10 -mt-10 blur-3xl transition-all group-hover:bg-${color}-500/10`} />
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
                <p className="text-slate-400 text-sm uppercase tracking-wider font-bold mb-1">{title}</p>
                <h3 className="text-3xl font-black text-white font-mono">
                    {value} <span className="text-sm text-slate-500 font-normal">{unit}</span>
                </h3>
            </div>
            <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400 border border-${color}-500/20 shadow-[0_0_15px_rgba(0,0,0,0.2)]`}>
                <Icon size={24} />
            </div>
        </div>
        <div className="w-full bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
            <div
                className={`h-full bg-${color}-500 shadow-[0_0_10px_currentColor]`}
                style={{ width: `${Math.min(trend || 50, 100)}%` }}
            />
        </div>
    </div>
);

const ProDashboard = ({ sensorData, alerts, connectionStatus }) => {
    const [predictions, setPredictions] = useState([]);
    const [weather, setWeather] = useState(null);
    const [proData, setProData] = useState(null);
    const [fusionData, setFusionData] = useState(null);

    // Fetch Predictions (Pro Feature)
    useEffect(() => {
        const fetchPredictions = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/pro/predict?steps=10`);
                if (res.ok) {
                    const predData = await res.json();
                    if (Array.isArray(sensorData) && sensorData.length > 0) {
                        const lastTime = new Date(sensorData[sensorData.length - 1].timestamp).getTime();
                        const future = predData.temperature.map((val, i) => ({
                            timestamp: new Date(lastTime + (i + 1) * 1000).toISOString(),
                            predictedTemp: val,
                            isPrediction: true
                        }));
                        setPredictions(future);
                    }
                }
            } catch (e) { console.error(e); }
        };
        const interval = setInterval(fetchPredictions, 5000);
        return () => clearInterval(interval);
    }, [sensorData]);

    // Fetch External Weather (Pro Feature)
    useEffect(() => {
        const fetchProData = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/pro/current?lat=17.3850&lon=78.4867`);
                if (res.ok) {
                    const data = await res.json();
                    setProData(data);
                    if (data.fusion) setFusionData(data.fusion);
                    setWeather(data.weather);
                }
            } catch (e) { console.error("Pro Data fetch failed", e); }
        };
        fetchProData();
        const interval = setInterval(fetchProData, 600000); // 10 mins
        return () => clearInterval(interval);
    }, []);

    const radarData = useMemo(() => {
        if (sensorData && sensorData.length > 0) {
            const latest = sensorData[sensorData.length - 1];
            return [
                { subject: 'Temp', A: (latest.temperature || 0), fullMark: 100 },
                { subject: 'Hum', A: (latest.humidity || 0), fullMark: 100 },
                { subject: 'Press', A: ((latest.pressure || 1000) - 900) / 2, fullMark: 100 },
                { subject: 'Air Q', A: (latest.pm2_5 || 0), fullMark: 500 },
                { subject: 'Vibe', A: (latest.vibration || 0) * 10, fullMark: 100 },
            ];
        }
        return [];
    }, [sensorData]);

    const latestData = useMemo(() => {
        return (sensorData && sensorData.length > 0) ? sensorData[sensorData.length - 1] : {};
    }, [sensorData]);

    const temp = useMemo(() => latestData.temperature?.toFixed(1) || '--', [latestData]);
    const hum = useMemo(() => latestData.humidity?.toFixed(1) || '--', [latestData]);
    const press = useMemo(() => latestData.pressure?.toFixed(0) || '--', [latestData]);
    const gas = useMemo(() => latestData.pm2_5 > 100 ? 'DETECTED' : 'CLEAR', [latestData]);
    const gasColor = useMemo(() => latestData.pm2_5 > 100 ? 'red' : 'emerald', [latestData]);

    const combinedData = useMemo(() => {
        return Array.isArray(sensorData) ? [...sensorData, ...predictions] : [];
    }, [sensorData, predictions]);

    return (
        <div className="p-8 w-full max-w-7xl mx-auto space-y-8 animate-in pb-24">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2 font-black tracking-tighter">
                        PRO COMMAND CENTER
                    </h1>
                    <p className="text-slate-400 font-mono text-sm">
                        SYSTEM STATUS: <span className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">OPERATIONAL</span>
                        <span className="mx-2 text-slate-600">|</span>
                        <span className="text-slate-500">ADVANCED ANALYTICS ACTIVE</span>
                    </p>
                </div>
            </header>

            {alerts.length > 0 && (
                <div className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 flex items-center gap-3 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                    <AlertTriangle className="text-red-500" />
                    <span className="font-bold">CRITICAL ALERT:</span> {alerts[0].message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Avg Temperature" value={temp} unit="°C" icon={Thermometer} color="cyan" trend={Math.abs(latestData.temperature || 0) * 2} />
                <StatCard title="Air Humidity" value={hum} unit="%" icon={Droplets} color="blue" trend={latestData.humidity || 0} />
                <StatCard title="Atm Pressure" value={press} unit="hPa" icon={Wind} color="purple" trend={(latestData.pressure - 800) / 4 || 0} />
                <StatCard title="Air Quality" value={gas} unit="PM2.5" icon={Activity} color={gasColor} trend={latestData.pm2_5 || 0} />
                <StatCard
                    title="Local Weather"
                    value={weather ? weather.temp : '--'}
                    unit="°C"
                    icon={Thermometer}
                    color="orange"
                    trend={weather ? weather.wind_speed : 0}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px] animate-in slide-in-from-bottom duration-700">
                <div className="flex flex-col gap-6 h-full">
                    <div className="glass-panel p-6 flex-1 overflow-hidden relative">
                        <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
                            <Zap className="text-yellow-400" size={20} /> Sensor Fusion
                        </h3>
                        <div className="w-full h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                    <PolarGrid stroke="#334155" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Metrics" dataKey="A" stroke="#ec4899" strokeWidth={2} fill="#ec4899" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass-panel p-6 flex-1 overflow-hidden flex flex-col relative group">
                        <div className={`absolute inset-0 bg-gradient-to-b ${latestData.precautions?.length > 0 ? 'from-red-500/10' : 'from-emerald-500/10'} to-transparent opacity-50`} />
                        <h3 className="text-xl font-bold text-slate-200 mb-2 flex items-center gap-2 relative z-10">
                            {latestData.precautions?.length > 0 ? <AlertTriangle className="text-red-400" /> : <Shield className="text-emerald-400" />}
                            AI Safety Officer
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide relative z-10">
                            {latestData.precautions?.length > 0 ? (
                                latestData.precautions.map((note, i) => (
                                    <div key={`prec-${i}`} className="p-2 rounded bg-red-500/10 border border-red-500/30 flex gap-2 items-start">
                                        <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={12} />
                                        <span className="text-red-100 text-xs">{note}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                    <Shield size={32} className="text-emerald-500/20 mb-1" />
                                    <p className="text-[10px] font-mono">100% SAFE</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {fusionData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-500">
                    <div className="glass-panel p-5 border-t-2 border-t-purple-500/50">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-slate-300 font-bold flex items-center gap-2">
                                <Thermometer size={18} className="text-purple-400" /> Temp Fusion
                            </h3>
                            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">KALMAN</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-slate-900/50 p-2 rounded">
                                <span className="block text-[10px] text-slate-500">LOCAL</span>
                                <span className="text-slate-200 font-mono">{fusionData.temperature?.local ?? '--'}</span>
                            </div>
                            <div className="bg-slate-900/50 p-2 rounded">
                                <span className="block text-[10px] text-slate-500">EXT</span>
                                <span className="text-slate-200 font-mono">{fusionData.temperature?.external ?? '--'}</span>
                            </div>
                            <div className="bg-purple-500/20 p-2 rounded border border-purple-500/30">
                                <span className="block text-[10px] text-purple-300 font-bold">FUSED</span>
                                <span className="text-white font-black font-mono">{fusionData.temperature?.fused ?? '--'}°C</span>
                            </div>
                        </div>
                    </div>
                    {/* Add Humidity and AQI Fusion blocks here similarly if needed, or keep for brevity */}
                </div>
            )}

            <div className="glass-panel p-6 border-t-2 border-t-cyan-500/20">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                        <Activity className="text-cyan-400" size={20} /> Predictive Analytics
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/30 px-3 py-1 rounded-full border border-cyan-500/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        AI MODEL: KALMAN FILTER (ACTIVE)
                    </div>
                </div>

                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={combinedData}>
                            <defs>
                                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                                <pattern id="stripe" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                    <rect width="4" height="8" transform="translate(0,0)" fill="#f472b6" opacity="0.1" />
                                </pattern>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis
                                dataKey="timestamp"
                                stroke="#475569"
                                tick={{ fill: '#475569' }}
                                tickFormatter={(t) => t ? new Date(t).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }) : ''}
                            />
                            <YAxis stroke="#475569" tick={{ fill: '#475569' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0' }}
                                itemStyle={{ color: '#06b6d4' }}
                                labelFormatter={(t) => t ? new Date(t).toLocaleTimeString() : ''}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="temperature"
                                name="Measured Temp"
                                stroke="#06b6d4"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorTemp)"
                            />
                            <Area
                                type="monotone"
                                dataKey="predictedTemp"
                                name="AI Prediction (+10s)"
                                stroke="#f472b6"
                                strokeWidth={3}
                                strokeDasharray="8 8"
                                fill="url(#stripe)"
                                activeDot={{ r: 8, fill: "#f472b6", stroke: "#fff" }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ProDashboard;
