import React, { useState, useEffect } from 'react';
import { Bell, X, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * NotificationPermissionPrompt - Requests browser notification permission
 * Enables push notifications even when the browser tab is closed
 */
const NotificationPermissionPrompt = ({ onPermissionGranted, onPermissionDenied, userId }) => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [permissionState, setPermissionState] = useState('default'); // 'default', 'requesting', 'granted', 'denied'
    const [error, setError] = useState('');

    useEffect(() => {
        checkNotificationPermission();
    }, []);

    const checkNotificationPermission = () => {
        // Check if notifications are supported
        if (!('Notification' in window)) {
            setError('Notifications not supported by your browser');
            setPermissionState('denied');
            onPermissionDenied?.();
            return;
        }

        // Check current permission state
        const permission = Notification.permission;

        // Check internal consent for this user
        const hasConsented = userId ? localStorage.getItem(`notification_consent_${userId}`) : null;

        if (permission === 'granted' && hasConsented) {
            // Already fully set up — notify parent silently
            setPermissionState('granted');
            onPermissionGranted?.();
        } else if (permission === 'denied') {
            // Browser has permanently denied — don't annoy user
            setPermissionState('denied');
            onPermissionDenied?.();
        } else {
            // Either 'default' or 'granted' without our consent record — show prompt
            setShowPrompt(true);
        }
    };

    const handleAllowClick = async () => {
        setPermissionState('requesting');

        try {
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                setPermissionState('granted');
                setShowPrompt(false);

                // Show a welcome notification
                new Notification('🌿 EcoSync Notifications Enabled!', {
                    body: 'You\'ll now receive environmental alerts even when this tab is closed.',
                    icon: '/favicon.ico',
                    badge: '/favicon.ico',
                    tag: 'ecosync-welcome',
                    requireInteraction: false
                });

                // Save consent
                if (userId) {
                    localStorage.setItem(`notification_consent_${userId}`, 'true');
                }

                onPermissionGranted?.();
            } else {
                setPermissionState('denied');
                setError('Notification permission denied. You can enable it later in browser settings.');
                onPermissionDenied?.();
            }
        } catch (err) {
            console.error('Notification permission error:', err);
            setPermissionState('denied');
            setError('Failed to request notification permission');
            onPermissionDenied?.();
        }
    };

    const handleDenyClick = () => {
        setPermissionState('denied');
        setShowPrompt(false);
        onPermissionDenied?.();
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative bg-gradient-to-br from-cyan-950 to-blue-950 border-2 border-cyan-500/30 rounded-3xl p-8 max-w-md w-full mx-4 shadow-[0_0_60px_-15px_rgba(6,182,212,0.4)] animate-in zoom-in-95 duration-500">

                {/* Close button */}
                <button
                    onClick={handleDenyClick}
                    className="absolute top-4 right-4 text-cyan-400/60 hover:text-cyan-400 transition-colors"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl animate-pulse"></div>
                        <div className="relative bg-cyan-500/10 p-6 rounded-full border border-cyan-500/30">
                            <Bell size={48} className="text-cyan-400 animate-[wiggle_1s_ease-in-out_infinite]" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white text-center mb-3 font-mono tracking-tight">
                    Enable Push Notifications
                </h2>

                {/* Description */}
                <p className="text-cyan-100/80 text-center text-sm mb-6 leading-relaxed">
                    Get <span className="text-cyan-400 font-semibold">real-time environmental alerts</span> even when this tab is closed. Stay informed about air quality changes in your area.
                </p>

                {/* Features list */}
                <div className="bg-cyan-950/50 rounded-xl p-4 mb-6 border border-cyan-500/20">
                    <ul className="space-y-2 text-xs text-cyan-200/90">
                        <li className="flex items-start gap-2">
                            <CheckCircle size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                            <span>Receive alerts when browser tab is closed</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                            <span>Location-aware environmental notifications</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                            <span>Instant alerts for threshold breaches</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                            <span>Works on desktop and mobile browsers</span>
                        </li>
                    </ul>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                        <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-red-400 text-xs">{error}</p>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleDenyClick}
                        className="flex-1 py-3 px-4 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold text-sm transition-all border border-slate-700/50"
                        disabled={permissionState === 'requesting'}
                    >
                        Not Now
                    </button>
                    <button
                        onClick={handleAllowClick}
                        disabled={permissionState === 'requesting'}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {permissionState === 'requesting' ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Requesting...
                            </>
                        ) : (
                            <>
                                <Bell size={16} />
                                Enable Notifications
                            </>
                        )}
                    </button>
                </div>

                {/* Privacy note */}
                <p className="text-cyan-400/50 text-[10px] text-center mt-4 font-mono uppercase tracking-wider">
                    🔔 You can disable notifications anytime in settings
                </p>
            </div>
        </div>
    );
};

export default NotificationPermissionPrompt;
