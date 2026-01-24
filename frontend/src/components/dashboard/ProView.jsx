import React, { useState, useEffect, useRef } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell } from 'recharts';
import { Map, Wind, CloudSun, Shield, Fingerprint, Layers, Share2, Search, ArrowRight, Home, Sun, AlertTriangle, BookOpen, Clock, Activity, Move, Save } from 'lucide-react';
import { useApiTelemetry } from '../../hooks/useApiTelemetry';
import { Card, Badge, Skeleton, StatRow, THEME } from './shared/Common';
import API_BASE_URL from '../../config';

// --- NEW FEATURES ---

const CauseExplorer = ({ weather, aqi }) => {
    // Rule-based analysis
    const drivers = [];
    if (weather?.wind_speed < 5) drivers.push({ name: 'Stagnation', prob: 90, desc: 'Low wind trapping pollutants.' });
    if (weather?.humidity > 70) drivers.push({ name: 'Hygroscopic Growth', prob: 80, desc: 'High humidity increasing PM size.' });
    if (aqi?.no2 > 20) drivers.push({ name: 'Traffic Emissions', prob: 85, desc: 'High NO2 levels detected.' });
    if (drivers.length === 0) drivers.push({ name: 'Background Levels', prob: 10, desc: 'No specific local driver found.' });

    const topDriver = drivers.sort((a, b) => b.prob - a.prob)[0];

    return (
        <Card className="flex flex-col gap-3 h-full">
            <div className="flex items-center gap-2 mb-1">
                <Activity size={14} className="text-pink-400" />
                <h3 className="text-xs font-bold text-gray-400 uppercase">Pollution Cause Explorer</h3>
            </div>

            <div className="flex-1 bg-gradient-to-br from-pink-900/20 to-purple-900/20 rounded p-3 border border-pink-500/20 flex flex-col justify-center">
                <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Main Driver</div>
                <div className="text-lg font-bold text-white leading-none mb-1">{topDriver.name}</div>
                <div className="text-xs text-gray-400">{topDriver.desc}</div>
            </div>

            <div className="space-y-1">
                {drivers.slice(1, 3).map((d, i) => (
                    <div key={i} className="flex justify-between text-[10px] text-gray-500 border-b border-gray-800 pb-1 last:border-0">
                        <span>{d.name}</span>
                        <span>{d.prob}% Contrib</span>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const ExposureTimer = ({ pm25 }) => {
    const [activity, setActivity] = useState('walking'); // walking, running, cycling
    const [duration, setDuration] = useState(10);

    // Simple Dose Calculation: Dose = PM2.5 * VentilationRate * Time
    // VR (L/min): Walk=15, Run=45, Cycle=30
    const vrMap = { walking: 15, running: 45, cycling: 30 };
    const vr = vrMap[activity];

    // Total inhaled mass in micrograms (rough approx)
    const inhaled = (pm25 * (vr / 1000) * duration).toFixed(1);

    let risk = 'LOW';
    let color = 'text-emerald-400';

    if (inhaled > 5) { risk = 'MED'; color = 'text-amber-400'; }
    if (inhaled > 15) { risk = 'HIGH'; color = 'text-red-400'; }

    return (
        <Card className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-3">
                <Clock size={14} className="text-cyan-400" />
                <h3 className="text-xs font-bold text-gray-400 uppercase">Personal Exposure Timer</h3>
            </div>

            <div className="flex gap-2 mb-4">
                <select
                    value={activity}
                    onChange={e => setActivity(e.target.value)}
                    className="bg-gray-800 text-xs text-white rounded p-1 border border-gray-700 focus:outline-none"
                >
                    <option value="walking">Walking</option>
                    <option value="running">Running</option>
                    <option value="cycling">Cycling</option>
                </select>

                <select
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="bg-gray-800 text-xs text-white rounded p-1 border border-gray-700 focus:outline-none"
                >
                    <option value={10}>10 min</option>
                    <option value={30}>30 min</option>
                    <option value={60}>1 hr</option>
                </select>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center bg-gray-900/50 rounded p-2 border border-gray-700">
                <span className="text-[10px] text-gray-500">ESTIMATED INTAKE</span>
                <div className="text-2xl font-bold text-white">{inhaled} <span className="text-xs font-normal text-gray-500">µg</span></div>
                <div className={`text-xs font-bold ${color} mt-1 border px-2 rounded-full border-current opacity-80`}>
                    {risk} RISK
                </div>
            </div>
        </Card>
    );
};

const DiaryPanel = ({ fetchTrigger }) => {
    const [entries, setEntries] = useState([]);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchEntries = async () => {
        try {
            // Mock auth token handling - In real app, attach token
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/pro/diary`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setEntries(await res.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchEntries(); }, [fetchTrigger]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!note) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE_URL}/api/pro/diary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ note, location: 'Dashboard' })
            });
            setNote('');
            fetchEntries();
        } catch (e) { alert("Failed to save note"); }
        setLoading(false);
    };

    return (
        <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                    <BookOpen size={14} className="text-indigo-400" />
                    Air Quality Diary
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <input
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    placeholder="Note (e.g., Smell of smoke...)"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                />
                <button type="submit" disabled={loading} className="bg-indigo-600 px-3 py-1 rounded text-xs text-white font-bold hover:bg-indigo-500">
                    {loading ? '...' : 'ADD'}
                </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-700 max-h-[140px]">
                {entries.length === 0 ? <p className="text-[10px] text-gray-600 text-center italic mt-4">No entries yet.</p> :
                    entries.map(e => (
                        <div key={e.id} className="bg-[#1e2329] p-2 rounded border-l-2 border-indigo-500">
                            <div className="text-xs text-gray-300">{e.note}</div>
                            <div className="text-[10px] text-gray-600 mt-1">{new Date(e.timestamp).toLocaleString()}</div>
                        </div>
                    ))}
            </div>
        </Card>
    );
};

const IndoorOutdoorPanel = ({ local, outdoor, recommendation }) => {
    // Assuming 'local' is the fusion local value (Indoor)
    // 'outdoor' is the API value

    // Normalize to prevent NaNs
    const valIn = typeof local === 'number' ? local : 0;
    const valOut = typeof outdoor === 'number' ? outdoor : 0;

    return (
        <Card className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <h3 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                    <Home size={14} className="text-cyan-400" />
                    Indoor vs Outdoor (PM2.5)
                </h3>
            </div>

            <div className="flex items-center justify-between gap-4">
                {/* INDOOR */}
                <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">INDOOR</div>
                    <div className={`text-2xl font-bold ${valIn > 35 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {valIn.toFixed(1)}
                    </div>
                    <div className="text-[10px] text-gray-600">µg/m³</div>
                </div>

                {/* COMP */}
                <div className="flex flex-col items-center">
                    <div className="h-[2px] w-12 bg-gray-700 relative">
                        {/* Dot indicator based on difference */}
                        <div className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${valIn < valOut ? 'bg-emerald-500 left-0' : 'bg-red-500 right-0'}`} />
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1">vs</span>
                </div>

                {/* OUTDOOR */}
                <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">OUTDOOR</div>
                    <div className={`text-2xl font-bold ${valOut > 35 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {valOut.toFixed(1)}
                    </div>
                    <div className="text-[10px] text-gray-600">API</div>
                </div>
            </div>

            {/* ACTION */}
            <div className={`p-3 rounded border-l-2 flex items-center justify-between
                ${recommendation.action === "Open Windows" ? "bg-emerald-900/20 border-emerald-500" :
                    recommendation.action === "Keep Closed" ? "bg-red-900/10 border-red-500" : "bg-gray-800 border-gray-600"}`}>

                <div>
                    <div className={`text-xs font-bold ${recommendation.action === "Open Windows" ? "text-emerald-400" :
                        recommendation.action === "Keep Closed" ? "text-red-400" : "text-gray-300"}`}>
                        {recommendation.action}
                    </div>
                    <div className="text-[10px] text-gray-500 leading-tight mt-0.5">{recommendation.reason}</div>
                </div>

                {recommendation.action === "Open Windows" ? <Wind size={16} className="text-emerald-400" /> :
                    recommendation.action === "Keep Closed" ? <Shield size={16} className="text-red-400" /> : null}
            </div>
        </Card>
    );
};

const ForecastPanel = ({ forecast, bestWindows }) => {
    // forecast: [{time, temp, pm25, aqi}, ...]

    // Find absolute "Best" time string for headline
    const bestOne = bestWindows && bestWindows.length > 0 ? bestWindows[0].time : 'N/A';

    return (
        <Card className="col-span-1 lg:col-span-2 relative p-4 flex flex-col h-[300px]">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                        <Sun size={14} className="text-amber-400" />
                        24H HEALTH FORECAST
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-1">
                        Best time to go outside: <span className="text-emerald-400 font-bold">{bestOne}</span>
                    </p>
                </div>
            </div>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={forecast} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.5} />
                        <XAxis dataKey="time" tick={{ fill: '#6B7280', fontSize: 10 }} interval={2} />
                        <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                            itemStyle={{ fontSize: '11px', color: '#E5E7EB' }}
                            labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
                        />
                        <Bar dataKey="aqi" radius={[2, 2, 0, 0]} maxBarSize={40}>
                            {forecast.map((entry, index) => {
                                // Highlight if this entry is in "Best Windows"
                                const isBest = bestWindows?.some(b => b.time === entry.time);
                                return <Cell key={`cell-${index}`} fill={isBest ? '#10b981' : entry.aqi > 100 ? '#ef4444' : '#6366f1'} opacity={isBest ? 1 : 0.6} />;
                            })}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

const TimelinePanel = ({ events }) => (
    <Card className="h-full flex flex-col">
        <h3 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2 mb-4">
            <ArrowRight size={14} className="text-indigo-400" />
            Event Timeline
        </h3>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-700">
            {/* Mocking Events if empty */}
            {(!events || events.length === 0) ? (
                <>
                    <div className="flex gap-3 relative pl-2 pb-4 border-l border-gray-700">
                        <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-[#0f172a]" />
                        <div>
                            <div className="text-[10px] text-gray-500">10:42 AM</div>
                            <div className="text-xs text-white font-medium">Optimal Window Started</div>
                        </div>
                    </div>

                    <div className="flex gap-3 relative pl-2 pb-4 border-l border-gray-700">
                        <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-[#0f172a]" />
                        <div>
                            <div className="text-[10px] text-gray-500">09:15 AM</div>
                            <div className="text-xs text-white font-medium">Moderate Dust Spike</div>
                            <div className="text-[10px] text-gray-400 mt-1">Source: Construction</div>
                        </div>
                    </div>
                </>
            ) : (
                events.map((e, i) => <div key={i}>{e.title}</div>)
            )}
        </div>
    </Card>
);
const FingerprintChart = ({ data }) => (
    <div className="w-full h-40">
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="source" tick={{ fill: '#848E9C', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Source" dataKey="probability" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.3} />
            </RadarChart>
        </ResponsiveContainer>
    </div>
);

const FusionChart = ({ history }) => {
    if (!history || history.length < 2) return (
        <div className="flex items-center justify-center h-full text-xs text-gray-500 font-mono animate-pulse">
            GATHERING SENSOR FUSION DATA...
        </div>
    );

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                    <XAxis dataKey="time" tick={{ fill: '#9CA3AF', fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis domain={['auto', 'auto']} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ fontSize: '12px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                    {/* Raw Sensor (Noisy) */}
                    <Line type="monotone" dataKey="local" stroke="#ef4444" strokeWidth={1} dot={false} name="Raw Sensor (Noisy)" strokeOpacity={0.7} />

                    {/* External API (Bias) */}
                    <Line type="step" dataKey="external" stroke="#3b82f6" strokeWidth={1} dot={false} name="Cloud API (Regional)" strokeDasharray="4 4" />

                    {/* Kalman Fused (Result) */}
                    <Line type="monotone" dataKey="fused" stroke="#10b981" strokeWidth={3} dot={{ r: 2 }} name="Kalman Estimate" activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const BioSignatureWidget = ({ weather, aqi }) => {
    // Dynamic Bio-Signature based on REAL Telemetry
    // We normalize values to a 0-150 scale (Baseline 100)

    const temp = weather?.temp || 25;
    const humidity = weather?.humidity || 50;
    const pm25 = aqi?.pm25 || 10;
    const wind = weather?.wind_speed || 10;
    const uv = weather?.uv_index || 0;

    // Algorithms for "Bio-Health"
    const scoreFlora = Math.max(0, 150 - (Math.abs(temp - 24) * 5) - (Math.abs(humidity - 60) * 2));
    const scoreFauna = Math.max(0, 150 - (pm25 * 2) - (Math.abs(temp - 22) * 4));
    const scoreSoil = Math.max(0, 150 - (Math.abs(humidity - 40) * 3)); // Soil likes moderate dry/wet cycle, simplified
    const scoreWater = Math.max(0, 150 - (temp > 30 ? (temp - 30) * 10 : 0)); // Heat affects water retention
    const scoreAir = Math.max(0, 150 - (pm25 * 3));
    const scoreUV = Math.max(0, 150 - (uv * 10));

    const data = [
        { subject: 'Flora', A: scoreFlora, B: 100, fullMark: 150 },
        { subject: 'Fauna', A: scoreFauna, B: 100, fullMark: 150 },
        { subject: 'Soil', A: scoreSoil, B: 100, fullMark: 150 },
        { subject: 'Water', A: scoreWater, B: 100, fullMark: 150 },
        { subject: 'Air', A: scoreAir, B: 100, fullMark: 150 },
        { subject: 'Solar', A: scoreUV, B: 100, fullMark: 150 },
    ];

    return (
        <div className="relative h-full flex flex-col">
            <div className="flex items-center gap-2 mb-2">
                <Activity size={14} className="text-pink-500" />
                <h3 className="text-xs font-bold text-gray-400 uppercase">Biosphere DNA</h3>
            </div>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                        <Radar name="Current Health" dataKey="A" stroke="#ec4899" strokeWidth={2} fill="#ec4899" fillOpacity={0.3} />
                        <Radar name="Baseline" dataKey="B" stroke="#6366f1" strokeWidth={1} fill="transparent" strokeDasharray="3 3" />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const TopLocations = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopLocations = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/pro/top-locations`);
                if (res.ok) {
                    const data = await res.json();
                    setLocations(data.locations || []);
                }
            } catch (e) { console.error(e); }
            setLoading(false);
        };
        fetchTopLocations();
    }, []);

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Map size={14} className="text-orange-400" />
                    <h3 className="text-xs font-bold text-gray-400 uppercase">Global Heat Index (Top 10)</h3>
                </div>
                <div className="text-[10px] text-gray-500">Live Satellite Data</div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-[10px] text-gray-500 border-b border-gray-800">
                            <th className="pb-1 font-medium">RANK</th>
                            <th className="pb-1 font-medium">LOCATION</th>
                            <th className="pb-1 font-medium text-right">TEMP</th>
                            <th className="pb-1 font-medium text-right">COND</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan="4" className="py-2"><div className="h-4 bg-gray-800 rounded"></div></td>
                                </tr>
                            ))
                        ) : locations.map((loc) => (
                            <tr key={loc.rank} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                <td className="py-2 font-mono text-gray-500">#{loc.rank}</td>
                                <td className="py-2 font-bold text-gray-200">{loc.city}</td>
                                <td className="py-2 text-right font-mono text-orange-400">{loc.temp}°C</td>
                                <td className="py-2 text-right text-gray-400 text-[10px] uppercase">{loc.condition}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ... existing code ...

const ProView = () => {
    // Search State
    const [searchQuery, setSearchQuery] = useState({ city: 'Hyderabad' });
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    // Fusion History State
    const [fusionHistory, setFusionHistory] = useState([]);

    // Data Hook
    // Data Hook (Updated to include NEW outputs)
    const { weather, aqi, forecast, bestWindows, recommendation, anomalies, fingerprint, loading, error, fusion } = useApiTelemetry(searchQuery);
    const [range, setRange] = useState('1H');

    // Widget Order State (Simple Builder)
    const [widgetOrder, setWidgetOrder] = useState(['fusion', 'decision', 'forecast', 'timeline', 'cause', 'exposure', 'diary']);

    // Function to reorder (Simple move to top)
    const moveWidgetUp = (id) => {
        const idx = widgetOrder.indexOf(id);
        if (idx > 0) {
            const newOrder = [...widgetOrder];
            [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
            setWidgetOrder(newOrder);
        }
    };

    // Accumulate Fusion Data
    useEffect(() => {
        if (fusion && fusion.temperature) {
            setFusionHistory(prev => {
                const now = new Date();
                const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

                const point = {
                    time: timeStr,
                    local: fusion.temperature.local || 0,
                    external: fusion.temperature.external || 0,
                    fused: fusion.temperature.fused || 0
                };

                // Keep last 20 points
                const newHist = [...prev, point];
                if (newHist.length > 20) newHist.shift();
                return newHist;
            });
        }
    }, [fusion]);

    // Click Outside to Close
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Handle Input Change & Fetch Suggestions
    const handleInputChange = async (e) => {
        const val = e.target.value;
        setInputValue(val);

        if (val.length > 2) {
            try {
                const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${val}&count=5&language=en&format=json`);
                const data = await res.json();
                if (data.results) {
                    setSuggestions(data.results);
                    setShowSuggestions(true);
                }
            } catch (err) {
                console.error("Autocomplete Error", err);
            }
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // Handle Selection
    const handleSelectCity = (cityObj) => {
        setInputValue(cityObj.name); // Set input to name
        setSearchQuery({ city: cityObj.name }); // Trigger Data Fetch
        setSuggestions([]);
        setShowSuggestions(false);
        setFusionHistory([]); // Clear graph on new city
    };

    // Keep "Enter" key working as fallback
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            setShowSuggestions(false);
            if (inputValue.length > 2) {
                setSearchQuery({ city: inputValue });
                setFusionHistory([]);
            }
        }
    };

    if (loading && !weather) return (
        <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
            </div>
            <Skeleton className="h-[400px]" />
        </div>
    );

    if (error) return (
        <Card className="flex flex-col items-center justify-center h-96">
            <Shield size={48} className="text-red-500 mb-4" />
            <h3 className="text-xl text-white font-bold">Data Unavailable</h3>
            <p className="text-gray-500">{error}</p>
        </Card>
    );

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className={`text-xl font-bold ${THEME.colors.text}`}>Command Center</h2>

                    {/* Search Bar with Autocomplete */}
                    <div className="flex items-center gap-2 mt-1 relative" ref={wrapperRef}>
                        <span className={`text-xs ${THEME.colors.subText} font-mono uppercase hidden sm:block`}>
                            {searchQuery.city || 'GLOBAL'} ZONE • PUBLIC API
                        </span>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                <Search size={12} className="text-gray-500" />
                            </div>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onFocus={() => inputValue.length > 2 && setShowSuggestions(true)}
                                placeholder="Search City..."
                                className="pl-7 bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors w-48"
                            />

                            {/* Dropdown Results */}
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="absolute left-0 top-full mt-1 w-full bg-[#1e2329] border border-gray-700 rounded-md shadow-xl z-50 max-h-48 overflow-y-auto">
                                    {suggestions.map((s) => (
                                        <li
                                            key={s.id}
                                            onClick={() => handleSelectCity(s)}
                                            className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-xs text-gray-200 border-b border-gray-800 last:border-0 flex flex-col"
                                        >
                                            <span className="font-bold">{s.name}</span>
                                            <span className="text-[10px] text-gray-500">{s.admin1}, {s.country}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    {['1H', '24H', '7D'].map(r => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-3 py-1 rounded text-xs font-bold border ${range === r ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-gray-700 text-gray-400 hover:text-white'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Life Support Monitor (Temp & Humidity Focus) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Temperature Monitor */}
                <Card className={`relative overflow-hidden flex flex-col justify-center items-center py-8 border-2 ${weather?.temp > 35 ? 'border-red-500 bg-red-900/10' : 'border-gray-700'}`}>
                    {weather?.temp > 35 && <div className="absolute top-0 inset-x-0 bg-red-500 text-black text-[10px] font-bold text-center tracking-[0.3em] uppercase py-1 animate-pulse">Critical Thermal Levels</div>}
                    <div className="flex items-center gap-3 mb-2">
                        <Sun size={24} className={weather?.temp > 35 ? 'text-red-500 animate-spin-slow' : 'text-amber-400'} />
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Ambient Temp</h3>
                    </div>
                    <div className="text-6xl md:text-7xl font-black text-white tracking-tighter relative">
                        {weather?.temp}
                        <span className="text-2xl text-gray-500 absolute top-2 -right-6">°C</span>
                    </div>
                    <div className="mt-4 text-xs font-mono text-gray-500 bg-gray-900/50 px-3 py-1 rounded-full border border-white/5">
                        THRESHOLD: 35°C
                    </div>
                </Card>

                {/* Humidity Monitor */}
                <Card className={`relative overflow-hidden flex flex-col justify-center items-center py-8 border-2 ${weather?.humidity > 70 ? 'border-blue-500 bg-blue-900/10' : 'border-gray-700'}`}>
                    {weather?.humidity > 70 && <div className="absolute top-0 inset-x-0 bg-blue-500 text-black text-[10px] font-bold text-center tracking-[0.3em] uppercase py-1 animate-pulse">High Moisture Alert</div>}
                    <div className="flex items-center gap-3 mb-2">
                        <Activity size={24} className={weather?.humidity > 70 ? 'text-blue-500' : 'text-cyan-400'} />
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Humidity</h3>
                    </div>
                    <div className="text-6xl md:text-7xl font-black text-white tracking-tighter relative">
                        {weather?.humidity}
                        <span className="text-2xl text-gray-500 absolute top-2 -right-8">%</span>
                    </div>
                    <div className="mt-4 text-xs font-mono text-gray-500 bg-gray-900/50 px-3 py-1 rounded-full border border-white/5">
                        THRESHOLD: 70%
                    </div>
                </Card>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 opacity-80">
                <Card>
                    <StatRow label="Wind Speed" value={weather?.wind_speed} unit="km/h" trend={-1.2} />
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <Wind size={12} /> {weather?.wind_speed > 15 ? 'Gusty' : 'Calm'}
                    </div>
                </Card>
                <Card>
                    <StatRow label="AQI (PM2.5)" value={aqi?.pm25} unit="µg/m³" trend={5.2} />
                    <div className="mt-2 text-xs"><Badge type="warning">MODERATE</Badge></div>
                </Card>
                <Card>
                    <StatRow label="UV Index" value={weather?.uv_index} unit="" />
                    <div className="w-full bg-gray-800 h-1.5 rounded-full mt-3">
                        <div className="bg-orange-500 h-full rounded-full" style={{ width: `${(weather?.uv_index / 10) * 100}%` }} />
                    </div>
                </Card>
                <Card>
                    <StatRow label="Pressure" value={1013} unit="hPa" />
                    <div className="mt-2 text-[10px] text-gray-500">Stable Condition</div>
                </Card>
            </div>

            {/* Main Widget Grid - Dynamic Ordering Handling (Simulated Grid) */}

            {/* Row 1: The Heavy Hitters */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Fusion Chart (Spans 2 cols) */}
                <Card className="lg:col-span-2 relative p-4 flex flex-col h-[320px]">
                    {/* ... Fusion Chart Content ... */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                                <Shield size={14} className="text-emerald-400" />
                                KALMAN FILTER REAL-TIME ANALYSIS
                            </h3>
                            <p className="text-[10px] text-gray-500 mt-1">
                                Fusing Local Sensors ({fusion?.temperature?.local || 'N/A'}) + Public API ({fusion?.temperature?.external || 'N/A'})
                            </p>
                        </div>
                        <Badge type="success">AI ACTIVE</Badge>
                    </div>
                    <div className="flex-1 min-h-0">
                        <FusionChart history={fusionHistory} />
                    </div>
                    {/* Widget Control - Mock */}
                    <button onClick={() => moveWidgetUp('fusion')} className="absolute top-2 right-2 opacity-0 hover:opacity-100 text-gray-500 hover:text-white p-1" title="Move Top"><Move size={12} /></button>
                </Card>

                {/* Decision Panel (1 Col) */}
                <div className="space-y-4">
                    <IndoorOutdoorPanel
                        local={fusion?.pm25?.local}
                        outdoor={aqi?.pm25}
                        recommendation={recommendation}
                    />
                    {/* Exposure Timer (Replacing compact Source for more utility in premium view) */}
                    <div className="h-[160px]">
                        <ExposureTimer pm25={aqi?.pm25 || 0} />
                    </div>
                </div>
            </div>

            {/* Row 2: Analysis & Diary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ForecastPanel forecast={forecast} bestWindows={bestWindows} />
                </div>

                <div className="space-y-4">
                    <div className="h-[180px]">
                        <CauseExplorer weather={weather} aqi={aqi} />
                    </div>
                    <div className="h-[200px]">
                        <DiaryPanel />
                    </div>
                </div>
            </div>

            {/* NEW: Biosphere DNA Row & Top Locations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[250px]">
                <Card className="lg:col-span-1">
                    <BioSignatureWidget weather={weather} aqi={aqi} />
                </Card>
                <Card className="lg:col-span-2 overflow-hidden flex flex-col">
                    <TopLocations />
                </Card>
            </div>

            {/* Row 3: Advanced Source Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[300px]">
                <Card className="flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <Fingerprint size={14} className="text-indigo-400" />
                        <span className="text-[10px] font-bold uppercase text-gray-400">Full Pollution Signature</span>
                    </div>
                    <FingerprintChart data={fingerprint} />
                </Card>

                <Card className="flex flex-col relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle size={14} className="text-red-400" />
                        <span className="text-[10px] font-bold uppercase text-gray-400">Active Anomalies</span>
                    </div>
                    <div className="space-y-2">
                        {anomalies.map((a, i) => (
                            <div key={i} className="text-xs bg-red-500/10 p-2 rounded text-red-300 border border-red-500/20 flex justify-between">
                                <span className="font-bold">{a.type}</span>
                                <span>{(a.confidence * 100).toFixed(0)}% Conf.</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ProView;
