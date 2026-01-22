import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, MapPin, Mail, ArrowRight, ShieldCheck, Navigation } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import API_BASE_URL from '../config';

const LoginPage = () => {
    const navigate = useNavigate();
    const { loginCustom } = useAuth();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Login State
    const [email, setEmail] = useState('gitams4@gmail.com');
    const [password, setPassword] = useState('');

    // Registration State
    const [isRegistering, setIsRegistering] = useState(false);

    // Location State
    const [showLocationPrompt, setShowLocationPrompt] = useState(false);
    const [manualLocation, setManualLocation] = useState('');
    const [locationLoading, setLocationLoading] = useState(false);

    const API_URL = API_BASE_URL;
    const [plan, setPlan] = useState('lite');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        try {
            if (isRegistering) {
                const res = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: email,
                        password: password,
                        plan: plan
                    }),
                });

                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.detail || 'Registration failed');
                }

                setIsRegistering(false);
                setLoading(false);
                alert("Registration Successful! Please Login.");
                return;
            }

            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await fetch(`${API_URL}/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Login failed');
            }

            const data = await response.json();
            const finalData = { ...data, plan: data.plan || plan };
            localStorage.setItem('plan', finalData.plan);
            loginCustom(finalData);

            setLoading(false);
            setShowLocationPrompt(true);
        } catch (err) {
            console.error("Login Error:", err);
            setErrorMessage(err.message);
            setLoading(false);
        }
    };

    const registerLocation = async (lat, lon, name) => {
        try {
            setLocationLoading(true);
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/devices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    deviceName: name,
                    connectorType: "public_api",
                    location: { lat, lon }
                })
            });
            navigate('/dashboard');
        } catch (e) {
            console.error("Failed to register location", e);
            alert("Could not save location preference. Proceeding anyway.");
            navigate('/dashboard');
        } finally {
            setLocationLoading(false);
        }
    };

    const handleAutoLocate = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                registerLocation(pos.coords.latitude, pos.coords.longitude, "My Location");
            },
            (err) => {
                console.error(err);
                alert("Location access denied or unavailable.");
                setLocationLoading(false);
            }
        );
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!manualLocation) return;
        setLocationLoading(true);
        try {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${manualLocation}&count=1&language=en&format=json`);
            const data = await res.json();
            if (data.results && data.results.length > 0) {
                const { latitude, longitude, name, country } = data.results[0];
                await registerLocation(latitude, longitude, `${name}, ${country}`);
            } else {
                alert("City not found. Please try again.");
                setLocationLoading(false);
            }
        } catch (e) {
            alert("Geocoding failed. Check connection.");
            setLocationLoading(false);
        }
    };

    if (showLocationPrompt) {
        return (
            <div className="h-screen w-full flex items-center justify-center relative overflow-hidden font-outfit text-slate-200">
                {/* Inherits global background from body */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

                <div className="relative z-10 w-full max-w-md p-8 animate-in fade-in zoom-in duration-500">
                    <div className="glass-depth p-10 border border-white/10 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-5 opacity-20 group-hover:opacity-40 transition-opacity">
                            <Navigation className="w-32 h-32 text-cyan-500 -rotate-12 translate-x-10 -translate-y-10" />
                        </div>

                        <div className="w-20 h-20 bg-cyan-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-cyan-500/30">
                            <Navigation className="text-cyan-400 w-10 h-10" />
                        </div>

                        <h2 className="text-3xl font-black text-white mb-3 tracking-tight">INITIALIZE DOMAIN</h2>
                        <p className="text-slate-400 text-sm mb-10 font-light leading-relaxed">Establish your operational monitoring coordinates for precision analytics.</p>

                        <div className="space-y-6 relative z-10">
                            <button
                                onClick={handleAutoLocate}
                                disabled={locationLoading}
                                className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_rgba(6,182,212,0.3)] hover:shadow-[0_15px_40px_rgba(6,182,212,0.4)] hover:-translate-y-1 disabled:opacity-50"
                            >
                                {locationLoading ? 'CALIBRATING...' : (
                                    <>
                                        <MapPin size={20} />
                                        AUTO-DETECT LOCATION
                                    </>
                                )}
                            </button>

                            <div className="relative flex py-4 items-center">
                                <div className="flex-grow border-t border-white/10"></div>
                                <span className="flex-shrink-0 mx-6 text-slate-500 text-[10px] font-bold tracking-widest uppercase">Manual Override</span>
                                <div className="flex-grow border-t border-white/10"></div>
                            </div>

                            <form onSubmit={handleManualSubmit} className="flex gap-3">
                                <input
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-cyan-500 focus:bg-white/10 transition-all font-light placeholder-slate-500"
                                    placeholder="City Name (e.g. Tokyo)"
                                    value={manualLocation}
                                    onChange={(e) => setManualLocation(e.target.value)}
                                    disabled={locationLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={locationLoading || !manualLocation}
                                    className="bg-white/10 hover:bg-white/20 text-white px-6 rounded-2xl font-black transition-all border border-white/10 hover:border-cyan-500/50"
                                >
                                    GO
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex items-center justify-center relative overflow-hidden font-outfit text-slate-200">
            {/* Transparent overlay to let global background show through but darken it slightly */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>

            <div className="relative z-10 w-full max-w-md p-6 animate-in slide-in-from-bottom-10 fade-in duration-700">
                <div className="glass-depth p-10 border border-white/10 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden">

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 blur-[50px] rounded-full translate-x-10 -translate-y-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 blur-[50px] rounded-full -translate-x-10 translate-y-10"></div>

                    <div className="text-center mb-10 relative z-10">
                        <div className="w-20 h-20 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner group transition-all duration-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                            <ShieldCheck className="text-cyan-400 w-10 h-10 group-hover:rotate-12 transition-transform duration-500" />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter mb-2 drop-shadow-lg">
                            {isRegistering ? 'NEW NODE' : 'S4 AUTH'}
                        </h1>
                        <p className="text-cyan-400/70 text-[10px] font-bold tracking-[0.3em] uppercase text-glow">
                            {isRegistering ? 'INITIALIZE OPERATOR CORE' : 'SECURE COMMAND PROTOCOL'}
                        </p>
                    </div>

                    {errorMessage && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs text-center font-medium animate-in fade-in slide-in-from-top-4">
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                        <div className="space-y-5">
                            <div className="group">
                                <label className="block text-[10px] font-bold text-slate-500 mb-2 ml-1 tracking-widest uppercase group-focus-within:text-cyan-400 transition-colors">
                                    Identity Hash (Email)
                                </label>
                                <div className="relative transition-transform duration-300 group-focus-within:scale-[1.02]">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        className="block w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-[1.25rem] focus:ring-0 focus:border-cyan-500 placeholder-slate-600 text-white transition-all outline-none font-light shadow-inner"
                                        placeholder="operator@system.io"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-[10px] font-bold text-slate-500 mb-2 ml-1 tracking-widest uppercase group-focus-within:text-cyan-400 transition-colors">
                                    Access Key (Passcode)
                                </label>
                                <div className="relative transition-transform duration-300 group-focus-within:scale-[1.02]">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        className="block w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-[1.25rem] focus:ring-0 focus:border-cyan-500 placeholder-slate-600 text-white transition-all outline-none font-light shadow-inner"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Plan Selection UI */}
                        <div className="pt-2">
                            <label className="block text-[10px] font-bold text-slate-500 mb-3 ml-1 tracking-widest uppercase">Selection Protocol</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => setPlan('lite')}
                                    className={`cursor-pointer p-5 rounded-[1.5rem] border transition-all duration-300 transform hover:scale-105 ${plan === 'lite' ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                >
                                    <div className={`text-[10px] font-black mb-1 ${plan === 'lite' ? 'text-emerald-400' : 'text-slate-400'}`}>LITE</div>
                                    <div className="text-[9px] text-slate-500 font-medium uppercase tracking-tighter">Standard Polling</div>
                                </div>
                                <div
                                    onClick={() => setPlan('pro')}
                                    className={`cursor-pointer p-5 rounded-[1.5rem] border transition-all duration-300 transform hover:scale-105 ${plan === 'pro' ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                >
                                    <div className={`text-[10px] font-black mb-1 ${plan === 'pro' ? 'text-cyan-400' : 'text-slate-400'}`}>PRO</div>
                                    <div className="text-[9px] text-slate-500 font-medium uppercase tracking-tighter">AI Fusion + Maps</div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative group overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black py-5 px-6 rounded-[1.5rem] transition-all duration-500 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-[0_15px_30px_rgba(6,182,212,0.3)] hover:shadow-[0_20px_40px_rgba(6,182,212,0.5)] border border-white/10"
                        >
                            <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                            <div className="flex items-center justify-center gap-3">
                                {loading ? 'BYPASSING SECURITY...' : (isRegistering ? 'ESTABLISH LINK' : 'INITIALIZE SESSION')}
                                {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                            </div>
                        </button>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => setIsRegistering(!isRegistering)}
                                className="text-[10px] font-bold tracking-widest text-slate-500 hover:text-cyan-400 uppercase transition-colors"
                            >
                                {isRegistering ? 'Back to Identity Verification' : "Don't have an operator key? Create Node"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
