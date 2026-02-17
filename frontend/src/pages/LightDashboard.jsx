import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { Bell, Wifi, Activity, Droplets, Thermometer, Wind, Zap, Map as MapIcon, Newspaper, User, Menu, X, Leaf, Shield, Cpu, ExternalLink, CloudRain, Brain, ShieldCheck, FlaskConical, AlertTriangle, Gauge } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEsp32Stream } from '../hooks/useEsp32Stream';
import NewsComponent from '../components/NewsComponent';

// Phase 2 Components
import RiskPanel from '../components/RiskPanel';
import ExplainableAlert from '../components/ExplainableAlert';
import RestrictedActivity from '../components/RestrictedActivity';
import SensorHealth from '../components/SensorHealth';
import TrendGraph from '../components/TrendGraph';

const LightDashboard = ({ onToggle }) => {
    const { logout, userProfile, currentUser } = useAuth();
    const { data: latestReading, history: sensorData, connected: connectionStatus, connectSerial } = useEsp32Stream('light');

    const [activeView, setActiveView] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDeviceConfigOpen, setIsDeviceConfigOpen] = useState(false);

    // Memoized Data
    const latestData = useMemo(() => (sensorData && sensorData.length > 0) ? sensorData[sensorData.length - 1] : {}, [sensorData]);
    const temp = useMemo(() => latestData.temperature != null ? latestData.temperature.toFixed(1) : '--.-', [latestData]);
    const tempRaw = useMemo(() => latestData.temp_raw != null ? latestData.temp_raw.toFixed(1) : '--.-', [latestData]);

    const hum = useMemo(() => latestData.humidity != null ? latestData.humidity.toFixed(1) : '--.-', [latestData]);
    const humRaw = useMemo(() => latestData.hum_raw != null ? latestData.hum_raw.toFixed(1) : '--.-', [latestData]);

    const gas = useMemo(() => latestData.gas != null ? latestData.gas.toFixed(0) : '---', [latestData]);
    const gasRaw = useMemo(() => latestData.mq_raw != null ? latestData.mq_raw.toFixed(0) : '---', [latestData]);

    const motion = useMemo(() => latestData.motion === 1 ? 'DETECTED' : 'CLEAR', [latestData]);
    const rain = useMemo(() => latestData.rain != null ? latestData.rain.toFixed(0) : '0', [latestData]);
    const rainStatus = useMemo(() => {
        const val = parseInt(rain);
        if (val < 1000) return 'RAINING';
        if (val < 2000) return 'DAMP';
        return 'DRY';
    }, [rain]);

    // Smart Metrics extraction
    const smartMetrics = latestData.smart_metrics || {};
    const trustScore = useMemo(() => smartMetrics.trust_score != null ? Math.round(smartMetrics.trust_score) : 'N/A', [smartMetrics]);
    const ph = useMemo(() => smartMetrics.ph != null ? smartMetrics.ph.toFixed(1) : 'N/A', [smartMetrics]);
    const anomaly = smartMetrics.anomaly_label !== "Normal" ? smartMetrics.anomaly_label : null;
    const insight = smartMetrics.insight;

    // Phase 2 Metrics
    const riskLevel = smartMetrics.risk_level || "SAFE";
    const sensorHealth = smartMetrics.sensor_health || {};
    const baseline = smartMetrics.baseline || {};
    const prediction = smartMetrics.prediction || {};

    // Stat Card
    const StatCard = ({ title, value, rawValue, unit, icon: Icon, color }) => (
        <div className={`relative p-5 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col justify-between overflow-hidden group hover:border-${color}-500/50 transition-all`}>

            {/* Watermark Icon */}
            <div className={`absolute top-2 right-2 p-2 opacity-20 text-${color}-500 transition-transform group-hover:scale-110 group-hover:opacity-30`}>
                <Icon size={48} strokeWidth={1.5} />
            </div>

            {/* Header & Main Value */}
            <div className="z-10">
                <div className={`flex items-center gap-2 mb-1`}>
                    <div className={`w-1 h-3 rounded-full bg-${color}-500`}></div>
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">{title}</p>
                </div>
                <h3 className="text-4xl font-black text-white font-mono tracking-tighter mt-1 mb-1">
                    {value} <span className="text-lg text-slate-500 font-normal">{unit}</span>
                </h3>
            </div>

            {/* Footer: Raw vs Calibrated */}
            {rawValue ? (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-1 text-[10px] uppercase tracking-wider font-medium z-10 w-full">
                    <div className="flex justify-between text-slate-500">
                        <span>RAW DATA:</span>
                        <span className="font-mono">{rawValue}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                        <span>CALIBRATED:</span>
                        <span className="font-mono">{value}</span>
                    </div>
                </div>
            ) : (
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-600 uppercase tracking-wider w-full">
                    REAL-TIME METRIC
                </div>
            )}
        </div>
    );

    const renderOverview = () => (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Top Row: Risk Panel & Alert Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <RiskPanel riskLevel={riskLevel} />
                </div>
                <div className="md:col-span-2 space-y-4">
                    {/* Smart Insight Banner */}
                    {(insight || anomaly) && (
                        <div className={`w-full p-4 rounded-xl border flex items-center gap-4 animate-in slide-in-from-top-2 ${anomaly ? 'bg-red-500/10 border-red-500/30 text-red-100' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-100'}`}>
                            <div className={`p-2 rounded-lg ${anomaly ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                {anomaly ? <AlertTriangle size={20} /> : <Brain size={20} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                                    {anomaly ? 'Anomaly Detected' : 'AI Smart Insight'}
                                </h4>
                                <p className="text-sm opacity-90 leading-relaxed font-medium">
                                    {insight || "System behavior is unusual. Check sensors."}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Connection Banner if offline but no data */}
                    {!connectionStatus && (Date.now() - (new Date(latestData.timestamp).getTime() || 0) > 10000) && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Cpu size={20} className="text-emerald-400" />
                                <span className="text-sm font-bold text-slate-300">ESP32 Disconnected</span>
                            </div>
                            <button onClick={connectSerial} className="px-4 py-2 bg-emerald-500 text-black text-xs font-bold rounded hover:bg-emerald-400">
                                CONNECT
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Temperature" value={temp} rawValue={tempRaw} unit="°C" icon={Thermometer} color="emerald" />
                <StatCard title="Humidity" value={hum} rawValue={humRaw} unit="%" icon={Droplets} color="teal" />
                <StatCard title="Gas Level" value={gas} rawValue={gasRaw} unit="PPM" icon={Activity} color="green" />
                <StatCard title="Motion" value={motion} unit="" icon={Zap} color="amber" />
                <StatCard title="Rain Sensor" value={rainStatus} unit="" icon={CloudRain} color="blue" />
                <StatCard title="Trust Score" value={trustScore} unit="%" icon={ShieldCheck} color={trustScore > 80 ? 'emerald' : 'yellow'} />
                <StatCard title="pH Level" value={ph} unit="pH" icon={FlaskConical} color="purple" />
                <StatCard title="Pressure" value={latestData?.pressure || 1013} unit="hPa" icon={Gauge} color="cyan" />
            </div>

            {/* Safety & Trends Grid */}
            {/* Safety & Trends Section */}
            <div className="space-y-6">
                {/* 1. Alerts Banner */}
                <ExplainableAlert currentData={latestData} baselineData={baseline} alertReason={anomaly ? insight : null} />

                {/* 2. Monitors Grid (Restricted | Health | Prediction) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <RestrictedActivity motionDetected={latestData.motion === 1} timestamp={latestData.ts} />
                    <SensorHealth healthData={sensorHealth} />

                    {/* Short Term Prediction Card */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                        <h3 className="text-slate-200 font-bold mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-indigo-400" />
                            Short Term Prediction
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-800/50 rounded-lg">
                                <span className="text-xs text-slate-500 block mb-1">TEMP TREND</span>
                                <span className={`text-lg font-bold ${prediction.temperature === 'Rising' ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {prediction.temperature || 'Stable'}
                                </span>
                            </div>
                            <div className="p-3 bg-slate-800/50 rounded-lg">
                                <span className="text-xs text-slate-500 block mb-1">GAS TREND</span>
                                <span className={`text-lg font-bold ${prediction.gas === 'Rising' ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {prediction.gas || 'Stable'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Trends Graph (Bottom) */}
                <TrendGraph data={sensorData} className="h-[350px]" />
            </div>

            {/* Analysis Charts Grid (Original) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Activity className="text-emerald-500" size={20} />
                                Temperature Analysis (Kalman Filter)
                            </h3>
                            <p className="text-slate-400 text-sm">Real-time noise reduction vs Raw input</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sensorData}>
                                <defs>
                                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Area type="monotone" dataKey="temp_raw" stroke="#64748b" strokeWidth={1} fill="transparent" strokeDasharray="5 5" name="Raw Sensor" />
                                <Area type="monotone" dataKey="temperature" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" name="Filtered" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Wind className="text-indigo-500" size={20} />
                                Humidity Trends
                            </h3>
                            <p className="text-slate-400 text-sm">Environmental moisture tracking</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sensorData}>
                                <defs>
                                    <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Area type="monotone" dataKey="humidity" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorHum)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div >
        </div >
    );

    return (
        <div className="flex h-screen w-full bg-[#022c22] overflow-hidden font-outfit">
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#022c22]/95 border-r border-emerald-500/10 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative lg:w-20 lg:hover:w-64 group flex flex-col items-center py-8`}>
                <div className="mb-12"><Leaf className="text-emerald-400" size={24} /></div>
                <div className="flex-1 w-full space-y-4 px-4">
                    {[
                        { id: 'overview', icon: Activity, label: 'Monitor' },
                        { id: 'news', icon: Newspaper, label: 'Eco-Intel' }
                    ].map(item => (
                        <button key={item.id} onClick={() => setActiveView(item.id)} className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeView === item.id ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-emerald-200'}`}>
                            <item.icon size={24} className="min-w-[24px]" />
                            <span className="lg:opacity-0 lg:group-hover:opacity-100 font-bold whitespace-nowrap transition-opacity">{item.label}</span>
                        </button>
                    ))}
                </div>
                <button onClick={onToggle} className="mt-auto mb-8 p-3 text-emerald-400 border border-emerald-500/30 rounded-xl w-[calc(100%-32px)] flex items-center gap-4 justify-center lg:justify-start px-4 hover:bg-emerald-500/10">
                    <ExternalLink size={24} className="min-w-[24px]" />
                    <span className="lg:opacity-0 lg:group-hover:opacity-100 font-bold whitespace-nowrap transition-opacity">SWITCH MODE</span>
                </button>
            </aside>

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <header className="flex justify-between items-center p-6 border-b border-emerald-500/10 bg-[#022c22]/80 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden text-white" onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu /></button>
                        <div>
                            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500"> 🌥️ S4 LITE</h1>
                            <p className="text-[10px] text-emerald-500/60 font-bold"></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={connectSerial}
                            className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded transition-colors uppercase font-bold tracking-wider flex items-center gap-2"
                        >
                            <Zap size={14} /> {connectionStatus ? 'RECONNECT' : 'CONNECT ESP32'}
                        </button>
                        <div className="flex flex-col items-end">
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black border tracking-widest ${connectionStatus ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : (latestData.timestamp && (Date.now() - new Date(latestData.timestamp).getTime() < 60000)) ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-red-500/20 border-red-500 text-red-400'}`}>
                                {connectionStatus ? 'SERIAL ACTIVE' : (latestData.timestamp && (Date.now() - new Date(latestData.timestamp).getTime() < 60000)) ? 'ONLINE (BRIDGE)' : 'NO DEVICE'}
                            </div>
                            {latestData.timestamp && (
                                <span className="text-[8px] text-slate-500 font-mono mt-1 uppercase">
                                    Last Pulse: {latestData.timestamp}
                                </span>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    {activeView === 'overview' && renderOverview()}
                    {activeView === 'news' && <div className="h-full"><NewsComponent /></div>}
                </main>

                {isDeviceConfigOpen && (
                    <SetupDeviceModal
                        isOpen={isDeviceConfigOpen}
                        onClose={() => setIsDeviceConfigOpen(false)}
                        onPair={connectSerial}
                        connectionStatus={connectionStatus}
                    />
                )}
            </div>
        </div>
    );
};

const AnalysisCard = ({ title, data, dataKey, rawKey, color, icon: Icon, unit }) => {
    return (
        <div className="glass-panel p-6 border-t-2 border-t-emerald-500/20 h-80 flex flex-col relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-8 bg-${color}-500/5 rounded-full -mr-4 -mt-4 blur-3xl`} />
            <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-slate-200 text-sm font-bold flex items-center gap-2 uppercase tracking-widest">
                    <Icon size={16} className={`text-${color}-400`} /> {title} Analysis
                </h3>
            </div>

            <div className="flex-1 min-h-0 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} opacity={0.5} />
                        <XAxis dataKey="timestamp" hide />
                        <YAxis stroke="#34d399" fontSize={10} tick={false} axisLine={false} domain={['auto', 'auto']} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#022c22', borderColor: '#065f46', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)' }}
                            itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                            labelStyle={{ display: 'none' }}
                        />
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color === 'amber' ? '#fbbf24' : color === 'blue' ? '#3b82f6' : '#10b981'}
                            strokeWidth={3}
                            dot={false}
                            name="Filtered"
                            isAnimationActive={false}
                        />
                        <Line
                            type="monotone"
                            dataKey={rawKey}
                            stroke="#ffffff"
                            strokeWidth={1}
                            strokeOpacity={0.2}
                            dot={false}
                            name="Raw (Noisy)"
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="flex justify-start gap-6 mt-6 pt-4 border-t border-slate-800 text-[9px] font-black tracking-[0.2em] uppercase relative z-10">
                <span className="flex items-center gap-2 text-slate-200">
                    <div className={`w-3 h-0.5 ${color === 'amber' ? 'bg-amber-400' : color === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'}`} /> Filtered
                </span>
                <span className="flex items-center gap-2 text-slate-500">
                    <div className="w-3 h-0.5 bg-slate-600" /> Raw (Noisy)
                </span>
            </div>
        </div>
    );
};

const SetupDeviceModal = ({ isOpen, onClose, onPair, connectionStatus }) => {
    const [step, setStep] = useState(1);

    const arduinoCode = `#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  
  if (!isnan(h) && !isnan(t)) {
    Serial.print("{\\"temperature\\":");
    Serial.print(t);
    Serial.print(",\\"humidity\\":");
    Serial.print(h);
    Serial.print(",\\"pm25\\":");
    Serial.print(random(10, 30)); // Placeholder for MQ sensor
    Serial.println("}");
  }
  delay(2000);
}`;

    const copyCode = () => {
        navigator.clipboard.writeText(arduinoCode);
        alert("Code copied to clipboard!");
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="glass-panel w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-emerald-500/20 flex justify-between items-center bg-emerald-950/20">
                    <h2 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <Cpu className="text-emerald-400" /> ESP32 SETUP WIZARD
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X /></button>
                </div>

                <div className="p-8 overflow-y-auto space-y-8">
                    {/* Breadcrumbs */}
                    <div className="flex justify-between relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${step >= i ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                                {i}
                            </div>
                        ))}
                    </div>

                    {step === 1 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            <h3 className="text-lg font-bold text-white uppercase">Step 1: Hardware Connection</h3>
                            <p className="text-slate-400 text-sm">Connect your ESP32 to your computer using a high-quality USB-C or Micro-USB data cable.</p>
                            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex justify-center">
                                <div className="text-emerald-500/50 flex flex-col items-center gap-2">
                                    <Zap size={48} className="animate-pulse" />
                                    <span className="text-[10px] tracking-widest uppercase">Awaiting Physical Link</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            <h3 className="text-lg font-bold text-white uppercase">Step 2: Flash Firmware</h3>
                            <p className="text-slate-400 text-sm">Copy the code below into your Arduino IDE and upload it to your device.</p>
                            <div className="relative group">
                                <pre className="bg-slate-950 p-4 rounded-lg font-mono text-[10px] text-emerald-400 overflow-x-auto max-h-48 border border-slate-800">
                                    {arduinoCode}
                                </pre>
                                <button onClick={copyCode} className="absolute top-2 right-2 p-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded text-[10px] font-bold uppercase transition-colors">Copy Code</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 text-center">
                            <h3 className="text-lg font-bold text-white uppercase">Step 3: Pair & Stream</h3>
                            <p className="text-slate-400 text-sm">Click the button below to authorize the browser to access your ESP32's serial port.</p>

                            <div className="flex flex-col items-center gap-4">
                                <button
                                    onClick={() => { onPair(); if (connectionStatus) onClose(); }}
                                    className={`px-8 py-4 rounded-xl font-black text-lg transition-all flex items-center gap-3 ${connectionStatus ? 'bg-emerald-500 text-black' : 'bg-transparent border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10'}`}
                                >
                                    {connectionStatus ? <><Shield size={24} /> DEVICE ACTIVE</> : <><Zap size={24} /> INITIALIZE PAIRING</>}
                                </button>
                                {connectionStatus && <p className="text-emerald-500 text-xs font-bold animate-pulse tracking-widest">REAL-TIME DATA LINK ESTABLISHED</p>}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-emerald-500/20 flex justify-between">
                    <button
                        disabled={step === 1}
                        onClick={() => setStep(s => s - 1)}
                        className="px-6 py-2 text-slate-400 hover:text-white disabled:opacity-0 transition-opacity uppercase font-bold text-xs"
                    >
                        Back
                    </button>
                    {step < 3 ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold uppercase text-xs transition-colors"
                        >
                            Next Step
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded font-bold uppercase text-xs transition-colors"
                        >
                            Done
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LightDashboard;
