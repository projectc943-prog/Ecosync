import React from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, Map, Server, Zap, LogOut, TrendingUp, User, Activity, BarChart3, ShieldCheck, Newspaper, Info, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [searchParams] = useSearchParams();
    const storedMode = localStorage.getItem('dashboardMode');
    const mode = searchParams.get('mode') || ((storedMode === 'lite' || storedMode === 'pro') ? storedMode : 'lite');
    const isPro = mode === 'pro';
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Activity, label: 'Analysis', path: '/analysis' },
        { icon: Map, label: 'Global Map', path: '/global' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics' },
        { icon: ShieldCheck, label: 'Safety Hub', path: '/safety' },
        { icon: Newspaper, label: 'Industry Intel', path: '/intel' },
        { icon: Info, label: 'About Project', path: '/about' },
        { icon: Phone, label: 'Contact Support', path: '/support' },
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    if (!isPro) {
        // Filter items for Lite mode if needed, but sidebar usually for Pro/DashboardLayout
    }

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <>
            {/* Mobile Toggle Button (Visible only on small screens) */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-slate-900 border border-white/10 rounded-xl text-emerald-400 shadow-lg"
            >
                <Zap className="w-6 h-6" />
            </button>

            {/* Sidebar Container */}
            <div className={`
                fixed top-0 bottom-0 left-0 z-50
                flex flex-col items-center py-6 
                bg-[#020617]/40 backdrop-blur-2xl border-r border-emerald-500/10
                transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
                ${isMobileOpen ? 'w-[80px] translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-[80px] hover:lg:w-[96px]'}
            `}>

                {/* Brand Logo */}
                <div
                    className="mb-10 p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300"
                    onClick={() => navigate('/')}
                >
                    <Zap className="w-6 h-6 text-white fill-current" />
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 w-full flex flex-col items-center gap-6">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileOpen(false)} // Close on click (mobile)
                            className={({ isActive }) => {
                                const activeClass = 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]';
                                const inactiveClass = 'text-slate-500 hover:text-white hover:bg-white/5';
                                return `relative group p-4 rounded-2xl transition-all duration-300 ${isActive ? activeClass : inactiveClass}`;
                            }}
                        >
                            <item.icon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />

                            {/* Active Indicator Bar */}
                            <div className={`
                                absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full transition-all duration-300
                                group-[.active]:opacity-100 opacity-0 -translate-x-1 group-[.active]:translate-x-0
                            `} />

                            {/* Floating Tooltip (Desktop Only) */}
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-6 px-3 py-1.5 bg-slate-900 border border-emerald-500/20 text-emerald-100 text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 whitespace-nowrap pointer-events-none hidden lg:block shadow-xl">
                                {item.label}
                            </div>
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="mt-auto flex flex-col items-center gap-6 mb-4">
                    <button
                        onClick={handleLogout}
                        className="group p-3 rounded-xl text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Disconnect"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>

                    {/* Status Indicator */}
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></div>
                </div>
            </div>

            {/* Overlay for Mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
