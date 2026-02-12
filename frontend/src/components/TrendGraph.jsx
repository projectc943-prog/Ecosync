import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const TrendGraph = ({ data, className }) => {
    // Expects 'data' to be an array of objects {ts, temperature, baseline}
    // Phase 2: 'ml_engine.py' adds 'baseline' field (if mocked) or we map it here
    // But for now, we rely on the modification in 'useEsp32Stream.js' or 'LightDashboard.jsx'
    // to this component to include a mock 'baseline' key for each point.

    // If 'data' is the history array from useEsp32Stream:
    const chartData = (data && data.length > 0) ? data.map(pt => ({
        ...pt,
        // Mock baseline as a smooth curve around 25deg
        baseline: 25 + Math.sin(pt.ts / 10000) * 2
    })).slice(-20) : Array(10).fill({ temperature: 0, baseline: 25 }).map((d, i) => ({ ...d, ts: i }));

    return (
        <div className={`w-full bg-slate-900/30 rounded-xl border border-slate-800/50 p-4 ${className || 'h-[200px]'}`}>
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Temp Trend vs Baseline</h4>
                <div className="flex gap-4 text-[10px]">
                    <span className="flex items-center gap-1 text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Current</span>
                    <span className="flex items-center gap-1 text-slate-500"><div className="w-2 h-2 rounded-full bg-slate-500" /> Hist. Arg</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="timestamp" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                        itemStyle={{ fontSize: '12px' }}
                    />
                    {/* Baseline (Faded) */}
                    <Line type="monotone" dataKey="baseline" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                    {/* Current (Active) */}
                    <Line type="monotone" dataKey="temperature" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TrendGraph;
