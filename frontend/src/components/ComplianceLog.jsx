import React, { useState } from 'react';
import { ClipboardCheck, CheckCircle2, AlertCircle, Clock, CalendarDays } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ComplianceLog = () => {
    // Real daily tasks from API
    const [tasks, setTasks] = useState([]);
    const { currentUser } = useAuth(); // Get current user for verification

    const [error, setError] = useState(null);

    // Fetch logs on mount
    React.useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setError(null);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/compliance/logs`);
            if (!res.ok) throw new Error(`API Error: ${res.status}`);

            const data = await res.json();
            // Map API data to component structure
            if (Array.isArray(data)) {
                const mapped = data.map(log => ({
                    id: log.id,
                    task: log.task_name,
                    status: log.status, // "PENDING" or "COMPLETED"
                    verifiedBy: log.verified_by || "-",
                    time: "09:00 AM" // Placeholder time or add to DB model later
                }));
                setTasks(mapped);
            } else {
                setTasks([]);
            }
        } catch (e) {
            console.error("Failed to fetch compliance logs", e);
            setError(e.message);
        }
    };

    const toggleStatus = async (id) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/compliance/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    task_id: id,
                    verifier_name: currentUser?.email || "Unknown User"
                })
            });

            if (res.ok) {
                // Refresh logs to get updated server state
                fetchLogs();
            }
        } catch (e) {
            console.error("Verification failed", e);
        }
    };

    return (
        <div className="h-full w-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-emerald-900/20 scrollbar-track-transparent">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <ClipboardCheck className="text-emerald-400" size={24} />
                        Daily Safety Log
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                        SHIFT: A (08:00 - 16:00) | DATE: {new Date().toLocaleDateString()}
                    </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 flex items-center gap-2">
                    <CalendarDays size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-300">COMPLIANCE: 40%</span>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 mb-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-xs">
                    ⚠️ Failed to load logs: {error}. Is backend running?
                </div>
            )}

            {/* Tasks List */}
            <div className="space-y-3">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        onClick={() => toggleStatus(task.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer group relative overflow-hidden ${task.status === "COMPLETED"
                            ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-slate-900/40 border-slate-800 hover:border-slate-600"
                            }`}
                    >
                        {/* Status Indicator Bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.status === "COMPLETED" ? 'bg-emerald-500' : 'bg-slate-700'}`} />

                        <div className="flex justify-between items-center pl-2">
                            <div>
                                <h4 className={`font-bold text-sm ${task.status === "COMPLETED" ? 'text-emerald-100 line-through decoration-emerald-500/50' : 'text-slate-200'}`}>
                                    {task.task}
                                </h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                                        <Clock size={10} /> {task.time}
                                    </span>
                                    {task.status === "COMPLETED" && (
                                        <span className="text-[10px] text-emerald-400/80 font-bold">
                                            VERIFIED BY: {task.verifiedBy.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className={`p-2 rounded-full transition-colors ${task.status === "COMPLETED" ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-600'
                                }`}>
                                {task.status === "COMPLETED" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Summary */}
            <div className="mt-6 p-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/30 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">PESO SAFETY MANDATE</p>
                <p className="text-sm text-slate-400">
                    All logs must be digitally signed by shift supervisor before handover.
                </p>
            </div>
        </div>
    );
};

export default ComplianceLog;
