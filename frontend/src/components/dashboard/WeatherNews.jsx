import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Globe, MapPin } from 'lucide-react';

const MOCK_NEWS = {
    Global: [
        {
            id: 1,
            title: "Global Heatwave: Temperatures Soar Across Continents",
            source: "EcoWatch",
            summary: "Record-breaking temperatures are being recorded in Europe and Asia.",
            time: "2h ago"
        },
        {
            id: 2,
            title: "Amazon Rainforest Carbon Sink Capacity Decreasing",
            source: "NatureScience",
            summary: "New study reveals concerning trends in the Amazon's ability to absorb CO2.",
            time: "12h ago"
        }
    ],
    National: [
        {
            id: 3,
            title: "Local Alert: Heavy Rainfall Expected in Coastal Districts",
            source: "NationalMet",
            summary: "Fishermen advised not to venture into the sea due to approaching cyclone.",
            time: "1h ago"
        },
        {
            id: 4,
            title: "Government Launches New 'Green Roof' Initiative",
            source: "GovNews",
            summary: "Subsidies announced for solar panel installations in residential areas.",
            time: "5h ago"
        }
    ]
};

const WeatherNews = () => {
    const [activeTab, setActiveTab] = useState('Global'); // Global | National
    const [news, setNews] = useState([]);

    useEffect(() => {
        // Simulate Fetch
        setNews(MOCK_NEWS[activeTab]);
    }, [activeTab]);

    return (
        <div className="bg-emerald-900/40 backdrop-blur-md rounded-2xl border border-emerald-500/30 p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Newspaper className="text-emerald-400" size={20} />
                    <h2 className="text-lg font-bold text-white">Eco-News</h2>
                </div>

                {/* Tabs */}
                <div className="flex bg-black/20 rounded p-1">
                    <button
                        onClick={() => setActiveTab('Global')}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-colors ${activeTab === 'Global' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Globe size={10} /> GLOBAL
                    </button>
                    <button
                        onClick={() => setActiveTab('National')}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-colors ${activeTab === 'National' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <MapPin size={10} /> NATIONAL
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                {news.map((item) => (
                    <div key={item.id} className="group p-3 bg-black/20 hover:bg-emerald-500/10 rounded-lg border border-emerald-500/10 hover:border-emerald-500/40 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-mono text-emerald-400">{item.source}</span>
                            <span className="text-[10px] text-emerald-600">{item.time}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-emerald-300 transition-colors leading-tight">{item.title}</h3>
                        <p className="text-[10px] text-gray-400 line-clamp-2">{item.summary}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeatherNews;
