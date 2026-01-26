import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LiteView from '../components/dashboard/LiteView';
import ProView from '../components/dashboard/ProView';
// import SidebarModeSwitch from '../components/dashboard/SidebarModeSwitch';
import { THEME } from '../components/dashboard/shared/Common';

const DashboardShell = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Robust State Initialization with Safe Formatting
    const [mode, setMode] = useState(() => {
        try {
            const urlMode = searchParams.get('mode');
            const storedMode = localStorage.getItem('dashboardMode');

            // Validate Logic: Must be strictly 'lite' or 'pro'
            const isValid = (m) => m === 'lite' || m === 'pro';

            if (isValid(urlMode)) return urlMode;
            if (isValid(storedMode)) return storedMode;

            // Fallback
            return 'lite';
        } catch (e) {
            console.warn("Storage Error, defaulting to Lite", e);
            return 'lite';
        }
    });

    // Sync State <-> URL <-> Storage
    useEffect(() => {
        setSearchParams({ mode });
        localStorage.setItem('dashboardMode', mode);
    }, [mode, setSearchParams]);

    const handleSwitchMode = (newMode) => {
        setMode(newMode);
    };

    // Location Modal Logic
    const [showLocModal, setShowLocModal] = useState(false);

    useEffect(() => {
        // Only show in PRO mode and if not already set
        const hasLoc = localStorage.getItem('location_preference');
        if (mode === 'pro' && !hasLoc) {
            setShowLocModal(true);
        }
    }, [mode]);

    const handleLocateNow = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    localStorage.setItem('location_preference', 'auto');
                    setShowLocModal(false);
                    // Force reload to apply context changes or simple state update
                    window.location.reload();
                },
                (err) => {
                    alert("Location access denied. Please use manual search.");
                    setShowLocModal(false);
                }
            );
        }
    };

    const handleManual = () => {
        localStorage.setItem('location_preference', 'manual');
        setShowLocModal(false);
    };

    return (
        <div className={`min-h-screen w-full relative overflow-x-hidden text-gray-200 font-sans selection:bg-yellow-500/30`}>

            {/* --- LOCATION MODAL --- */}
            {showLocModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-[#0f172a] border border-emerald-500/30 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(16,185,129,0.2)] text-center relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-emerald-500/50">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400 animate-pulse"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">Enable Local Intelligence?</h2>
                        <p className="text-slate-400 text-sm mb-8">
                            EcoSync Pro uses your precise location to provide hyper-local air quality fusion and real-time alerts.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={handleManual}
                                className="px-4 py-3 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-all text-xs tracking-wider"
                            >
                                ENTER MANUALLY
                            </button>
                            <button
                                onClick={handleLocateNow}
                                className="px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-lg shadow-emerald-500/20 transition-all text-xs tracking-wider flex items-center justify-center gap-2"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>
                                LOCATE NOW
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- GLOBAL BACKGROUND --- */}
            <div className="fixed inset-0 z-[-1] bg-[#0b0e11]">
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, #2b3139 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }}
                />
                {/* Subtle Glows */}
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-yellow-500/5 blur-[120px] rounded-full mix-blend-screen" />
            </div>

            {/* --- MAIN LAYOUT --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Mode Switcher */}
                <div className="sticky top-4 z-50">
                    {/* <SidebarModeSwitch mode={mode} setMode={handleSwitchMode} /> */}
                </div>

                {/* Content Area with Error Boundary Placeholder */}
                <main className="mt-8 transition-opacity duration-300 ease-in-out">
                    {mode === 'lite' ? (
                        <LiteView />
                    ) : (
                        <ProView />
                    )}
                </main>

            </div>
        </div>
    );
};

export default DashboardShell;
