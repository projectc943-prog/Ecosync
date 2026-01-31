import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { Bell, Wifi, Activity, Droplets, Thermometer, Wind, Zap, Map as MapIcon, Newspaper, User, Menu, X, Leaf, Shield, Cpu, ExternalLink, CloudRain } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEsp32Stream } from '../hooks/useEsp32Stream';
import NewsComponent from '../components/NewsComponent';

const LightDashboard = ({ onToggle }) => {
    const { logout, userProfile, currentUser } = useAuth();
    const { data: latestReading, history: sensorData, connected: connectionStatus, connectSerial } = useEsp32Stream('light');

    const [activeView, setActiveView] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDeviceConfigOpen, setIsDeviceConfigOpen] = useState(false);

    // Memoized Data
    // Memoized Data
    const latestData = useMemo(() => (sensorData && sensorData.length > 0) ? sensorData[sensorData.length - 1] : {}, [sensorData]);
    const temp = useMemo(() => latestData.temperature?.toFixed(1) || '0', [latestData]);
    const tempRaw = useMemo(() => latestData.temp_raw?.toFixed(1) || '0', [latestData]);

    const hum = useMemo(() => latestData.humidity?.toFixed(1) || '0', [latestData]);
    const humRaw = useMemo(() => latestData.hum_raw?.toFixed(1) || '0', [latestData]);

    const press = useMemo(() => latestData.pressure?.toFixed(0) || '0', [latestData]);
    const pressRaw = useMemo(() => latestData.pressure?.toFixed(0) || '0', [latestData]); // Assuming raw=calibrated for pressure currently

    const gas = useMemo(() => latestData.gas?.toFixed(0) || '0', [latestData]);
    const gasRaw = useMemo(() => latestData.mq_raw?.toFixed(0) || '0', [latestData]); // mq_raw maps to gasRaw

    const motion = useMemo(() => latestData.motion === 1 ? 'DETECTED' : 'CLEAR', [latestData]);
    const rainPrediction = useMemo(() => {
        const p = parseFloat(press);
        if (p < 1000) return 'RAINY';
        if (p > 1020) return 'CLEAR';
        return 'CLOUDY';
    }, [press]);

    // Stat Card
    // Stat Card - Redesigned to match reference (Left aligned, watermark icon, footer)
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
            {rawValue && rawValue !== '0' && (
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
            )}

            {/* Show simple footer if no raw data */}
            {(!rawValue || rawValue === '0') && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-600 uppercase tracking-wider w-full">
                    REAL-TIME METRIC
                </div>
            )}
        </div>
    );

    const renderOverview = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Device Connection Banner */}
            {!connectionStatus && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-400 animate-pulse">
                            <Cpu size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Connect Your ESP32</h3>
                            <p className="text-sm text-slate-400">Connect via USB to view real-time metrics on this dashboard.</p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3">
                        <button
                            onClick={connectSerial}
                            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                        >
                            <Zap size={18} /> PAIR DEVICE
                        </button>
                        <button
                            onClick={() => setIsDeviceConfigOpen(true)}
                            className="px-6 py-3 bg-transparent border-2 border-emerald-500/30 hover:border-emerald-500 text-emerald-400 font-bold rounded-lg flex items-center gap-2 transition-all"
                        >
                            <Cpu size={18} /> SET UP DEVICE
                        </button>
                    </div>
                </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                <StatCard title="Temperature" value={temp} rawValue={tempRaw} unit="°C" icon={Thermometer} color="emerald" />
                <StatCard title="Humidity" value={hum} rawValue={humRaw} unit="%" icon={Droplets} color="teal" />
                <StatCard title="Pressure" value={press} rawValue={pressRaw} unit="hPa" icon={Wind} color="cyan" />
                <StatCard title="Gas Level" value={gas} rawValue={gasRaw} unit="PPM" icon={Activity} color="green" />
                <StatCard title="Motion" value={motion} unit="" icon={Zap} color="amber" />
                <StatCard title="Rain Forecast" value={rainPrediction} unit="" icon={CloudRain} color="blue" />
            </div>

            {/* Analysis Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <AnalysisCard
                    title="Temperature"
                    unit="°C"
                    data={sensorData}
                    dataKey="temperature"
                    rawKey="temp_raw"
                    color="amber"
                    icon={Thermometer}
                />
                <AnalysisCard
                    title="Humidity"
                    unit="%"
                    data={sensorData}
                    dataKey="humidity"
                    rawKey="hum_raw"
                    color="blue"
                    icon={Droplets}
                />
                <AnalysisCard
                    title="Gas"
                    unit="PPM"
                    data={sensorData}
                    dataKey="gas"
                    rawKey="mq_raw"
                    color="emerald"
                    icon={Activity}
                />
            </div>

            {/* Signal Processing Info */}
            <div className="glass-panel p-6 border-l-4 border-l-emerald-500 bg-emerald-500/5">
                <div className="flex gap-4 items-start">
                    <Shield className="text-emerald-400 mt-1" size={24} />
                    <div>
                        <h4 className="text-white font-bold uppercase tracking-widest text-sm">Bio-Digital Signal Processing Active</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            Incoming sensor signals are being processed through a real-time EMA (Exponential Moving Average) filter to ensure precision analysis and noise reduction from the hardware link.
                        </p>
                    </div>
                </div>
            </div>
        </div>
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
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${connectionStatus ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-red-500/20 border-red-500 text-red-400'}`}>
                            {connectionStatus ? 'CONNECTED' : 'NO DEVICE'}
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
