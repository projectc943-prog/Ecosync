import React from 'react';
import { X, Bell, Shield, Moon, Wifi } from 'lucide-react';

const SettingsDialog = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1e2329] border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-lg font-bold text-white tracking-wide">SYSTEM SETTINGS</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Section 1 */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-emerald-500 uppercase flex items-center gap-2">
                            <Bell size={14} /> Alerts
                        </h3>
                        <label className="flex items-center justify-between group cursor-pointer">
                            <span className="text-sm text-gray-300 group-hover:text-white">Push Notifications</span>
                            <input type="checkbox" defaultChecked className="toggle-checkbox" />
                        </label>
                        <label className="flex items-center justify-between group cursor-pointer">
                            <span className="text-sm text-gray-300 group-hover:text-white">Hazardous Air Warning</span>
                            <input type="checkbox" defaultChecked className="toggle-checkbox" />
                        </label>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-indigo-500 uppercase flex items-center gap-2">
                            <Wifi size={14} /> Connectivity
                        </h3>
                        <label className="flex items-center justify-between group cursor-pointer">
                            <span className="text-sm text-gray-300 group-hover:text-white">Data Saver Mode</span>
                            <input type="checkbox" className="toggle-checkbox" />
                        </label>
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-amber-500 uppercase flex items-center gap-2">
                            <Shield size={14} /> Privacy
                        </h3>
                        <label className="flex items-center justify-between group cursor-pointer">
                            <span className="text-sm text-gray-300 group-hover:text-white">Anonymous Data Contribution</span>
                            <input type="checkbox" defaultChecked className="toggle-checkbox" />
                        </label>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-700 flex justify-end">
                    <button onClick={onClose} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-6 rounded-lg text-xs tracking-widest transition-all shadow-lg shadow-emerald-900/20">
                        SAVE CONFIG
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsDialog;
