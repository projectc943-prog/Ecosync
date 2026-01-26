import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
    // Default to Hyderabad (Fallback)
    const [activeLocation, setActiveLocation] = useState({
        name: 'DETECTING...',
        lat: 17.3850,
        lon: 78.4867,
        temp: 0,
        humidity: 0
    });

    const triggerLocate = () => {
        return new Promise((resolve, reject) => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;

                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await res.json();
                        const city = data.address.city || data.address.town || data.address.village || "Unknown Location";

                        const newLoc = {
                            name: city.toUpperCase(),
                            lat: latitude,
                            lon: longitude,
                            temp: 0,
                            humidity: 0
                        };

                        setActiveLocation(newLoc);
                        resolve(newLoc);
                    } catch (err) {
                        console.error("Geocoding failed:", err);
                        reject(err);
                    }
                }, (error) => {
                    console.error("Location access denied:", error);
                    reject(error);
                });
            } else {
                reject(new Error("Geolocation not supported"));
            }
        });
    };

    const updateLocation = (newLoc) => {
        console.log("Global Location Updated:", newLoc);
        setActiveLocation(newLoc);
    };

    return (
        <LocationContext.Provider value={{ activeLocation, updateLocation, triggerLocate }}>
            {children}
        </LocationContext.Provider>
    );
};
