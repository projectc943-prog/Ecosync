import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

/**
 * Custom hook for tracking and updating user location
 * Automatically gets browser geolocation and updates backend
 */
export const useLocationTracking = (userEmail) => {
    const [location, setLocation] = useState({
        lat: null,
        lon: null,
        name: null,
        loading: true,
        error: null,
        lastUpdated: null
    });

    const [permissionStatus, setPermissionStatus] = useState('prompt');

    // Get location name from coordinates using reverse geocoding
    const getLocationName = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
                {
                    headers: {
                        'User-Agent': 'EcoSync/1.0'
                    }
                }
            );
            const data = await response.json();

            const locationName = data.address?.city ||
                data.address?.town ||
                data.address?.village ||
                data.address?.state ||
                'Unknown Location';

            return locationName;
        } catch (error) {
            console.error('Failed to get location name:', error);
            return 'Unknown Location';
        }
    };

    // Update location in backend database
    const updateLocationInBackend = async (lat, lon, locationName) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                console.warn('No auth token found, skipping location update');
                return false;
            }

            const response = await fetch(`${API_BASE_URL}/api/user/location`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    location_lat: lat,
                    location_lon: lon,
                    location_name: locationName
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Backend error:', errorData);
                throw new Error('Failed to update location in backend');
            }

            const result = await response.json();
            console.log('✅ Location updated in database:', result);
            return true;
        } catch (error) {
            console.error('❌ Failed to update location in backend:', error);
            return false;
        }
    };

    // Get current location from browser
    const getCurrentLocation = () => {
        console.log('🌍 Requesting browser location...');
        setLocation(prev => ({ ...prev, loading: true, error: null }));

        if (!navigator.geolocation) {
            const errorMsg = 'Geolocation is not supported by your browser';
            console.error('❌', errorMsg);
            setLocation(prev => ({
                ...prev,
                loading: false,
                error: errorMsg
            }));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                console.log('📍 Got coordinates:', { lat, lon });

                // Get location name
                const locationName = await getLocationName(lat, lon);
                console.log('🏙️ Location name:', locationName);

                // Update state
                setLocation({
                    lat,
                    lon,
                    name: locationName,
                    loading: false,
                    error: null,
                    lastUpdated: new Date()
                });

                setPermissionStatus('granted');

                // Update backend
                if (userEmail) {
                    await updateLocationInBackend(lat, lon, locationName);
                }
            },
            (error) => {
                console.error('❌ Geolocation error:', error);

                let errorMessage = 'Failed to get location';
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage = 'Location permission denied';
                    setPermissionStatus('denied');
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    errorMessage = 'Location information unavailable';
                } else if (error.code === error.TIMEOUT) {
                    errorMessage = 'Location request timed out';
                }

                setLocation(prev => ({
                    ...prev,
                    loading: false,
                    error: errorMessage
                }));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    // Auto-fetch location on mount (if user is logged in)
    useEffect(() => {
        if (userEmail) {
            console.log('🎯 Auto-fetching location for user:', userEmail);
            // Small delay to ensure component is mounted
            const timer = setTimeout(() => {
                getCurrentLocation();
            }, 1000);

            return () => clearTimeout(timer);
        } else {
            console.log('⚠️ No user email, skipping location tracking');
            setLocation(prev => ({ ...prev, loading: false }));
        }
    }, [userEmail]);

    return {
        location,
        permissionStatus,
        refreshLocation: getCurrentLocation,
        isLoading: location.loading
    };
};

export default useLocationTracking;
