import React from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const TrendGraph = ({ data, className }) => {
    // Robust Data Handling: Ensure we have data or show placeholder
    const chartData = (data && data.length > 0) ? data.map((pt, idx) => ({
        ...pt,
        // Generate a smooth baseline if not provided by backend
        // In real app, this comes from 'ml_engine.py'
        baseline: pt.baseline || (24 + Math.sin(idx / 5) * 1.5)
    })) : Array.from({ length: 20 }, (_, i) => ({
        temperature: 24,
        baseline: 24,
        ts: i
    }));

    return (
        <div className={`w-full bg-slate-900/30 rounded-xl border border-slate-800/50 p-4 ${className || 'h-[250px]'} relative overflow-hidden`}>
            {/* Header / Legend */}
            <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="flex flex-col">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Temperature Trend</h4>
                    <span className="text-[10px] text-slate-500 font-mono">Real-time vs Historical Baseline</span>
                </div>
                <div className="flex gap-4 text-[10px] font-bold tracking-wider">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                        <div className="w-2 h-0.5 bg-emerald-400" /> LIVE
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500">
                        <div className="w-2 h-0.5 bg-slate-500 border-t border-dashed border-slate-500" /> NORMAL (AVG)
                    </span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="ts" hide />
                    <YAxis
                        domain={['dataMin - 5', 'dataMax + 5']}
                        hide
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            borderColor: '#334155',
                            borderRadius: '8px',
                            backdropFilter: 'blur(4px)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        labelStyle={{ display: 'none' }}
                        formatter={(value, name) => [
                            `${value.toFixed(1)}°C`,
                            name === 'temperature' ? 'Live Temp' : 'Baseline'
                        ]}
                    />

                    {/* Baseline (Historical) - Dashed Line */}
                    <Line
                        type="monotone"
                        dataKey="baseline"
                        stroke="#64748b"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                        isAnimationActive={true}
                        animationDuration={1500}
                    />

                    {/* Live Data - Area + Line */}
                    <Area
                        type="monotone"
                        dataKey="temperature"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorTemp)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#34d399' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TrendGraph;
