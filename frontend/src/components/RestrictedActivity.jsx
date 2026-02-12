import React from 'react';
import { UserX, Clock, MapPin } from 'lucide-react';

const RestrictedActivity = ({ motionDetected, timestamp }) => {
    // Mock shift hours: 9 AM - 6 PM
    const now = new Date();
    const currentHour = now.getHours();
    const isOffHours = currentHour < 9 || currentHour >= 18;

    // Status Logic
    const isViolation = motionDetected && isOffHours;
    const isActivity = motionDetected && !isOffHours;

    return (
        <div className={`p-5 rounded-xl border ${isViolation ? 'border-red-500/50 bg-red-500/10' : 'border-slate-800 bg-slate-900/50'}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-200 font-bold flex items-center gap-2">
                    <UserX size={18} className={isViolation ? 'text-red-400' : 'text-slate-400'} />
                    Restricted Area Monitor
                </h3>
                <span className={`text-xs px-2 py-1 rounded font-mono ${isOffHours ? 'bg-slate-800 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {isOffHours ? 'OFF-HOURS MONITORING' : 'ACTIVE SHIFT'}
                </span>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 flex items-center gap-2">
                        <Clock size={14} /> Last Visual Check
                    </span>
                    <span className="font-mono text-slate-200">
                        {timestamp ? new Date(timestamp).toLocaleTimeString() : '--:--:--'}
                    </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 flex items-center gap-2">
                        <MapPin size={14} /> Zone Status
                    </span>
                    <span className={`font-bold ${isViolation ? 'text-red-400 animate-pulse' : (isActivity ? 'text-amber-400' : 'text-emerald-400')}`}>
                        {isViolation ? 'UNAUTHORIZED ENTRY' : (isActivity ? 'ACTIVITY DETECTED' : 'SECURE')}
                    </span>
                </div>
            </div>

            {isViolation && (
                <div className="mt-4 p-2 bg-red-500/20 rounded border border-red-500/30 text-xs text-red-200 text-center">
                    ⚠️ Motion detected outside working hours!
                </div>
            )}
        </div>
    );
};

export default RestrictedActivity;
