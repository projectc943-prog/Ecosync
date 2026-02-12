import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

const RiskPanel = ({ riskLevel }) => {
    const getRiskConfig = (level) => {
        switch (level) {
            case 'CRITICAL':
                return {
                    color: 'red',
                    icon: AlertOctagon,
                    label: 'CRITICAL RISK',
                    desc: 'Immediate Action Required'
                };
            case 'MODERATE':
                return {
                    color: 'orange',
                    icon: AlertTriangle,
                    label: 'MODERATE RISK',
                    desc: 'Monitor Closely'
                };
            default:
                return {
                    color: 'emerald',
                    icon: ShieldCheck,
                    label: 'SAFE',
                    desc: 'Normal Operations'
                };
        }
    };

    const config = getRiskConfig(riskLevel);
    const Icon = config.icon;

    return (
        <div className={`relative overflow-hidden rounded-xl border border-${config.color}-500/30 bg-${config.color}-500/10 p-6 flex items-center justify-between`}>
            <div className="z-10">
                <h3 className={`text-${config.color}-400 font-bold text-sm tracking-widest uppercase mb-1`}>
                    Safety Status
                </h3>
                <h2 className={`text-3xl font-black text-${config.color}-100 tracking-tighter`}>
                    {config.label}
                </h2>
                <p className={`text-${config.color}-200/80 text-sm mt-1 font-medium`}>
                    {config.desc}
                </p>
            </div>

            <div className={`p-4 rounded-full bg-${config.color}-500/20 text-${config.color}-400 animate-pulse`}>
                <Icon size={48} strokeWidth={1.5} />
            </div>

            {/* Background Glow */}
            <div className={`absolute -right-10 -bottom-10 w-40 h-40 bg-${config.color}-500/20 blur-3xl rounded-full pointer-events-none`} />
        </div>
    );
};

export default RiskPanel;
