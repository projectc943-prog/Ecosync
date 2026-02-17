import React from 'react';
import { Info, HelpCircle, Brain, Thermometer, Activity, AlertTriangle } from 'lucide-react';

const ExplainableAlert = ({ currentData, baselineData, alertReason }) => {
    // Determine status based on thresholds
    const tempDev = (currentData?.temperature - (baselineData?.temperature || 24));
    const gasDev = (currentData?.gas - (baselineData?.gas || 40));

    // Safety check for nulls
    if (!currentData) return null;

    const isAlert = tempDev > 5 || gasDev > 50 || alertReason;

    // Dynamic Analysis Reasoning
    const getMainCause = () => {
        if (tempDev > 5 && gasDev > 50) return "Compound Verification: Temp + Gas Spike";
        if (tempDev > 5) return "Thermal Runaway Detected";
        if (gasDev > 50) return "Chemical Vapor Leakage";
        return "Anomaly Pattern Match";
    };

    return (
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className={`p-2 rounded-lg ${isAlert ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    <Brain size={24} />
                </div>
                <div>
                    <h3 className="text-white font-bold flex items-center gap-2">
                        Explainable AI Insight
                        {isAlert && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded animate-pulse">ACTION REQUIRED</span>}
                    </h3>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Real-time Interference Logic Layer</p>
                </div>
            </div>

            {/* Evidence Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 relative z-10">

                {/* Temperature Analysis */}
                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-slate-500 font-bold uppercase">Temperature Analysis</span>
                        <Thermometer size={14} className={tempDev > 5 ? "text-red-400" : "text-emerald-400"} />
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <span className="text-2xl font-mono font-black text-white">{currentData?.temperature?.toFixed(1)}°C</span>
                            <span className="text-xs text-slate-500 ml-1">Current</span>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-mono text-slate-400 block">{baselineData?.temperature || 24}°C (Avg)</span>
                            <span className={`text-xs font-bold ${tempDev > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {tempDev > 0 ? '+' : ''}{tempDev?.toFixed(1)}°C Deviation
                            </span>
                        </div>
                    </div>
                </div>

                {/* Gas Analysis */}
                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-slate-500 font-bold uppercase">Gas Analysis</span>
                        <Activity size={14} className={gasDev > 50 ? "text-red-400" : "text-emerald-400"} />
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <span className="text-2xl font-mono font-black text-white">{currentData?.gas?.toFixed(0)}</span>
                            <span className="text-xs text-slate-500 ml-1">PPM</span>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-mono text-slate-400 block">{baselineData?.gas || 45} PPM (Avg)</span>
                            <span className={`text-xs font-bold ${gasDev > 20 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {gasDev > 0 ? '+' : ''}{gasDev?.toFixed(0)} PPM Deviation
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Cause & Confidence Footer */}
            <div className="bg-slate-800/30 rounded-lg p-4 border border-indigo-500/20 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                <div className="flex items-center gap-3 w-full">
                    <AlertTriangle size={20} className="text-indigo-400 shrink-0" />
                    <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-0.5">ESTIMATED CAUSE</span>
                        <span className="text-white font-bold">{getMainCause()}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-700 pt-3 md:pt-0 md:pl-4">
                    <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-0.5">CONFIDENCE</span>
                        <span className="text-emerald-400 font-black text-lg">91%</span>
                    </div>
                    <div className="h-8 w-px bg-slate-700 mx-2 hidden md:block" />
                    <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-0.5">SEVERITY</span>
                        <span className={`font-black text-lg ${isAlert ? 'text-red-400' : 'text-emerald-400'}`}>
                            {isAlert ? 'HIGH' : 'LOW'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
        </div>
    );
};

export default ExplainableAlert;
