import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

const RiskPanel = ({ riskLevel, score = 12, isConnected = true, confidence = 99.9, riskFactors = [] }) => {
    // Determine configuration based on risk level or score
    const getRiskConfig = (level) => {
        if (!isConnected) return { color: 'slate', icon: ShieldCheck, label: 'WAITING', desc: 'Connect Device to Monitor' };

        switch (level) {
            case 'CRITICAL':
                return { color: 'red', icon: AlertOctagon, label: 'CRITICAL', desc: 'Evacuate Immediately' };
            case 'MODERATE':
                return { color: 'orange', icon: AlertTriangle, label: 'MODERATE', desc: 'Monitor Closely' };
            default:
                return { color: 'emerald', icon: ShieldCheck, label: 'SAFE', desc: 'Normal Operations' };
        }
    };

    const config = getRiskConfig(riskLevel);
    const Icon = config.icon;

    // Calculate Stroke Dasharray for Gauge (Circle circumference = 2 * pi * r)
    // r = 36, so C ~ 226
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const [showFactors, setShowFactors] = React.useState(false);

    return (
        <div className={`relative rounded-xl border border-${config.color}-500/30 bg-slate-900/80 p-6 flex items-center justify-between shadow-[0_0_20px_rgba(0,0,0,0.3)]`}>

            {/* Left Side: Status Text */}
            <div className="z-10">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full bg-${config.color}-500 animate-pulse`} />
                    <h3 className={`text-${config.color}-400 font-bold text-xs tracking-widest uppercase`}>
                        Safety Status
                    </h3>
                </div>

                <h2 className={`text-4xl font-black text-white tracking-tighter mb-1`}>
                    {config.label}
                </h2>

                <p className="text-slate-400 text-xs font-mono mb-4">
                    {config.desc}
                </p>

                {/* AI Confidence Badge - Interactive */}
                <div
                    className="relative inline-flex flex-col"
                    onMouseEnter={() => setShowFactors(true)}
                    onMouseLeave={() => setShowFactors(false)}
                    onClick={() => setShowFactors(!showFactors)} // Mobile support
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700 cursor-pointer hover:bg-slate-750 hover:border-blue-500/50 transition-colors">
                        <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_5px] ${confidence > 80 ? 'bg-emerald-400 shadow-emerald-400' : 'bg-blue-400 shadow-blue-400'}`} />
                        <span className="text-[10px] text-slate-300 font-bold tracking-wider">
                            AI CONFIDENCE: <span className="text-white">{confidence}%</span>
                        </span>
                    </div>

                    {/* Factors Tooltip/Popover */}
                    {showFactors && isConnected && riskFactors.length > 0 && (
                        <div className="absolute bottom-full left-0 mb-3 w-64 bg-slate-950/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl z-[100] animate-in slide-in-from-bottom-2 fade-in duration-200">
                            <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-2">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Risk Analysis</h4>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${config.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                    LIVE
                                </span>
                            </div>
                            <ul className="space-y-2">
                                {riskFactors.map((factor, i) => (
                                    <li key={i} className="text-[11px] text-slate-200 flex items-start gap-2">
                                        <span className={`mt-1 w-1.5 h-1.5 rounded-full ${config.color === 'emerald' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                        <span className="leading-tight">{factor}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side: Risk Gauge */}
            <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Gauge Background */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        className="stroke-slate-800"
                        strokeWidth="8"
                        fill="transparent"
                    />
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        className={`stroke-${config.color}-500 transition-all duration-1000 ease-out`}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-black text-white`}>{isConnected ? score : '--'}%</span>
                    <span className={`text-[8px] text-${config.color}-400 uppercase tracking-widest font-bold`}>RISK</span>
                </div>

                {/* Icon Badge */}
                <div className={`absolute -bottom-2 -right-2 bg-${config.color}-500/20 p-2 rounded-full border border-${config.color}-500/50 backdrop-blur-md`}>
                    <Icon size={20} className={`text-${config.color}-400`} />
                </div>
            </div>

            {/* Background Effects Container */}
            <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                <div className={`absolute -right-10 -bottom-10 w-48 h-48 bg-${config.color}-500/10 blur-3xl rounded-full`} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            </div>
        </div>
    );
};

export default RiskPanel;
