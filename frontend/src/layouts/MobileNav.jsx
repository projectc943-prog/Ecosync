import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, BarChart3, User, Globe } from 'lucide-react';

const MobileNav = () => {
    const items = [
        { icon: LayoutDashboard, label: 'Dash', path: '/dashboard' },
        { icon: Globe, label: 'Map', path: '/map' },
        { icon: Map, label: 'Global', path: '/global' },
        { icon: BarChart3, label: 'Data', path: '/analytics' },
        { icon: User, label: 'User', path: '/profile' },
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-slate-950/80 backdrop-blur-2xl border-t border-emerald-500/20 px-6 py-3 flex justify-between items-center rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            {items.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `
                        flex flex-col items-center gap-1 transition-all duration-300
                        ${isActive ? 'text-emerald-400 scale-110' : 'text-slate-500'}
                    `}
                >
                    {({ isActive }) => (
                        <>
                            <item.icon size={20} className={isActive ? 'fill-current opacity-20' : ''} />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
                            {/* Active Glow Indicator */}
                            <div className={`w-1 h-1 bg-emerald-500 rounded-full transition-all duration-300 mt-0.5 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                        </>
                    )}
                </NavLink>
            ))}
        </div>
    );
};

export default MobileNav;
