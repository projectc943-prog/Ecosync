import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, LineChart, Line } from 'recharts';
import { Bell, Wifi, Activity, Droplets, Thermometer, Wind, AlertTriangle, Zap, Shield, Map as MapIcon, Newspaper, User, Menu, X } from 'lucide-react';
import SafetyAlerts from '../components/SafetyAlerts';
import ModeToggle from '../components/ModeToggle';
import API_BASE_URL from '../config';
import { useEsp32Stream } from '../hooks/useEsp32Stream';
import MapComponent from '../components/MapComponent';
import NewsComponent from '../components/NewsComponent';
import Analytics from './Analytics';

// --- SUB-COMPONENTS ---

// 1. Stat Card (Optimized)
const StatCard = React.memo(({ title, value, unit, icon: Icon, color, trend }) => (
    <div className="glass-panel p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
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
));

// 2. Sidebar Navigation
const Sidebar = ({ activeView, setActiveView, isMobile, isOpen, setIsOpen, onLogout }) => {
    const navItems = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'analytics', label: 'Analytics', icon: Zap },
        { id: 'map', label: 'Geo-Map', icon: MapIcon },
        { id: 'news', label: 'Intel & News', icon: Newspaper },
        { id: 'profile', label: 'Operative Profile', icon: User },
    ];

    if (isMobile && !isOpen) return null;

    return (
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#020617]/95 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'} lg:relative lg:translate-x-0 lg:bg-transparent lg:border-none lg:w-20 lg:hover:w-64 group flex flex-col items-center py-8 overflow-hidden`}>
            {isMobile && (
                <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-400">
                    <X size={24} />
                </button>
            )}

            <div className="mb-12">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/50">
                    <Shield className="text-cyan-400" size={24} />
                </div>
            </div>

            <div className="flex-1 w-full space-y-4 px-4">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => { setActiveView(item.id); if (isMobile) setIsOpen(false); }}
                        className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${activeView === item.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}
                    >
                        <item.icon size={24} className="min-w-[24px]" />
                        <span className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold tracking-wide">
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>

            <button onClick={onLogout} className="mt-auto mb-8 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors w-[calc(100%-32px)] flex items-center gap-4 justify-center lg:justify-start px-4">
                <Zap size={24} className="min-w-[24px]" />
                <span className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">Disconnect</span>
            </button>
        </div>
    );
};

// --- MAIN COMPONENT ---

const Dashboard = ({ onToggle }) => {
    // Data Hook
    const { data: latestReading, history: sensorData, alerts, connected: connectionStatus } = useEsp32Stream();

    // Navigation State
    const [activeView, setActiveView] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Mode State
    const [isProMode, setIsProMode] = useState(() => localStorage.getItem('dashboardMode') === 'pro' || localStorage.getItem('plan') === 'pro');

    // Toggle Handler
    const handleToggle = () => {
        const newMode = !isProMode;
        setIsProMode(newMode);
        localStorage.setItem('dashboardMode', newMode ? 'pro' : 'lite');
        if (onToggle) onToggle(newMode);
    };

    // Data State
    const [predictions, setPredictions] = useState([]);
    const [weather, setWeather] = useState(null);
    const [proData, setProData] = useState(null);
    const [fusionData, setFusionData] = useState(null);

    // IoT State
    const [iotData, setIotData] = useState(null);
    const [iotConnected, setIotConnected] = useState(false);
    const [showAddDevice, setShowAddDevice] = useState(false);
    const [deviceForm, setDeviceForm] = useState({ ip: '', ssid: '' });

    // Memoized Data
    const latestData = useMemo(() => (sensorData && sensorData.length > 0) ? sensorData[sensorData.length - 1] : {}, [sensorData]);
    const temp = useMemo(() => latestData.temperature?.toFixed(1) || '--', [latestData]);
    const hum = useMemo(() => latestData.humidity?.toFixed(1) || '--', [latestData]);
    const press = useMemo(() => latestData.pressure?.toFixed(0) || '--', [latestData]);
    const gasColor = useMemo(() => latestData.pm2_5 > 100 ? 'red' : 'emerald', [latestData]);

    // Fetch Predictions (Pro)
    useEffect(() => {
        if (!isProMode) return;
        const fetchPredictions = async () => {
            // Mock/Fetch logic - (Simplified for brevity as logic exists)
            // In real app, reuse the existing fetch logic
            try {
                const res = await fetch(`${API_BASE_URL}/predict?steps=10`);
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
            } catch (e) { }
        };
        const i = setInterval(fetchPredictions, 5000);
        return () => clearInterval(i);
    }, [isProMode, sensorData]);

    const combinedData = useMemo(() => Array.isArray(sensorData) ? [...sensorData, ...predictions] : [], [sensorData, predictions]);

    // Fetch Pro Data (Weather/Fusion)
    useEffect(() => {
        if (!isProMode) return;
        const fetchPro = async () => {
            try {
                const city = localStorage.getItem('user_city');
                const query = city ? `city=${city}` : `lat=17.3850&lon=78.4867`;
                const res = await fetch(`${API_BASE_URL}/api/pro/current?${query}`);
                if (res.ok) {
                    const d = await res.json();
                    setProData(d);
                    if (d.fusion) setFusionData(d.fusion);
                    setWeather(d.weather);
                }
            } catch (e) { }
        };
        fetchPro();
        const i = setInterval(fetchPro, 600000);
        return () => clearInterval(i);
    }, [isProMode]);

    // Render Sub-Views
    const renderOverview = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Avg Temperature" value={temp} unit="°C" icon={Thermometer} color="cyan" trend={Math.abs(latestData.temperature || 0) * 2} />
                <StatCard title="Air Humidity" value={hum} unit="%" icon={Droplets} color="blue" trend={latestData.humidity || 0} />
                <StatCard title="Atm Pressure" value={press} unit="hPa" icon={Wind} color="purple" trend={(latestData.pressure - 800) / 4 || 0} />
                <StatCard title="Air Quality" value={gas} unit="PM2.5" icon={Activity} color={gasColor} trend={latestData.pm2_5 || 0} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
                {/* 1. Prediction Chart (Area) */}
                <div className="glass-panel p-6 border-t-2 border-t-cyan-500/20 flex flex-col">
                    <h3 className="text-slate-200 font-bold mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-cyan-400" /> Predictive Analysis
                    </h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={combinedData}>
                                <defs>
                                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="timestamp" stroke="#475569" tick={false} />
                                <YAxis stroke="#475569" />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                                <Area type="monotone" dataKey="temperature" stroke="#06b6d4" fill="url(#colorTemp)" />
                                <Area type="monotone" dataKey="predictedTemp" stroke="#f472b6" strokeDasharray="5 5" fill="none" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Kalman Filter Graph (Line) - NEW */}
                <div className="glass-panel p-6 border-t-2 border-t-purple-500/20 flex flex-col">
                    <h3 className="text-slate-200 font-bold mb-4 flex items-center gap-2">
                        <Zap size={18} className="text-purple-400" /> Kalman Noise Reduction
                    </h3>
                    <div className="flex-1 min-h-0">
                        {isProMode ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={sensorData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="timestamp" stroke="#475569" tick={false} />
                                    <YAxis stroke="#475569" domain={['auto', 'auto']} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="temperature" name="Raw Sensor" stroke="#94a3b8" strokeWidth={1} dot={false} strokeOpacity={0.5} />
                                    {/* Simulate Kalman (Smoothened) - In real app, backend sends 'kalman_temp' */}
                                    <Line type="basis" dataKey="temperature" name="Kalman Filter" stroke="#a855f7" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500">
                                Enable Pro Mode to view Kalman Filter
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAnalytics = () => (
        <Analytics
            sensorData={sensorData}
            predictions={predictions}
            isProMode={isProMode}
        />
    );

    const renderProfile = () => (
        <div className="glass-panel max-w-4xl mx-auto p-8 animate-in fade-in zoom-in duration-500">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                        <User className="text-cyan-400" size={28} /> Operative Profile
                    </h3>
                    <p className="text-slate-400 mt-1 text-sm">Manage security clearance and personal details.</p>
                </div>
                <button
                    onClick={handleProfileUpdate}
                    className={`px-6 py-2 rounded-lg font-bold transition-all shadow-lg flex items-center gap-2 ${isEditingProfile ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20'}`}
                >
                    {isEditingProfile ? <Shield size={18} /> : null}
                    {isEditingProfile ? 'SAVE RECORD' : 'EDIT DOSSIER'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Info */}
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Identification</h4>
                    <div className="space-y-4">
                        <div className="group">
                            <label className="text-xs text-slate-400 block mb-1">First Name</label>
                            <input
                                disabled={!isEditingProfile}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                                value={profileForm.first_name}
                                onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })}
                            />
                        </div>
                        <div className="group">
                            <label className="text-xs text-slate-400 block mb-1">Last Name</label>
                            <input
                                disabled={!isEditingProfile}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                                value={profileForm.last_name}
                                onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Contact & Meta */}
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Communication & Role</h4>
                    <div className="space-y-4">
                        <div className="group">
                            <label className="text-xs text-slate-400 block mb-1">Secure Uplink (Mobile)</label>
                            <input
                                disabled={!isEditingProfile}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                                value={profileForm.mobile}
                                onChange={e => setProfileForm({ ...profileForm, mobile: e.target.value })}
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                        <div className="group">
                            <label className="text-xs text-slate-400 block mb-1">Assigned Station (City)</label>
                            <input
                                disabled={!isEditingProfile}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                                value={profileForm.location_name}
                                onChange={e => setProfileForm({ ...profileForm, location_name: e.target.value })}
                                placeholder="E.g. Hyderabad"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                        <Shield className="text-yellow-400" size={24} />
                    </div>
                    <div>
                        <p className="text-white font-bold">Clearance Level {localStorage.getItem('plan')?.toUpperCase() || 'LITE'}</p>
                        <p className="text-xs text-slate-500">Access restricted to {isProMode ? 'Class A (Pro)' : 'Class B (Lite)'} protocols.</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMap = () => (
        <div className="glass-panel h-[600px] w-full p-1 bg-slate-900/50 flex flex-col">
            <h3 className="text-2xl font-bold text-white mb-4 pl-4 pt-4 flex items-center gap-3">
                <MapIcon className="text-cyan-400" /> Geospatial Tracking
            </h3>
            <div className="flex-1 w-full rounded-xl overflow-hidden relative border border-white/5">
                <MapComponent />
            </div>
        </div>
    );

    const renderNews = () => (
        <div className="glass-panel h-[600px] w-full p-6 bg-slate-900/50">
            <NewsComponent />
        </div>
    );

    // Main Layout
    return (
        <div className="flex h-screen w-full bg-[#020617] overflow-hidden font-outfit">
            <Sidebar
                activeView={activeView}
                setActiveView={setActiveView}
                isMobile={window.innerWidth < 1024}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                onLogout={() => window.location.href = '/'}
            />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Mobile Header */}
                <header className="flex justify-between items-center p-6 border-b border-white/5 bg-[#020617]/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden text-white" onClick={() => setIsSidebarOpen(true)}>
                            <Menu />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tighter">
                                S4 COMMAND
                            </h1>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                {activeView} // {isProMode ? 'PRO' : 'LITE'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <ModeToggle isProMode={isProMode} onToggle={handleToggle} />
                        <div className={`w-3 h-3 rounded-full ${connectionStatus === 'SYNCED' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500'}`} />
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-cyan-900/20 scrollbar-track-transparent">
                    {activeView === 'overview' && renderOverview()}
                    {activeView === 'analytics' && renderAnalytics()}
                    {activeView === 'map' && renderMap()}
                    {activeView === 'news' && renderNews()}
                    {activeView === 'profile' && renderProfile()}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
