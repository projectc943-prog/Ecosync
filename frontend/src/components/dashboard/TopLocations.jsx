import React, { useState, useEffect } from 'react';
import { Map, ArrowUp, ArrowDown } from 'lucide-react';

// Top 20 Indian Cities for Temperature Ranking
const CITIES = [
    { name: "Delhi", lat: 28.6139, lon: 77.2090, state: "Delhi" },
    { name: "Mumbai", lat: 19.0760, lon: 72.8777, state: "Maharashtra" },
    { name: "Bengaluru", lat: 12.9716, lon: 77.5946, state: "Karnataka" },
    { name: "Hyderabad", lat: 17.3850, lon: 78.4867, state: "Telangana" },
    { name: "Chennai", lat: 13.0827, lon: 80.2707, state: "Tamil Nadu" },
    { name: "Kolkata", lat: 22.5726, lon: 88.3639, state: "West Bengal" },
    { name: "Jaipur", lat: 26.9124, lon: 75.7873, state: "Rajasthan" },
    { name: "Lucknow", lat: 26.8467, lon: 80.9461, state: "Uttar Pradesh" },
    { name: "Bhopal", lat: 23.2599, lon: 77.4126, state: "Madhya Pradesh" },
    { name: "Ahmedabad", lat: 23.0225, lon: 72.5714, state: "Gujarat" },
    { name: "Nagpur", lat: 21.1458, lon: 79.0882, state: "Maharashtra" },
    { name: "Indore", lat: 22.7196, lon: 75.8577, state: "Madhya Pradesh" },
    { name: "Patna", lat: 25.5941, lon: 85.1376, state: "Bihar" },
    { name: "Vadodara", lat: 22.3072, lon: 73.1812, state: "Gujarat" },
    { name: "Ludhiana", lat: 30.9010, lon: 75.8573, state: "Punjab" },
    { name: "Agra", lat: 27.1767, lon: 78.0081, state: "Uttar Pradesh" },
    { name: "Nashik", lat: 19.9975, lon: 73.7898, state: "Maharashtra" },
    { name: "Faridabad", lat: 28.4089, lon: 77.3178, state: "Haryana" },
    { name: "Meerut", lat: 28.9845, lon: 77.7064, state: "Uttar Pradesh" },
    { name: "Rajkot", lat: 22.3039, lon: 70.8022, state: "Gujarat" }
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
                            state: city.state,
                            temp: data.current.temperature_2m,
                            code: data.current.weather_code
                        }))
                );

                const results = await Promise.all(promises);

                // Sort by Temp (High to Low)
                const sorted = results.sort((a, b) => b.temp - a.temp).slice(0, 10).map((item, index) => ({
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
                    <h3 className="text-xs font-bold text-gray-400 uppercase">India Top 10 States (Predictive Metrics)</h3>
                </div>
                <div className="text-[10px] text-emerald-500 animate-pulse">● UPDATING</div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-[10px] text-gray-500 border-b border-gray-800">
                            <th className="pb-1 font-medium">RK</th>
                            <th className="pb-1 font-medium">STATE/CITY</th>
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
                                <td className="py-2">
                                    <div className="font-bold text-gray-200">{loc.state}</div>
                                    <div className="text-[10px] text-gray-500">{loc.city}</div>
                                </td>
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
