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
                    <button
                        onClick={connectSerial}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <Zap size={18} /> PAIR DEVICE
                    </button>
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
                        { id: 'map', icon: MapIcon, label: 'Geo-Map' },
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
                    {activeView === 'map' && <div className="h-full rounded-xl overflow-hidden border border-white/5"><MapComponent /></div>}
                    {activeView === 'news' && <div className="h-full"><NewsComponent /></div>}
                </main>
            </div>
        </div>
    );
};

export default LightDashboard;
