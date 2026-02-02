import React, { useState } from 'react';
import API_BASE_URL from '../config';

/**
 * Simple location test button component
 * Click to manually test location tracking
 */
const LocationTestButton = ({ userEmail }) => {
    const [status, setStatus] = useState('Click to test location');
    const [loading, setLoading] = useState(false);

    const testLocation = async () => {
        setLoading(true);
        setStatus('Requesting location...');

        if (!navigator.geolocation) {
            setStatus('❌ Geolocation not supported');
            setLoading(false);
            return;
        }

        try {
            // Get location
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000
                });
            });

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            setStatus(`📍 Got: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);

            // Get city name
            let city = 'Unknown';
            try {
                const geoResponse = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
                    { headers: { 'User-Agent': 'EcoSync/1.0' } }
                );
                if (geoResponse.ok) {
                    const geoData = await geoResponse.json();
                    city = geoData.address?.city || geoData.address?.town || 'Unknown';
                }
            } catch (geoErr) {
                console.warn("Nominatim fetch failed", geoErr);
            }

            setStatus(`🏙️ Location: ${city}`);

            // Update backend - Explicitly use port 8009 if API_BASE_URL is generic
            const token = localStorage.getItem('access_token');
            // Force 8009 if running locally to avoid port mismatch
            const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:8009' : API_BASE_URL;

            if (token) {
                console.log(`Sending PUT to ${backendUrl}/api/user/location`);
                const response = await fetch(`${backendUrl}/api/user/location`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        location_lat: lat,
                        location_lon: lon,
                        location_name: city
                    })
                });

                if (response.ok) {
                    setStatus(`✅ Updated: ${city}`);
                } else {
                    const errText = await response.text();
                    console.error("Backend Error:", errText);
                    setStatus(`❌ API Error: ${response.status}`);
                }
            } else {
                setStatus('⚠️ No Auth Token (Login first)');
            }
        } catch (error) {
            if (error.code === 1) {
                setStatus('⚠️ Permission denied');
            } else {
                console.error("Test Location Error:", error);
                setStatus(`❌ Error: ${error.message}`);
            }
        }

        setLoading(false);
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            background: '#1a1a1a',
            border: '2px solid #10b981',
            borderRadius: '8px',
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
            <button
                onClick={testLocation}
                disabled={loading}
                style={{
                    background: loading ? '#666' : '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    width: '100%'
                }}
            >
                {loading ? '⏳ Testing...' : '📍 Test Location'}
            </button>
            <div style={{
                color: '#10b981',
                fontSize: '12px',
                textAlign: 'center',
                fontFamily: 'monospace'
            }}>
                {status}
            </div>
        </div>
    );
};

export default LocationTestButton;
