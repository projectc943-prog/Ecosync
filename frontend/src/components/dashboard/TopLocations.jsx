import React, { useState, useEffect } from 'react';
import { Map, ArrowUp, ArrowDown } from 'lucide-react';

const CITIES = [
    { name: "Delhi", lat: 28.6139, lon: 77.2090 },
    { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
    { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
    { name: "Hyderabad", lat: 17.3850, lon: 78.4867 },
    { name: "Chennai", lat: 13.0827, lon: 80.2707 },
    { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
    { name: "Pune", lat: 18.5204, lon: 73.8567 },
    { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
    { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
    { name: "Visakhapatnam", lat: 17.6868, lon: 83.2185 },
    { name: "Surat", lat: 21.1702, lon: 72.8311 },
    { name: "Lucknow", lat: 26.8467, lon: 80.9461 }
];

const TopLocations = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel Fetch for all cities
                const promises = CITIES.map(city =>
                    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code&timezone=auto`)
                        .then(res => res.json())
                        .then(data => ({
                            city: city.name,
                            temp: data.current.temperature_2m,
                            code: data.current.weather_code
                        }))
                );

                const results = await Promise.all(promises);

                // Sort by Temp (High to Low)
                const sorted = results.sort((a, b) => b.temp - a.temp).map((item, index) => ({
                    ...item,
                    rank: index + 1,
                    condition: getCondition(item.code)
                }));

                setLocations(sorted);
            } catch (e) {
                console.error("Top Loc Error", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const getCondition = (code) => {
        if (code === 0) return "Clear";
        if (code < 3) return "Cloudy";
        if (code < 60) return "Fog";
        if (code < 80) return "Rain";
        return "Storm";
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Map size={14} className="text-orange-400" />
                    <h3 className="text-xs font-bold text-gray-400 uppercase">Pan-India Air Monitor</h3>
                </div>
                <div className="text-[10px] text-emerald-500 animate-pulse">● UPDATING</div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-[10px] text-gray-500 border-b border-gray-800">
                            <th className="pb-1 font-medium">RANK</th>
                            <th className="pb-1 font-medium">CITY</th>
                            <th className="pb-1 font-medium text-right">TEMP</th>
                            <th className="pb-1 font-medium text-right">COND</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs">
                        {loading ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan="4" className="py-2"><div className="h-4 bg-gray-800 rounded w-full"></div></td>
                                </tr>
                            ))
                        ) : locations.map((loc) => (
                            <tr key={loc.city} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors group">
                                <td className="py-2 font-mono text-gray-500">#{loc.rank}</td>
                                <td className="py-2 font-bold text-gray-200">{loc.city}</td>
                                <td className="py-2 text-right font-mono font-bold">
                                    <span className={loc.temp > 30 ? "text-orange-400" : "text-emerald-400"}>{loc.temp}°</span>
                                </td>
                                <td className="py-2 text-right text-gray-400 text-[10px] uppercase">{loc.condition}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TopLocations;
