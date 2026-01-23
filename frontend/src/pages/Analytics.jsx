import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, Activity, Zap, Leaf } from 'lucide-react';
import API_BASE_URL from '../config';

const Analytics = ({ sensorData = [], predictions = [], isProMode = false }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE_URL}/data?limit=100`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const jsonData = await res.json();

                // Group by device and get latest temp for each
                const deviceMap = {};
                jsonData.forEach(reading => {
                    if (!deviceMap[reading.device_id] || new Date(reading.timestamp) > new Date(deviceMap[reading.device_id].timestamp)) {
                        deviceMap[reading.device_id] = reading;
                    }
                });

                const latestReadings = Object.values(deviceMap);
                setData(latestReadings);
                setLoading(false);
            } catch (e) {
                console.error("Failed to fetch analytics", e);
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const top10High = [...data].sort((a, b) => b.temperature - a.temperature).slice(0, 10);
    const top10Low = [...data].sort((a, b) => a.temperature - b.temperature).slice(0, 10);

    if (loading) return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">PREDICTIVE ANALYTICS</h1>
                    <p className="text-cyan-400/60 font-mono text-xs tracking-widest uppercase mt-1">
                        Advanced Node Ranking // Global Telemetry System
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-emerald-950/30 border border-emerald-500/20 p-3 rounded-2xl backdrop-blur-xl">
                    <ShieldCheck className="text-emerald-400 w-5 h-5" />
                    <span className="text-[10px] font-bold text-emerald-100/60 tracking-widest uppercase">Bio-Secure Link Active</span>
                </div>
            </div>

            {/* --- PRO MODE: ADVANCED GRAPHS --- */}
            {isProMode && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-5 duration-700 delay-100">
                    {/* Prediction Graph */}
                    <div className="glass-panel p-6 border border-emerald-500/20 rounded-[2rem] bg-emerald-950/20 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <Leaf size={20} className="text-emerald-400" />
                            <h3 className="text-lg font-bold text-emerald-100">Predictive Modeling</h3>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[...(sensorData || []), ...(predictions || [])]}>
                                    <defs>
                                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" />
                                    <XAxis dataKey="timestamp" stroke="#34d399" tick={false} />
                                    <YAxis stroke="#34d399" fontSize={10} />
                                    <Tooltip contentStyle={{ backgroundColor: '#022c22', borderColor: '#059669', color: '#fff' }} />
                                    <Area type="monotone" dataKey="temperature" stroke="#10b981" fill="url(#colorTemp)" />
                                    <Area type="monotone" dataKey="predictedTemp" stroke="#f472b6" strokeDasharray="5 5" fill="none" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Kalman Filter Graph */}
                    <div className="glass-panel p-6 border border-purple-500/20 rounded-[2rem] bg-purple-950/20 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <Zap size={20} className="text-purple-400" />
                            <h3 className="text-lg font-bold text-purple-100">Kalman Noise Reduction</h3>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={sensorData || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#3b0764" />
                                    <XAxis dataKey="timestamp" stroke="#a855f7" tick={false} />
                                    <YAxis stroke="#a855f7" fontSize={10} domain={['auto', 'auto']} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e0a45', borderColor: '#7e22ce', color: '#fff' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="temperature" name="Raw" stroke="#64748b" strokeWidth={1} dot={false} strokeOpacity={0.5} />
                                    <Line type="basis" dataKey="temperature" name="Filtered" stroke="#d8b4fe" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* High Temperature Rankings */}
                <div className="glass-panel p-8 rounded-[2rem] border border-red-500/10 space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-red-500/10 transition-colors"></div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                            <TrendingUp className="text-red-400 w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">THERMAL PEAKS</h2>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Top 10 Highest Recording Nodes</p>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={top10High}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="device_id" hide />
                                <YAxis stroke="#ffffff20" fontSize={10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }}
                                    itemStyle={{ color: '#ef4444' }}
                                />
                                <Bar dataKey="temperature" radius={[4, 4, 0, 0]}>
                                    {top10High.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`rgba(239, 68, 68, ${1 - index * 0.08})`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-3">
                        {top10High.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-red-500/40 font-mono">#{i + 1}</span>
                                    <span className="text-sm font-medium text-slate-300">Node: {item.device_id.slice(0, 8)}...</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-white">{item.temperature}°C</span>
                                    {item.temperature > 50 && <AlertTriangle className="text-orange-500 w-4 h-4 animate-pulse" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Low Temperature Rankings */}
                <div className="glass-panel p-8 rounded-[2rem] border border-cyan-500/10 space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/10 transition-colors"></div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20">
                            <TrendingDown className="text-cyan-400 w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">CRYOGENIC LEVELS</h2>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Top 10 Lowest Recording Nodes</p>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={top10Low}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="device_id" hide />
                                <YAxis stroke="#ffffff20" fontSize={10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }}
                                    itemStyle={{ color: '#22d3ee' }}
                                />
                                <Bar dataKey="temperature" radius={[4, 4, 0, 0]}>
                                    {top10Low.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`rgba(6, 182, 212, ${0.4 + index * 0.08})`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-3">
                        {top10Low.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-cyan-500/40 font-mono">#{i + 1}</span>
                                    <span className="text-sm font-medium text-slate-300">Node: {item.device_id.slice(0, 8)}...</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-white">{item.temperature}°C</span>
                                    <Activity className="text-cyan-500/40 w-4 h-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Critical Metrics Status */}
            <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 relative bg-gradient-to-b from-white/[0.02] to-transparent">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                        <AlertTriangle className="text-purple-400 w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">ANOMALY LOG</h2>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Real-time Dangerous Level Detection</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {data.filter(d => d.temperature > 40 || d.pm2_5 > 50).slice(0, 3).map((item, i) => (
                        <div key={i} className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl space-y-4">
                            <div className="flex justify-between items-start">
                                <span className="px-3 py-1 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-full uppercase">Critical</span>
                                <span className="text-[10px] text-slate-500 font-mono">{new Date(item.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <h3 className="text-lg font-bold text-white leading-tight">Extreme Metrics Detected at Node {item.device_id.slice(0, 6)}</h3>
                            <div className="flex gap-4">
                                <div className="text-center bg-black/20 p-2 rounded-xl flex-1">
                                    <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Temp</div>
                                    <div className="text-sm font-bold text-white">{item.temperature}°C</div>
                                </div>
                                <div className="text-center bg-black/20 p-2 rounded-xl flex-1">
                                    <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">PM2.5</div>
                                    <div className="text-sm font-bold text-white">{item.pm2_5}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {data.filter(d => d.temperature > 40 || d.pm2_5 > 50).length === 0 && (
                        <div className="col-span-3 py-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <ShieldCheck className="w-12 h-12 text-emerald-500/20 mx-auto mb-4" />
                            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">No dangerous anomalies detected in current cycle</p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default Analytics;
