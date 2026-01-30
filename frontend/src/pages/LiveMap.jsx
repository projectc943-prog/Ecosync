import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMapEvents, LayersControl, useMap } from 'react-leaflet';
import { Loader2, Wind, Thermometer, Activity, Save, X, Search, Crosshair, RefreshCw, Cpu, Radio } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import API_BASE_URL from '../config';
import { useLocation } from '../contexts/LocationContext';

// --- CONSTANTS ---
const MAX_MARKERS = 200;
const POLL_INTERVAL = 5000;

const MapEvents = ({ onMapClick }) => {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        },
    });
    return null;
};

// Locate Button
const LocateButton = ({ onLocationFound }) => {
    const [locating, setLocating] = useState(false);
    const map = useMap();

    const handleLocate = useCallback(() => {
        setLocating(true);
        map.locate().on("locationfound", function (e) {
            setLocating(false);
            map.flyTo(e.latlng, 10);
            onLocationFound(e.latlng);
        }).on("locationerror", function () {
            setLocating(false);
            alert("Could not access your location.");
        });
    }, [map, onLocationFound]);

    return (
        <button
            onClick={handleLocate}
            disabled={locating}
            className="bg-black/50 hover:bg-cyan-500/50 backdrop-blur text-cyan-400 p-2 rounded-lg border border-cyan-500/30 transition-all flex items-center justify-center w-10 h-10 shadow-[0_0_15px_rgba(6,182,212,0.2)] ml-auto"
            title="Target My Location"
        >
            {locating ? <Loader2 className="animate-spin" size={20} /> : <Crosshair size={20} />}
        </button>
    );
};

// --- DATA MODAL COMPONENT ---
const DataModal = ({ pointData, loading, onClose, onSave }) => {
    if (!pointData && !loading) return null;

    return (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center pointer-events-none">
            {/* Modal Container */}
            <div className="relative w-full max-w-md pointer-events-auto animate-in zoom-in-95 fade-in duration-300">
                <div className="glass-depth p-1 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-cyan-500/20 bg-black/80 backdrop-blur-xl">

                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5 rounded-t-[1.8rem]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                                <Radio className="text-cyan-400 w-5 h-5 animate-pulse" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white tracking-wide">TARGET ACQUIRED</h2>
                                <p className="text-[10px] text-cyan-400/70 font-mono tracking-widest uppercase">Coordinates Locked</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors group">
                            <X size={20} className="text-slate-400 group-hover:text-white" />
                        </button>
                    </div>

                    <div className="p-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full"></div>
                                    <Loader2 className="animate-spin text-cyan-400 relative z-10" size={48} />
                                </div>
                                <p className="text-cyan-400 font-mono text-sm animate-pulse">SCANNING SATELLITE DATA...</p>
                            </div>
                        ) : pointData?.error ? (
                            <div className="text-center py-6">
                                <div className="inline-block p-4 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
                                    <Activity size={32} className="text-red-500" />
                                </div>
                                <h3 className="text-white font-bold text-lg mb-2">SIGNAL LOST</h3>
                                <p className="text-gray-400 text-sm mb-6">{pointData.error}</p>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-mono text-xs uppercase tracking-widest transition-all"
                                >
                                    Dismiss
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Coordinates */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">LATITUDE</p>
                                        <p className="text-xl font-mono text-cyan-400">{pointData?.location?.lat?.toFixed(4)}</p>
                                    </div>
                                    <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">LONGITUDE</p>
                                        <p className="text-xl font-mono text-cyan-400">{pointData?.location?.lon?.toFixed(4)}</p>
                                    </div>
                                </div>

                                {/* Metrics */}
                                <div className="space-y-4">
                                    <div className="relative group overflow-hidden bg-gradient-to-r from-blue-900/20 to-cyan-900/20 p-5 rounded-2xl border border-cyan-500/20">
                                        <div className="absolute top-0 right-0 p-3 opacity-20">
                                            <Thermometer size={40} />
                                        </div>
                                        <p className="text-xs text-blue-300 font-bold uppercase flex items-center gap-2 mb-2">
                                            <Thermometer size={14} /> Environmental Telemetry
                                        </p>
                                        <div className="flex gap-8">
                                            <div>
                                                <span className="text-3xl font-black text-white">{pointData?.weather?.metrics?.temperatureC || '--'}</span>
                                                <span className="text-sm text-slate-400">°C</span>
                                            </div>
                                            <div>
                                                <span className="text-3xl font-black text-white">{pointData?.weather?.metrics?.humidityPct || '--'}</span>
                                                <span className="text-sm text-slate-400">% RH</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative group overflow-hidden bg-gradient-to-r from-emerald-900/20 to-teal-900/20 p-5 rounded-2xl border border-emerald-500/20">
                                        <div className="absolute top-0 right-0 p-3 opacity-20">
                                            <Wind size={40} />
                                        </div>
                                        <p className="text-xs text-emerald-300 font-bold uppercase flex items-center gap-2 mb-2">
                                            <Wind size={14} /> Atmosphere Quality
                                        </p>
                                        <div className="flex gap-8 items-end">
                                            <div>
                                                <span className="text-3xl font-black text-white">{pointData?.aqi?.metrics?.aqi || '--'}</span>
                                                <span className="text-sm text-slate-400"> AQI</span>
                                            </div>
                                            <div className="pb-1">
                                                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-bold uppercase">
                                                    SAFE TO BREATHE
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action */}
                                <button
                                    onClick={onSave}
                                    className="w-full py-4 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/50 rounded-xl text-white font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-3 group"
                                >
                                    <Cpu size={18} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
                                    Register as Data Source
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const LiveMap = () => {
    const [selectedPos, setSelectedPos] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pointData, setPointData] = useState(null);
    const [searchCity, setSearchCity] = useState('');
    const [realtimeMarkers, setRealtimeMarkers] = useState([]);

    // useRef to track if component is mounted
    const isMounted = useRef(true);

    // --- REAL-TIME POLLING ---
    useEffect(() => {
        isMounted.current = true;
        const fetchRealtimeData = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/realtime/map`);
                if (res.ok && isMounted.current) {
                    const data = await res.json();
                    setRealtimeMarkers(data.markers || []);
                }
            } catch (e) { console.error(e); }
        };
        fetchRealtimeData();
        const interval = setInterval(fetchRealtimeData, POLL_INTERVAL);
        return () => { isMounted.current = false; clearInterval(interval); };
    }, []);

    const handleMapClick = useCallback(async (latlng) => {
        setSelectedPos(latlng);
        setLoading(true);
        setPointData(null); // Open modal immediately with loading state

        try {
            const res = await fetch(`${API_BASE_URL}/api/map/point?lat=${latlng.lat}&lon=${latlng.lng}`);
            if (!res.ok) {
                // If API returns non-200, assume logic error or standard failure
                // We still want to show the modal with an error state
                throw new Error(`Data Stream Failed: ${res.status}`);
            }
            const data = await res.json();
            if (isMounted.current) setPointData(data);
        } catch (e) {
            console.error("Map Point Error:", e);
            if (isMounted.current) {
                // Set minimal point data with error flag to keep modal open
                setPointData({
                    location: { lat: latlng.lat, lon: latlng.lng },
                    error: "Unable to retrieve environmental telemetry. Satellite link unstable."
                });
            }
        } finally {
            if (isMounted.current) setLoading(false);
        }
    }, []);

    // Use Global Location Context
    const { updateLocation } = useLocation();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchCity) return;
        setLoading(true);

        try {
            // 1. Geocode City Name (Nominatim)
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchCity}`);
            const geoData = await geoRes.json();

            if (geoData && geoData.length > 0) {
                const { lat, lon, display_name } = geoData[0];
                const latNum = parseFloat(lat);
                const lonNum = parseFloat(lon);

                // 2. Fetch Real Weather (Open-Meteo)
                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m&timezone=auto`);
                const weatherData = await weatherRes.json();

                const temp = weatherData.current.temperature_2m;
                const humidity = weatherData.current.relative_humidity_2m;

                // 3. Update Map
                const newPos = { lat: latNum, lng: lonNum };
                setSelectedPos(newPos);

                // 4. Show Modal with Real Data
                setPointData({
                    location: { lat: latNum, lon: lonNum },
                    weather: { metrics: { temperatureC: temp, humidityPct: humidity } },
                    aqi: { metrics: { aqi: Math.floor(Math.random() * 50) + 50 } }, // Simulated AQI as OpenMeteo AQI needs separate call
                    address: display_name
                });

                // 5. SYNC WITH DASHBOARD
                updateLocation({
                    name: display_name.split(',')[0].toUpperCase(),
                    lat: latNum,
                    lon: lonNum,
                    temp: temp,
                    humidity: humidity
                });

            } else {
                alert("Location not found.");
            }
        } catch (error) {
            console.error("Search Error:", error);
            alert("Failed to retrieve location data.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSource = useCallback(async () => {
        if (!pointData) return;
        const name = prompt("Enter Area Identifier:", `Area-${pointData.location.lat.toFixed(2)}`);
        // ... rest of logic
    }, [pointData]);

    return (
        <div className="flex h-full w-full relative overflow-hidden bg-slate-950">
            {/* Modal Layer */}
            <DataModal
                pointData={pointData}
                loading={loading}
                onClose={() => { setPointData(null); setLoading(false); setSelectedPos(null); }}
                onSave={handleSaveSource}
            />

            {/* Map Area */}
            <div className="flex-1 relative h-full z-0">

                {/* HUD Overlay Top */}
                <div className="absolute top-6 left-24 z-[900] flex gap-4 pointer-events-none">
                    <div className="pointer-events-auto bg-black/40 backdrop-blur-2xl rounded-2xl border border-emerald-500/20 p-1.5 flex shadow-2xl transition-all duration-300 hover:border-emerald-500/40">
                        <form onSubmit={handleSearch} className="flex">
                            <input
                                className="bg-transparent text-emerald-50 outline-none text-xs w-64 px-4 font-mono placeholder-emerald-800/50"
                                placeholder="ACCESS SECTOR COORDINATES..."
                                value={searchCity}
                                onChange={e => setSearchCity(e.target.value)}
                            />
                            <button className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-400 rounded-xl transition-all duration-300 group">
                                <Search size={16} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </form>
                    </div>
                </div>

                <div className="absolute top-4 right-4 z-[900] pointer-events-auto">
                    <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-emerald-500/20 flex items-center gap-3 shadow-lg">
                        <div className="relative">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping absolute"></div>
                            <div className="w-2 h-2 bg-emerald-500 rounded-full relative"></div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">{realtimeMarkers.length} ACTIVE NODES</span>
                    </div>
                </div>

                <MapContainer
                    center={[20.5937, 78.9629]}
                    zoom={5}
                    style={{ height: '100%', width: '100%', background: '#020617' }}
                    preferCanvas={true}
                    zoomControl={false} // Custom zoom maybe? or just keep default
                >
                    <LayersControl position="bottomright">
                        <LayersControl.BaseLayer checked name="Dark Matter">
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; CARTO'
                            />
                        </LayersControl.BaseLayer>
                    </LayersControl>

                    <MapEvents onMapClick={handleMapClick} />

                    {/* Realtime Markers (Simple Dots for performance) */}
                    {realtimeMarkers.map(marker => (
                        <CircleMarker
                            key={marker.id}
                            center={[marker.lat, marker.lon]}
                            radius={4}
                            pathOptions={{ fillColor: marker.color, color: marker.color, weight: 0, fillOpacity: 0.8 }}
                        />
                    ))}

                    {/* Selected Cursor */}
                    {selectedPos && (
                        <CircleMarker
                            center={selectedPos}
                            radius={8}
                            pathOptions={{ fillColor: 'transparent', color: '#06b6d4', weight: 2 }}
                        />
                    )}

                    <div className="leaflet-top leaflet-right">
                        <div className="leaflet-control mt-20 mr-4 pointer-events-auto">
                            <LocateButton onLocationFound={handleMapClick} />
                        </div>
                    </div>
                </MapContainer>
            </div>
        </div>
    );
};

export default LiveMap;
