import React from 'react';
import { Info, HelpCircle } from 'lucide-react';

const ExplainableAlert = ({ currentData, baselineData, alertReason }) => {
    if (!alertReason) return null;

    return (
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <Info size={20} />
                </div>
                <div>
                    <h3 className="text-white font-bold">Explainable AI Insight</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Why did this alert trigger?</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/30">
                    <p className="text-xs text-slate-500 mb-1">CURRENT READING</p>
                    <div className="flex justify-between items-end">
                        <span className="text-xl font-mono font-bold text-white">
                            {currentData?.temperature?.toFixed(1)}°C
                        </span>
                        <span className="text-xs text-slate-400">Temp</span>
                    </div>
                </div>
                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/30 dashed-border">
                    <p className="text-xs text-slate-500 mb-1">NORMAL BASELINE</p>
                    <div className="flex justify-between items-end">
                        <span className="text-xl font-mono text-emerald-400/80">
                            {baselineData?.temperature?.toFixed(1)}°C
                        </span>
                        <span className="text-xs text-slate-500">Hist. Avg</span>
                    </div>
                </div>
            </div>

            <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <p className="text-sm text-slate-300 leading-relaxed flex gap-2">
                    <HelpCircle size={16} className="mt-0.5 text-indigo-400 shrink-0" />
                    <span>
                        {alertReason}
                        <br />
                        <span className="text-xs text-slate-500 mt-1 block">
                            Deviation: {((currentData?.temperature - baselineData?.temperature)).toFixed(1)}°C above normal.
                        </span>
                    </span>
                </p>
            </div>
        </div>
    );
};

export default ExplainableAlert;
