import React from 'react';
import { CheckCircle, AlertCircle, WifiOff } from 'lucide-react';

const SensorHealth = ({ healthData }) => {
    // healthData = { temperature: "OK", gas: "Stuck", ... }

    const getStatusIcon = (status) => {
        if (status === 'OK') return <CheckCircle size={16} className="text-emerald-500" />;
        if (status === 'Offline') return <WifiOff size={16} className="text-slate-500" />;
        return <AlertCircle size={16} className="text-amber-500" />;
    };

    return (
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
            <h3 className="text-slate-200 font-bold mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-500" />
                Sensor Health Matrix
            </h3>

            <div className="space-y-3">
                {Object.entries(healthData || {}).map(([sensor, status]) => (
                    <div key={sensor} className="flex items-center justify-between p-2 hover:bg-slate-800/50 rounded transition-colors">
                        <span className="text-sm text-slate-400 capitalize">{sensor} Sensor</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-mono px-2 py-0.5 rounded ${status === 'OK' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                {status}
                            </span>
                            {getStatusIcon(status)}
                        </div>
                    </div>
                ))}

                {(!healthData || Object.keys(healthData).length === 0) && (
                    <div className="text-center text-xs text-slate-500 py-2">
                        Waiting for diagnostics...
                    </div>
                )}
            </div>
        </div>
    );
};

export default SensorHealth;
