import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, User, Mail, ArrowRight, ShieldCheck, Cpu, Activity, Zap, Sprout, Scan, Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import loginBg from '../assets/login_bg.png';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, signup } = useAuth();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // --- STATE MACHINE ---
    const [searchParams] = useSearchParams();
    const initialMode = searchParams.get('mode') === 'signup' ? 'signup_email' : 'login';
    const [authStage, setAuthStage] = useState(initialMode); // login, signup_email, signup_password

    // --- FORM DATA ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [lastName, setLastName] = useState('');
    const [firstName, setFirstName] = useState('');

    // --- BIO-SCANNER STATE ---
    const [scannerState, setScannerState] = useState('idle'); // idle, scanning, success, error

    // --- HANDLERS ---

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setScannerState('scanning');
        setErrorMessage('');

        try {
            const { error } = await login(email, password);
            if (error) throw error;

            setScannerState('success');
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);

        } catch (err) {
            console.error("Login Error:", err);
            setErrorMessage(err.message || "Failed to authenticate");
            setScannerState('error');
            setTimeout(() => setScannerState('idle'), 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleSignupStep1_Email = (e) => {
        e.preventDefault();
        setAuthStage('signup_password');
    };

    const handleSignupStep3_Final = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }

        setLoading(true);
        setScannerState('scanning');

        try {
            const { error } = await signup(email, password, {
                first_name: firstName,
                last_name: lastName,
                plan: 'lite'
            });

            if (error) throw error;

            setScannerState('success');
            setTimeout(() => {
                alert("Account Created! Check your email for verification.");
                setAuthStage('login');
            }, 1500);

        } catch (err) {
            console.error(err);
            if (err.message && (err.message.includes("already registered") || err.message.includes("User already exists"))) {
                setErrorMessage("WARNING: Node Identity Already Active (Email Taken)");
            } else {
                setErrorMessage(err.message || "Registration Failed");
            }
            setScannerState('error');
        } finally {
            setLoading(false);
        }
    };


    // --- SUB-COMPONENTS ---
    const BioBadge = () => (
        <div className={`relative w-32 h-32 mx-auto mb-6 transition-all duration-500`}>
            {/* Organic Pulse */}
            <div className={`absolute inset-0 bg-emerald-500/20 rounded-full blur-[40px] transition-all duration-300 animate-pulse-slow`}></div>

            <div className="relative w-full h-full flex items-center justify-center animate-[float_6s_ease-in-out_infinite]">
                {/* Stylized Bio Icon */}
                <div className="relative">
                    <div className="w-20 h-20 bg-emerald-950/50 border border-emerald-500/30 rounded-2xl flex items-center justify-center relative overflow-hidden backdrop-blur-md">
                        {scannerState === 'scanning' && (
                            <div className="absolute inset-0 bg-emerald-500/20 animate-pulse"></div>
                        )}
                        <Leaf size={40} className={`text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)] z-10 ${scannerState === 'scanning' ? 'animate-bounce' : ''}`} strokeWidth={1.5} />
                    </div>

                    <Cpu size={20} className="text-lime-400 absolute -top-1 -right-2 animate-[spin_10s_linear_infinite]" />
                    <Activity size={20} className="text-teal-400 absolute -bottom-1 -left-2 animate-pulse" />
                </div>
            </div>

            <div className="absolute -bottom-6 left-0 right-0 text-center">
                <span className={`text-[10px] font-bold tracking-[0.2em] px-3 py-1 rounded-full bg-emerald-950/40 backdrop-blur-md border border-emerald-500/30 text-emerald-300 uppercase shadow-lg`}>
                    {authStage === 'login' && 'Bio-Auth Ready'}
                    {authStage.includes('signup') && 'New Organism'}
                </span>
            </div>
        </div>
    );

    // --- RENDERERS ---

    const renderLoginForm = () => (
        <form onSubmit={handleLogin} className="space-y-5 animate-in slide-in-from-right-10 fade-in duration-500">
            <div className="group">
                <label className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest mb-1 block font-mono">User ID / Email</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-emerald-500/30 transition-colors group-focus-within:text-emerald-400" />
                    <input
                        type="email"
                        className="w-full bg-[#022c22]/50 border border-emerald-500/20 rounded-xl py-3 pl-12 pr-4 text-white focus:border-emerald-400 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] outline-none transition-all placeholder-slate-600 font-mono text-sm"
                        placeholder="researcher@ecosync.io"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={() => setScannerState('scanning')}
                        onBlur={() => setScannerState('idle')}
                        required
                    />
                </div>
            </div>
            <div className="group">
                <label className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest mb-1 block font-mono">Secure Token</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-emerald-500/30 transition-colors group-focus-within:text-emerald-400" />
                    <input
                        type="password"
                        className="w-full bg-[#022c22]/50 border border-emerald-500/20 rounded-xl py-3 pl-12 pr-4 text-white focus:border-emerald-400 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] outline-none transition-all placeholder-slate-600 font-mono text-sm"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>
            </div>

            <button disabled={loading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2 group border border-emerald-400/20 btn-bio">
                <span className="group-hover:tracking-widest transition-all duration-300">{loading ? 'VERIFYING...' : 'ACCESS SYSTEM'}</span>
                {!loading && <Scan size={18} className="group-hover:scale-110 transition-transform" />}
            </button>

            <div className="text-center pt-4 border-t border-white/5">
                <button type="button" onClick={() => setAuthStage('signup_email')} className="text-xs text-slate-400 hover:text-emerald-400 transition-colors uppercase tracking-widest font-mono flex items-center justify-center gap-2">
                    <Sprout size={12} /> Request Node Access
                </button>
            </div>
        </form>
    );

    const renderSignupEmail = () => (
        <form onSubmit={handleSignupStep1_Email} className="space-y-5 animate-in slide-in-from-right-10 fade-in duration-500">
            <div className="group">
                <label className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest mb-1 block font-mono">Contact Frequency</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-emerald-500/30" />
                    <input
                        type="email"
                        className="w-full bg-[#022c22]/50 border border-emerald-500/20 rounded-xl py-3 pl-12 pr-4 text-white focus:border-emerald-400 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] outline-none transition-all placeholder-slate-600 font-mono text-sm"
                        placeholder="new.user@ecosync.io"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
            </div>

            <button disabled={loading} className="w-full bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-500 hover:to-lime-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 border border-white/10 btn-bio">
                {loading ? 'CALIBRATING...' : 'INITIATE UPLINK'}
            </button>

            <button type="button" onClick={() => setAuthStage('login')} className="w-full text-[10px] text-slate-500 hover:text-white uppercase tracking-widest mt-2 font-mono">
                [ CANCEL SEQUENCE ]
            </button>
        </form>
    );

    const renderSignupPassword = () => (
        <form onSubmit={handleSignupStep3_Final} className="space-y-4 animate-in slide-in-from-right-10 fade-in duration-500">
            <div className="grid grid-cols-2 gap-4">
                <input
                    className="w-full bg-[#022c22]/50 border border-emerald-500/20 rounded-xl py-3 px-4 text-white focus:border-emerald-400 outline-none font-mono text-sm placeholder-slate-600"
                    placeholder="First Name"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                />
                <input
                    className="w-full bg-[#022c22]/50 border border-emerald-500/20 rounded-xl py-3 px-4 text-white focus:border-emerald-400 outline-none font-mono text-sm placeholder-slate-600"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                />
            </div>

            <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-emerald-500/30" />
                <input
                    type="password"
                    className="w-full bg-[#022c22]/50 border border-emerald-500/20 rounded-xl py-3 pl-12 pr-4 text-white focus:border-emerald-400 outline-none transition-all placeholder-slate-600 font-mono text-sm"
                    placeholder="Create Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
            </div>
            <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-emerald-500/30" />
                <input
                    type="password"
                    className="w-full bg-[#022c22]/50 border border-emerald-500/20 rounded-xl py-3 pl-12 pr-4 text-white focus:border-emerald-400 outline-none transition-all placeholder-slate-600 font-mono text-sm"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                />
            </div>

            <button disabled={loading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 border border-emerald-400/20 btn-bio">
                REGISTER BIOMETRICS
            </button>
        </form>
    );

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#022c22] font-outfit relative overflow-hidden selection:bg-emerald-500/30">
            {/* Background Effects - BIO THEME */}
            <div className="fixed inset-0 bg-[#022c22] overflow-hidden">
                {/* Generated Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity hover:scale-105 transition-transform duration-[60s]"
                    style={{ backgroundImage: `url(${loginBg})` }}
                ></div>

                {/* Overlay Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#022c22] via-[#022c22]/80 to-transparent"></div>

                {/* Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#064e3b_1px,transparent_1px),linear-gradient(to_bottom,#064e3b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>

                {/* Glows */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[128px] animate-pulse-slow"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-lime-500/10 rounded-full blur-[128px] animate-pulse-slow delay-1000"></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-6">
                <div className="glass-panel p-8 border border-emerald-500/10 rounded-[2.5rem] bg-[#022c22]/60 backdrop-blur-xl shadow-[0_0_60px_-15px_rgba(16,185,129,0.2)] relative overflow-hidden transition-all duration-500">

                    <BioBadge />

                    <div className="text-center mb-6 relative z-10">
                        <h1 className="text-3xl font-black text-white tracking-tight mb-1 drop-shadow-md font-mono">
                            {authStage === 'login' && 'STATION LOGIN'}
                            {authStage === 'signup_email' && 'NEW SENSOR NODE'}
                            {authStage === 'signup_password' && 'SECURE UPLINK'}
                        </h1>
                        <p className="text-emerald-400/80 text-[11px] font-bold tracking-[0.3em] uppercase font-mono">
                            {authStage === 'login' && 'ACCESS ENVIRONMENTAL DATA'}
                            {authStage.includes('signup') && 'ESTABLISHING CONNECTION...'}
                        </p>
                    </div>

                    {errorMessage && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                            <ShieldCheck className="text-red-400 w-5 h-5" />
                            <span className="text-red-400 text-xs font-bold font-mono">{errorMessage}</span>
                        </div>
                    )}

                    {authStage === 'login' && renderLoginForm()}
                    {authStage === 'signup_email' && renderSignupEmail()}
                    {authStage === 'signup_password' && renderSignupPassword()}

                </div>

                <div className="text-center mt-6 opacity-50 text-[10px] text-emerald-100/60 tracking-widest uppercase font-medium font-mono">
                    Eco-System Monitor • v4.3.0 • Secure Satellite Link
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
