import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LightDashboard from './LightDashboard';
import ProDashboard from './ProDashboard';
import API_BASE_URL from '../config';
import LocationTestButton from '../components/LocationTestButton';
import LocationPermissionPrompt from '../components/LocationPermissionPrompt';
import NotificationPermissionPrompt from '../components/NotificationPermissionPrompt';
import pushNotificationManager from '../utils/pushNotifications';


const Dashboard = () => {
    const { userProfile, currentUser } = useAuth();
    const [isProMode, setIsProMode] = useState(false);

    const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
    const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);


    // Notification Prompt Trigger with cleanup
    useEffect(() => {
        let timeoutId;
        if (locationPermissionGranted && 'Notification' in window) {
            // Let the component decide if it needs to show the prompt based on user consent
            timeoutId = setTimeout(() => setShowNotificationPrompt(true), 1500);
        }
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [locationPermissionGranted]);


    const handleLocationGranted = async (data) => {
        console.log('📍 Location Permission Granted via Prompt:', data);
        setLocationPermissionGranted(true);

        // Update Backend
        if (currentUser?.email) {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) return;

                await fetch(`${API_BASE_URL}/api/user/location`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        location_lat: data.lat,
                        location_lon: data.lon,
                        location_name: data.name
                    })
                });
                console.log("✅ Location synced to backend");
            } catch (e) {
                console.error("Failed to sync location", e);
            }
        }
    };

    const handleLocationDenied = () => {
        console.log("Location denied by user");
        setLocationPermissionGranted(true); // Don't block UI
    };

    const handleNotificationGranted = async () => {
        setShowNotificationPrompt(false);
        await pushNotificationManager.subscribe(API_BASE_URL);
    };

    const handleNotificationDenied = () => {
        setShowNotificationPrompt(false);
    };

    // Sync with User Profile with cleanup
    useEffect(() => {
        if (userProfile?.plan === 'pro') {
            setIsProMode(true);
        }
        return () => {
            // Cleanup any subscriptions or timers if needed
        };
    }, [userProfile]);

    const handleToggle = () => {
        setIsProMode(prev => !prev);
    };

    return (
        <>
            {/* Permission Prompts */}
            {!locationPermissionGranted && (
                <LocationPermissionPrompt
                    userId={currentUser?.email}
                    onPermissionGranted={handleLocationGranted}
                    onPermissionDenied={handleLocationDenied}
                />
            )}

            {showNotificationPrompt && (
                <NotificationPermissionPrompt
                    userId={currentUser?.email}
                    onPermissionGranted={handleNotificationGranted}
                    onPermissionDenied={handleNotificationDenied}
                />
            )}

            {isProMode
                ? <ProDashboard onToggle={handleToggle} />
                : <LightDashboard onToggle={handleToggle} />}

            {/* Manual Location Test Button */}
            <LocationTestButton userEmail={currentUser?.email} />
        </>
    );

};

export default Dashboard;
