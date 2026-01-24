import React from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, Map, Server, Zap, LogOut, TrendingUp, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode') || localStorage.getItem('dashboardMode') || 'lite';
    const isPro = mode === 'pro';

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Activity, label: 'Analysis', path: '/analysis' },
        { icon: Map, label: 'Global Map', path: '/global' }, // [NEW]
        { icon: BarChart3, label: 'Analytics', path: '/analytics' }, // [NEW]
    ];

    if (isPro) {
        navItems.splice(1, 0, { icon: TrendingUp, label: 'Analytics', path: '/analytics' });
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
        <div className="h-screen w-20 flex flex-col items-center py-8 glass-depth border-r border-white/10 relative z-50">
            {/* Brand Icon */}
            <div className="mb-12 p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 flex flex-col items-center justify-center">
                <Zap className="w-6 h-6 text-white" fill="white" />
                <span className="text-[10px] font-black text-white mt-1">ECOSYNC</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 w-full flex flex-col items-center gap-6">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
              p-3 rounded-xl transition-all duration-300 group relative
              ${isActive
                                ? 'bg-white/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'}
            `}
                    >
                        <item.icon className="w-6 h-6" strokeWidth={1.5} />

                        {/* Tooltip */}
                        <span className="absolute left-16 px-2 py-1 bg-slate-900 text-cyan-400 text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-cyan-500/20 pointer-events-none">
                            {item.label}
                        </span>
                    </NavLink>
                ))}
            </nav>

            {/* Logout / Status */}
            <div className="mt-auto flex flex-col items-center gap-4">
                <button
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-300 transition-colors p-2 group relative"
                    title="Logout"
                >
                    <LogOut size={20} />
                    <span className="absolute left-16 px-2 py-1 bg-slate-900 text-red-400 text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-red-500/20 pointer-events-none">
                        Logout
                    </span>
                </button>
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"></div>
            </div>
        </div>
    );
};

export default Sidebar;
