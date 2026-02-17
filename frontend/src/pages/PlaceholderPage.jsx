import React from 'react';
import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';

const PlaceholderPage = () => {
    const location = useLocation();
    const pageName = location.pathname.split('/')[1].replace('-', ' ').toUpperCase();

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center h-[80vh] animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700">
                <Construction size={48} className="text-emerald-400" />
            </div>
            <h1 className="text-4xl font-black text-slate-200 mb-2 tracking-tight">{pageName}</h1>
            <p className="text-slate-400 max-w-md">
                This feature is currently under development. Stay tuned for updates!
            </p>
        </div>
    );
};

export default PlaceholderPage;
