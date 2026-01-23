import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Cpu, Globe, Shield, Activity, Radio, Zap, Wind } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            setMousePos({ x, y });
        };
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="min-h-screen w-full bg-[#020617] font-outfit relative overflow-x-hidden text-white selection:bg-cyan-500/30">

            {/* --- GLOBAL FX --- */}
            {/* --- GLOBAL FX - NATURE THEME --- */}
            <div className="fixed inset-0 bg-gradient-to-br from-green-900 via-emerald-950 to-slate-900 overflow-hidden z-0">
                {/* Simulated Live 'Wind/Grass' effect via heavy blur and CSS animation */}
                <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center animate-[pulse_10s_ease-in-out_infinite]"></div>
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* --- NAVBAR --- */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                            <Cpu className="text-white" size={24} />
                        </div>
                        <div className="leading-tight">
                            <h2 className="font-black text-2xl tracking-wider text-white">S4</h2>
                            <p className="text-[10px] text-emerald-400/80 tracking-[0.2em] uppercase">Secure Network</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            SYSTEM OPERATIONAL
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <header className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-20 px-6">

                {/* 3D Background Elements (Parallax) */}
                <div
                    className="absolute top-1/4 left-10 md:left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"
                    style={{ transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)` }}
                />
                <div
                    className="absolute bottom-1/4 right-10 md:right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"
                    style={{ transform: `translate(${-mousePos.x * 3}px, ${-mousePos.y * 3}px)` }}
                />

                <div className="relative z-10 text-center max-w-5xl mx-auto">

                    {/* Main Title Group */}
                    <div className="mb-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-6">
                            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                                ENVIRONMENTAL
                            </span>
                            <span className="block text-4xl md:text-6xl lg:text-7xl text-slate-500 mt-2">
                                MONITORING &
                            </span>
                            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 mt-2">
                                ALERTING NETWORK
                            </span>
                        </h1>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
                            <div className="h-px w-12 bg-white/20 hidden md:block"></div>
                            <p className="text-xl md:text-2xl text-slate-300 font-light tracking-wide">
                                Environmental Monitoring and Alerting Network
                            </p>
                            <div className="h-px w-12 bg-white/20 hidden md:block"></div>
                        </div>
                    </div>

                    {/* Action Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-300">

                        {/* Access Terminal */}
                        <div
                            onClick={() => navigate('/login')}
                            className="group relative cursor-pointer overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-white/10 p-1 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-[0_0_50px_-10px_rgba(6,182,212,0.3)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="relative h-full bg-[#020617]/80 backdrop-blur-xl rounded-[1.8rem] p-8 flex flex-col items-start text-left overflow-hidden">

                                {/* Icon Bg */}
                                <div className="absolute -right-6 -top-6 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>

                                <div className="w-14 h-14 bg-cyan-950/50 border border-cyan-500/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                    <Shield className="text-cyan-400 w-7 h-7" />
                                </div>

                                <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">Access Dashboard</h3>
                                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                                    Log in to view real-time environmental data and analytics.
                                </p>

                                <div className="mt-auto flex items-center gap-3 text-cyan-400 font-bold tracking-widest text-xs uppercase group-hover:translate-x-2 transition-transform">
                                    Log In <ArrowRight size={16} />
                                </div>
                            </div>
                        </div>

                        {/* New Node Request */}
                        <div
                            onClick={() => navigate('/login?mode=signup')}
                            className="group relative cursor-pointer overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-white/10 p-1 hover:border-emerald-500/50 transition-all duration-500 hover:shadow-[0_0_50px_-10px_rgba(16,185,129,0.3)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="relative h-full bg-[#020617]/80 backdrop-blur-xl rounded-[1.8rem] p-8 flex flex-col items-start text-left overflow-hidden">

                                {/* Icon Bg */}
                                <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>

                                <div className="w-14 h-14 bg-emerald-950/50 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                    <Radio className="text-emerald-400 w-7 h-7" />
                                </div>

                                <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Join Network</h3>
                                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                                    Create an account to start contributing local sensor data.
                                </p>

                                <div className="mt-auto flex items-center gap-3 text-emerald-400 font-bold tracking-widest text-xs uppercase group-hover:translate-x-2 transition-transform">
                                    Begin Protocol <ArrowRight size={16} />
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </header>

            {/* --- FEATURES STRIP --- */}
            <div className="border-t border-white/5 bg-black/40 backdrop-blur-sm py-16">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { icon: Activity, label: "Real-time Analytics", color: "text-blue-400" },
                        { icon: Zap, label: "Instant Alerts", color: "text-amber-400" },
                        { icon: Globe, label: "Global Coverage", color: "text-purple-400" },
                        { icon: Wind, label: "Air Quality Index", color: "text-teal-400" },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-3 group">
                            <div className={`p-4 rounded-full bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors ${item.color}`}>
                                <item.icon size={24} />
                            </div>
                            <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- FOOTER --- */}
            <footer className="py-8 text-center text-slate-600 text-xs tracking-widest uppercase border-t border-white/5">
                <p>&copy; 2026 S4 • Advanced Environmental Solutions</p>
            </footer>

        </div>
    );
};

export default LandingPage;
