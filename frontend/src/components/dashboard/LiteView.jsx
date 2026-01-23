import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Thermometer, Droplets, Wind, Activity, Zap, Wifi, AlertTriangle, Battery } from 'lucide-react';
import { useEsp32Stream } from '../../hooks/useEsp32Stream';

// --- Widget: Environmental Pulse (Radar) ---
const EnvironmentalPulse = ({ data }) => {
    if (!data) return null;

    const pulseData = [
        { subject: 'PM2.5', A: Math.min(data.mq_ppm || 0, 100), fullMark: 100 },
        { subject: 'Temp', A: Math.min((data.temperature || 0) * 2, 100), fullMark: 100 },
        { subject: 'Hum', A: data.humidity || 0, fullMark: 100 },
        { subject: 'Signal', A: Math.min(Math.abs(data.rssi + 100) * 2, 100), fullMark: 100 },
        { subject: 'Volt', A: data.battery || 0, fullMark: 100 },
    ];

    return (
        <div className="glass-panel p-6 flex flex-col items-center justify-center relative overflow-hidden h-[340px]">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 absolute top-6 left-6">
                Environmental Pulse
            </h3>
            <div className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={pulseData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Env" dataKey="A" stroke="#06b6d4" strokeWidth={2} fill="#06b6d4" fillOpacity={0.3} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
            {/* Status Indicator */}
            <div className="absolute bottom-6 flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/30 px-3 py-1 rounded-full border border-cyan-500/20">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                LIVE SENSORS
            </div>
        </div>
    );
};

const LiveTile = ({ label, value, unit, icon: Icon, color, subtext }) => (
    <div className="glass-panel p-4 flex flex-col justify-between h-32 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 p-12 bg-${color}-500/5 rounded-full -mr-6 -mt-6 blur-2xl transition-all group-hover:bg-${color}-500/10`} />
        <div className="flex justify-between items-start relative z-10">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{label}</span>
            <Icon size={18} className={`text-${color}-400`} />
        </div>
        <div className="relative z-10">
            <h4 className="text-3xl font-black text-white font-mono">{value} <span className="text-sm font-normal text-slate-500">{unit}</span></h4>
            {subtext && <p className="text-[10px] text-slate-500 mt-1">{subtext}</p>}
        </div>
    </div>
);

const LiteView = () => {
    const { connected, lastSeen, data, history, alerts } = useEsp32Stream();

    if (!data) return (
        <div className="flex flex-col items-center justify-center h-[50vh] animate-pulse">
            <Wifi size={48} className="text-slate-600 mb-4" />
            <p className="text-slate-500 font-mono text-sm animate-pulse">WAITING FOR DEVICE CONNECTION...</p>
        </div>
    );

    // Stale Check (5s)
    const isStale = (Date.now() - lastSeen) > 5000;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Connection Bar */}
            <div className="flex flex-wrap justify-between items-end gap-4">
                <div>
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        LITE MONITOR
                    </h2>
                    <p className="text-slate-400 text-xs font-mono mt-1">
                        DEVICE ID: <span className="text-slate-200">{data.deviceId}</span>
                    </p>
                </div>

                <div className={`px-4 py-2 rounded-lg border flex items-center gap-3 backdrop-blur-md transition-colors ${!connected ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                    isStale ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                        'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                    <Wifi size={16} className={!isStale && connected ? 'animate-pulse' : ''} />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold tracking-widest leading-none mb-0.5">STATUS</span>
                        <span className="text-xs font-mono font-bold leading-none">
                            {!connected ? 'DISCONNECTED' : isStale ? 'STALE CONNECTION' : 'ONLINE'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Threshold Alerts (Explainable) */}
            {alerts.length > 0 && (
                <div className="space-y-2">
                    {alerts.map((alert, i) => (
                        <div key={i} className="bg-red-500/10 border border-red-500/20 p-3 rounded flex items-start gap-3 text-red-200 text-sm">
                            <AlertTriangle size={16} className="text-red-500 mt-1" />
                            <div>
                                <span className="font-bold block">{alert.msg}</span>
                                {alert.reason && <span className="text-xs text-red-300/70">{alert.reason}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Pulse */}
                <div className="lg:col-span-1">
                    <EnvironmentalPulse data={data} />
                </div>

                {/* Right: Tiles & Metrics */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-4">
                        <LiveTile
                            label="Temperature"
                            value={data.temperature.toFixed(1)}
                            unit="°C"
                            icon={Thermometer}
                            color="cyan"
                        />
                        <LiveTile
                            label="Humidity"
                            value={data.humidity.toFixed(1)}
                            unit="%"
                            icon={Droplets}
                            color="blue"
                        />
                        <LiveTile
                            label="Air Quality"
                            value={data.mq_ppm.toFixed(1)}
                            unit="PPM"
                            icon={Activity}
                            color={data.mq_ppm > 50 ? 'red' : 'emerald'}
                            subtext={`Raw: ${data.mq_raw.toFixed(0)}`}
                        />

                        {/* Trust Score Widget (New Feature) */}
                        <div className="glass-panel p-4 flex flex-col justify-between h-32 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">TRUST SCORE</span>
                                <Zap size={18} className="text-yellow-400" />
                            </div>
                            <div className="flex items-end gap-2">
                                <span className={`text-4xl font-black font-mono ${data.trustScore > 90 ? 'text-emerald-400' :
                                    data.trustScore > 70 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                    {data.trustScore}%
                                </span>
                                <span className="text-[10px] bg-slate-800 px-2 py-1 rounded border border-slate-700 text-slate-400 mb-2">
                                    {data.trustScore > 90 ? 'LAB GRADE' : 'CONSUMER'}
                                </span>
                            </div>
                            <div className="w-full bg-slate-800 h-1 mt-2 rounded-full overflow-hidden">
                                <div className={`h-full ${data.trustScore > 90 ? 'bg-emerald-500' : 'bg-yellow-500'}`} style={{ width: `${data.trustScore}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Connection Config (New) */}
            <div className="glass-panel p-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                    <Wifi size={18} className="text-cyan-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Device Connection Setup</h3>
                </div>
                <ConnectionConfig />
            </div>
        </div>
    );
};

const ConnectionConfig = () => {
    const [ip, setIp] = React.useState('');
    const [ssid, setSsid] = React.useState('');
    const [status, setStatus] = React.useState('IDLE'); // IDLE, SAVING, SAVED, ERROR

    const handleSave = async () => {
        setStatus('SAVING');
        try {
            // Mock API call - In real scenario this would POST to /api/config/target
            console.log("Configuring ESP32 target:", ip, ssid);
            await new Promise(r => setTimeout(r, 1000));
            setStatus('SAVED');
            setTimeout(() => setStatus('IDLE'), 3000);
        } catch (e) {
            setStatus('ERROR');
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
                <label className="text-xs text-slate-400 font-mono mb-1 block">ESP32 IP ADDRESS</label>
                <input
                    type="text"
                    value={ip}
                    onChange={e => setIp(e.target.value)}
                    placeholder="192.168.1.100"
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded px-3 py-2 text-sm text-cyan-200 focus:outline-none focus:border-cyan-500/50 font-mono"
                />
            </div>
            <div>
                <label className="text-xs text-slate-400 font-mono mb-1 block">WIFI SSID</label>
                <input
                    type="text"
                    value={ssid}
                    onChange={e => setSsid(e.target.value)}
                    placeholder="Home_Network_2G"
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded px-3 py-2 text-sm text-cyan-200 focus:outline-none focus:border-cyan-500/50 font-mono"
                />
            </div>
            <button
                onClick={handleSave}
                disabled={status === 'SAVING' || !ip}
                className={`h-[38px] px-6 rounded font-bold text-xs tracking-widest transition-all ${status === 'SAVED' ? 'bg-emerald-500 text-black' :
                        status === 'ERROR' ? 'bg-red-500 text-white' :
                            'bg-cyan-500 hover:bg-cyan-400 text-black'
                    }`}
            >
                {status === 'SAVING' ? 'CONNECTING...' :
                    status === 'SAVED' ? 'CONNECTED!' :
                        status === 'ERROR' ? 'FAILED' : 'CONNECT DEVICE'}
            </button>
        </div>
    );
};

export default LiteView;
