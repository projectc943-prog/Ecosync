import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { Bell, Wifi, Activity, Droplets, Thermometer, Wind, Zap, Map as MapIcon, Newspaper, User, Menu, X, Leaf, Shield, Cpu, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEsp32Stream } from '../hooks/useEsp32Stream';
import MapComponent from '../components/MapComponent';
import NewsComponent from '../components/NewsComponent';
import Analytics from './Analytics';

const LightDashboard = ({ onToggle }) => {
    const { logout, userProfile, currentUser } = useAuth();
    const { data: latestReading, history: sensorData, connected: connectionStatus, connectSerial } = useEsp32Stream('light');

    const [activeView, setActiveView] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDeviceConfigOpen, setIsDeviceConfigOpen] = useState(false);

    // Memoized Data
    const latestData = useMemo(() => (sensorData && sensorData.length > 0) ? sensorData[sensorData.length - 1] : {}, [sensorData]);
    const temp = useMemo(() => latestData.temperature?.toFixed(1) || '0', [latestData]);
    const hum = useMemo(() => latestData.humidity?.toFixed(1) || '0', [latestData]);
    const press = useMemo(() => latestData.pressure?.toFixed(0) || '0', [latestData]);
    const gas = useMemo(() => latestData.pm25?.toFixed(0) || '0', [latestData]);

    // Stat Card
    const StatCard = ({ title, value, unit, icon: Icon, color }) => (
        <div className={`p-6 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col items-center text-center hover:border-${color}-500/50 transition-colors`}>
            <div className={`p-3 rounded-full mb-3 bg-${color}-500/10 text-${color}-400`}>
                <Icon size={24} />
            </div>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">{title}</p>
            <h3 className="text-3xl font-black text-white font-mono tracking-tighter">
                {value} <span className="text-sm text-slate-500 font-normal">{unit}</span>
            </h3>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Temperature" value={temp} unit="°C" icon={Thermometer} color="emerald" />
                <StatCard title="Humidity" value={hum} unit="%" icon={Droplets} color="teal" />
                <StatCard title="Pressure" value={press} unit="hPa" icon={Wind} color="cyan" />
                <StatCard title="Air Quality" value={gas} unit="PM2.5" icon={Activity} color="green" />
            </div>

            {/* Live Chart */}
            <div className="glass-panel p-6 border-t-2 border-t-emerald-500/20 h-96 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-slate-200 font-bold flex items-center gap-2">
                        <Activity size={18} className="text-emerald-400" /> Live Sensor Feed
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <div className={`w-2 h-2 rounded-full ${connectionStatus ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        {connectionStatus ? 'LIVE STREAM' : 'OFFLINE'}
                    </div>
                </div>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sensorData}>
                            <defs>
                                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" />
                            <XAxis dataKey="timestamp" stroke="#34d399" tick={false} />
                            <YAxis stroke="#34d399" />
                            <Tooltip contentStyle={{ backgroundColor: '#022c22', borderColor: '#065f46', borderRadius: '12px' }} itemStyle={{ color: '#34d399' }} />
                            <Area type="monotone" dataKey="temperature" stroke="#10b981" fill="url(#colorTemp)" />
                        </AreaChart>
                    </ResponsiveContainer>
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
                        // Map removed for Lite Mode
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
                            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">S4 LITE</h1>
                            <p className="text-[10px] text-emerald-500/60 font-bold">DIRECT LINK // INDIA</p>
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
                    {/* Map Removed for Lite Mode */}
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
