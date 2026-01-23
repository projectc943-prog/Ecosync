import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Wifi, Navigation } from 'lucide-react';
import L from 'leaflet';

// Fix for default marker icon in React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const MapComponent = ({ center = [17.3850, 78.4867], zoom = 13 }) => {
    // Default to Hyderabad coordinates
    const [position, setPosition] = useState(center);

    useEffect(() => {
        // Simple geolocation if available
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setPosition([pos.coords.latitude, pos.coords.longitude]);
                },
                (err) => {
                    console.warn("Geolocation access denied or failed:", err);
                }
            );
        }
    }, []);

    return (
        <div className="h-full w-full rounded-xl overflow-hidden border border-white/10 shadow-inner relative z-0">
            <MapContainer
                center={position}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                {/* Dark Mode Tiles */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* User Position Marker */}
                <Marker position={position}>
                    <Popup className="custom-popup">
                        <div className="p-2">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Navigation size={16} className="text-blue-600" />
                                Operative Location
                            </h3>
                            <p className="text-xs text-slate-600 mt-1">
                                Lat: {position[0].toFixed(4)} <br />
                                Long: {position[1].toFixed(4)}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 font-bold">
                                <Wifi size={12} /> Signal Strong
                            </div>
                        </div>
                    </Popup>
                </Marker>

                {/* Example Sensor Node Marker (Offset from center) */}
                <Marker position={[position[0] + 0.002, position[1] + 0.002]}>
                    <Popup>
                        <div className="p-2">
                            <h3 className="font-bold text-slate-800">Sensor Node: Alpha</h3>
                            <p className="text-xs text-slate-600">Status: Active</p>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default MapComponent;
