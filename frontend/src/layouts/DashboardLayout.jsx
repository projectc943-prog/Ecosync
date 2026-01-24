import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LiteView from '../components/dashboard/LiteView';
import ProView from '../components/dashboard/ProView';
// import SidebarModeSwitch from '../components/dashboard/SidebarModeSwitch';
import { THEME } from '../components/dashboard/shared/Common';

const DashboardShell = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Robust State Initialization
    const [mode, setMode] = useState(() => {
        const urlMode = searchParams.get('mode');
        const storedMode = localStorage.getItem('dashboardMode');
        const planMode = localStorage.getItem('plan'); // Get plan from login
        // Priority: URL -> Stored Mode -> Login Plan -> Lite
        return (urlMode === 'lite' || urlMode === 'pro') ? urlMode : (storedMode || planMode || 'lite');
    });

    // Sync State <-> URL <-> Storage
    useEffect(() => {
        setSearchParams({ mode });
        localStorage.setItem('dashboardMode', mode);
    }, [mode, setSearchParams]);

    const handleSwitchMode = (newMode) => {
        setMode(newMode);
    };

    return (
        <div className={`min-h-screen w-full relative overflow-x-hidden text-gray-200 font-sans selection:bg-yellow-500/30`}>

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
