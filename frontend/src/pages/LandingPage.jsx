import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Cpu, Globe, Shield, Activity } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            setMousePos({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="min-h-screen w-full bg-[#020617] font-outfit relative overflow-hidden flex flex-col items-center justify-center text-white selection:bg-cyan-500/30">

            {/* --- BACKGROUND FX --- */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black z-0"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay z-0"></div>

            {/* Animated Grid Floor (Fake 3D) */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none z-0"
                style={{
                    backgroundImage: 'linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    transform: `perspective(1000px) rotateX(60deg) translateY(${mousePos.y * 2}px) translateX(${mousePos.x * 2}px) scale(2)`,
                    transformOrigin: '50% 100%'
                }}
            ></div>

            {/* Floating Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>


            {/* --- MAIN CONTENT --- */}
            <div className="relative z-10 text-center max-w-4xl px-6 animate-in fade-in zoom-in duration-1000">

                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/30 mb-8 backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-400">SYSTEM ONLINE • SECURE CONNECTION</span>
                </div>

                {/* Hero Title */}
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-200 to-slate-500 drop-shadow-2xl">
                    S4 COMMAND
                </h1>

                <p className="text-lg md:text-xl text-slate-400 tracking-widest uppercase font-light mb-12 max-w-2xl mx-auto border-t border-b border-white/5 py-4">
                    Secure Biosphere Monitoring & Drone Surveillance Network
                </p>

                {/* Interactive Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">

                    {/* Login Card */}
                    <button
                        onClick={() => navigate('/login')}
                        className="group relative overflow-hidden bg-black/40 border border-white/10 hover:border-cyan-500/50 p-8 rounded-3xl transition-all hover:bg-cyan-950/20 backdrop-blur-md text-left"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Shield size={100} />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-4 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                                <Cpu className="text-cyan-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Initiate Link</h3>
                            <p className="text-sm text-slate-400 mb-6">Access for authorized operations personnel only. Requires security clearance.</p>

                            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs tracking-widest uppercase">
                                Enter Terminal <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </button>

                    {/* Signup Card */}
                    <button
                        onClick={() => navigate('/login?mode=signup')}
                        className="group relative overflow-hidden bg-black/40 border border-white/10 hover:border-emerald-500/50 p-8 rounded-3xl transition-all hover:bg-emerald-950/20 backdrop-blur-md text-left"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Globe size={100} />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                <Activity className="text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">New Node Request</h3>
                            <p className="text-sm text-slate-400 mb-6">Register a new monitoring device or personnel identity. Protocol S4-B.</p>

                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs tracking-widest uppercase">
                                Begin Sequence <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </button>

                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 text-center w-full opacity-30">
                <p className="text-[10px] tracking-[0.3em] uppercase">Authorized Use Only • v4.3.1 • Global Network</p>
            </div>

        </div>
    );
};

export default LandingPage;
