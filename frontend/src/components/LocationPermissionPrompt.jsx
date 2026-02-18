import React, { useState, useEffect } from 'react';
import { MapPin, X, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * LocationPermissionPrompt - A prominent UI component that requests browser location permission
 * Shows before the app loads and triggers the native browser location permission dialog
 */
const LocationPermissionPrompt = ({ onPermissionGranted, onPermissionDenied, userId }) => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [permissionState, setPermissionState] = useState('prompt'); // 'prompt', 'requesting', 'granted', 'denied'
    const [locationName, setLocationName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        checkLocationPermission();
    }, []);

    const checkLocationPermission = async () => {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            setError('Location services not supported by your browser');
            setPermissionState('denied');
            onPermissionDenied?.();
            return;
        }

        // Check if permission API is available
        if (navigator.permissions) {
            try {
                const result = await navigator.permissions.query({ name: 'geolocation' });

                if (result.state === 'granted') {
                    // Check if THIS specific user has consented before
                    const hasConsented = userId ? localStorage.getItem(`location_consent_${userId}`) : null;

                    if (hasConsented) {
                        // Already granted AND consented — get location silently and notify parent
                        setPermissionState('granted');
                        getCurrentLocationSilent();
                    } else {
                        // Browser allowed, but user hasn't seen our prompt yet — show it
                        setShowPrompt(true);
                    }
                } else if (result.state === 'denied') {
                    setPermissionState('denied');
                    // Don't show prompt if browser has permanently denied — just notify parent
                    onPermissionDenied?.();
                } else {
                    // Prompt state - show our custom UI
                    setShowPrompt(true);
                }

                // Listen for permission changes
                result.addEventListener('change', () => {
                    if (result.state === 'granted') {
                        setPermissionState('granted');
                        getCurrentLocation();
                    } else if (result.state === 'denied') {
                        setPermissionState('denied');
                        onPermissionDenied?.();
                    }
                });
            } catch (err) {
                console.error('Permission API error:', err);
                setShowPrompt(true);
            }
        } else {
            // Fallback for browsers without Permissions API
            setShowPrompt(true);
        }
    };

    // Silent location fetch (when already consented) — notifies parent without showing UI
    const getCurrentLocationSilent = () => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                let city = 'Location detected';

                try {
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
                    );
                    const data = await response.json();
                    city = data.city || data.locality || data.principalSubdivision || 'Unknown Location';
                } catch (err) {
                    console.error('Geocoding error:', err);
                }

                onPermissionGranted?.({ lat, lon, name: city });
            },
            () => {
                // Silent failure — just notify denied
                onPermissionDenied?.();
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    };

    const getCurrentLocation = () => {
        setPermissionState('requesting');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                let city = 'Location detected';

                // Get location name via reverse geocoding
                try {
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
                    );
                    const data = await response.json();
                    city = data.city || data.locality || data.principalSubdivision || 'Unknown Location';
                    setLocationName(city);
                } catch (err) {
                    console.error('Geocoding error:', err);
                    setLocationName('Location detected');
                }

                setPermissionState('granted');
                setShowPrompt(false);

                // Save consent for this user
                if (userId) {
                    localStorage.setItem(`location_consent_${userId}`, 'true');
                }

                // Notify parent component with the resolved city name directly
                onPermissionGranted?.({ lat, lon, name: city });
            },
            (error) => {
                console.error('Location error:', error);
                setPermissionState('denied');

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setError('Location access denied. Please enable location in your browser settings.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setError('Location information unavailable.');
                        break;
                    case error.TIMEOUT:
                        setError('Location request timed out.');
                        break;
                    default:
                        setError('An unknown error occurred.');
                }

                onPermissionDenied?.();
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const handleAllowClick = () => {
        getCurrentLocation();
    };

    const handleDenyClick = () => {
        setPermissionState('denied');
        setShowPrompt(false);
        onPermissionDenied?.();
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative bg-gradient-to-br from-emerald-950 to-teal-950 border-2 border-emerald-500/30 rounded-3xl p-8 max-w-md w-full mx-4 shadow-[0_0_60px_-15px_rgba(16,185,129,0.4)] animate-in zoom-in-95 duration-500">

                {/* Close button (only if permission can be skipped) */}
                <button
                    onClick={handleDenyClick}
                    className="absolute top-4 right-4 text-emerald-400/60 hover:text-emerald-400 transition-colors"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
                        <div className="relative bg-emerald-500/10 p-6 rounded-full border border-emerald-500/30">
                            <MapPin size={48} className="text-emerald-400 animate-bounce" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white text-center mb-3 font-mono tracking-tight">
                    Enable Location Services
                </h2>

                {/* Description */}
                <p className="text-emerald-100/80 text-center text-sm mb-6 leading-relaxed">
                    EcoSync needs your location to provide <span className="text-emerald-400 font-semibold">location-aware environmental alerts</span> and track air quality in your area.
                </p>

                {/* Features list */}
                <div className="bg-emerald-950/50 rounded-xl p-4 mb-6 border border-emerald-500/20">
                    <ul className="space-y-2 text-xs text-emerald-200/90">
                        <li className="flex items-start gap-2">
                            <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                            <span>Real-time alerts based on your location</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                            <span>Track environmental data as you move</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                            <span>Personalized air quality monitoring</span>
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
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {permissionState === 'requesting' ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Requesting...
                            </>
                        ) : (
                            <>
                                <MapPin size={16} />
                                Allow Location
                            </>
                        )}
                    </button>
                </div>

                {/* Privacy note */}
                <p className="text-emerald-400/50 text-[10px] text-center mt-4 font-mono uppercase tracking-wider">
                    🔒 Your location is only used for alerts • Never shared
                </p>
            </div>
        </div>
    );
};

export default LocationPermissionPrompt;
