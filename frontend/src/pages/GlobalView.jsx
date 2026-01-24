import React from 'react';
import { Globe, Map as MapIcon, Shield, Wind } from 'lucide-react';

const GlobalView = () => {
    return (
        <div className="p-6 h-screen flex flex-col bg-[#022c22] font-outfit overflow-hidden relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 z-10">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <Globe className="text-emerald-400" /> GLOBAL BIOSPHERE MONITOR
                    </h1>
                    <p className="text-xs text-emerald-500/60 font-bold uppercase tracking-widest pl-1 mt-1">
                        SATELLITE DOWNLINK • LIVE
                    </p>
                </div>
            </div>

            {/* Main Map Area (Simulated High-Tech Map) */}
            <div className="flex-1 rounded-3xl border border-emerald-500/20 bg-[#001e1d] relative overflow-hidden flex items-center justify-center shadow-2xl shadow-emerald-900/20 group">

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#064e3b_1px,transparent_1px),linear-gradient(to_bottom,#064e3b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none"></div>

                {/* World Map SVG (Simplified representation) */}
                <svg viewBox="0 0 800 400" className="w-[80%] h-auto opacity-40 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                    <path d="M150,150 Q200,100 250,150 T350,150 T450,150 T550,150 T650,150" fill="none" stroke="#10b981" strokeWidth="2" />
                    {/* Placeholder for Continents */}
                    <circle cx="200" cy="180" r="100" fill="#047857" opacity="0.3" />
                    <circle cx="550" cy="150" r="80" fill="#047857" opacity="0.3" />
                    <circle cx="400" cy="250" r="120" fill="#047857" opacity="0.2" />
                </svg>

                {/* Hotspots (Interactive Dots) */}
                <div className="absolute top-1/4 left-1/4 group/marker cursor-pointer">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute"></div>
                    <div className="w-3 h-3 bg-red-500 rounded-full relative shadow-[0_0_10px_#ef4444]"></div>
                    <div className="absolute top-4 left-4 bg-black/80 p-2 rounded border border-red-500/50 text-xs w-32 opacity-0 group-hover/marker:opacity-100 transition-opacity">
                        <div className="font-bold text-red-400">HEATWAVE ALERT</div>
                        <div className="text-gray-400">Sahara Region</div>
                        <div className="text-white font-mono">48°C</div>
                    </div>
                </div>

                <div className="absolute top-1/3 right-1/4 group/marker cursor-pointer">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse absolute"></div>
                    <div className="w-3 h-3 bg-emerald-500 rounded-full relative shadow-[0_0_10px_#10b981]"></div>
                    <div className="absolute top-4 left-4 bg-black/80 p-2 rounded border border-emerald-500/50 text-xs w-32 opacity-0 group-hover/marker:opacity-100 transition-opacity">
                        <div className="font-bold text-emerald-400">OPTIMAL ZONE</div>
                        <div className="text-gray-400">Nordic Belt</div>
                        <div className="text-white font-mono">AQI 12</div>
                    </div>
                </div>

                {/* Status Overlay */}
                <div className="absolute bottom-6 left-6 flex gap-4">
                    <div className="bg-black/40 backdrop-blur border border-white/10 p-3 rounded-lg">
                        <div className="text-[10px] text-gray-500 uppercase">Active Sensors</div>
                        <div className="text-xl font-bold text-white font-mono">4,291</div>
                    </div>
                    <div className="bg-black/40 backdrop-blur border border-white/10 p-3 rounded-lg">
                        <div className="text-[10px] text-gray-500 uppercase">Coverage</div>
                        <div className="text-xl font-bold text-emerald-400 font-mono">82%</div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default GlobalView;
