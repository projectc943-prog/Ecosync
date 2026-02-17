import React from 'react';
import { Newspaper, Globe, AlertTriangle, Wind, Thermometer, Droplets, TrendingUp, ExternalLink, Leaf, Sprout, Zap, CloudRain } from 'lucide-react';

const NEWS_DATA = [
    {
        id: 1,
        title: "Rule Update: Mixing Room",
        summary: "New safety rule: Keep humidity under control in mixing areas. Check your sensors daily.",
        source: "Safety Board",
        timestamp: "Today",
        category: "IMPORTANT",
        icon: AlertTriangle,
        color: "red"
    },
    {
        id: 2,
        title: "Material Price Rising",
        summary: "Aluminum Powder & Chemical prices may go up by 15% next week. Plan your stock.",
        source: "Market News",
        timestamp: "Yesterday",
        category: "MONEY",
        icon: TrendingUp,
        color: "yellow"
    },
    {
        id: 3,
        title: "High Fire Risk Warning",
        summary: "Air is very dry today. Static sparks can cause fires. Wet the ground near drying yards.",
        source: "Fire Dept",
        timestamp: "4h ago",
        category: "DANGER",
        icon: Zap,
        color: "orange"
    },
    {
        id: 4,
        title: "Green Cracker Guide",
        summary: "New simple formula approved for small factories. Less smoke, same sound. Ask association for details.",
        source: "Association",
        timestamp: "2d ago",
        category: "INFO",
        icon: Leaf,
        color: "emerald"
    },
    {
        id: 5,
        title: "Rain Alert: Protect Stock",
        summary: "Heavy rain expected tomorrow. Move all drying crackers indoors before evening.",
        source: "Weather App",
        timestamp: "1d ago",
        category: "WEATHER",
        icon: CloudRain,
        color: "blue"
    }
];

const NewsComponent = () => {
    return (
        <div className="h-full w-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-emerald-900/20 scrollbar-track-transparent">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Newspaper className="text-emerald-400" /> Global Eco-Intel Feed
                </h3>
                <span className="text-xs text-emerald-500/60 font-mono animate-pulse">BIO-LINK ACTIVE</span>
            </div>

            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Featured Headline */}
                <div className="col-span-1 md:col-span-2 lg:col-span-3 glass-panel p-6 border-l-4 border-l-red-500 bg-red-500/5 relative overflow-hidden group cursor-pointer hover:bg-red-500/10 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <AlertTriangle size={120} />
                    </div>
                    {/* Note: The provided code snippet for fetch is not valid JSX.
                        If you intend to fetch data, it should be done within a React hook like useEffect.
                        For now, the line is commented out to maintain syntactical correctness.
                        const response = await fetch(
                            `https://gnews.io/api/v4/search?q=environment%20india&lang=en&country=in&max=9&apikey=${API_KEY}`
                        );
                    */}
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                            <span className="bg-red-500/20 text-red-300 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-red-500/20">Critical Alert</span>
                            <span className="text-xs text-slate-400 font-mono">{NEWS_DATA[0].timestamp}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">{NEWS_DATA[0].title}</h2>
                        <p className="text-slate-300 mb-4 max-w-3xl">{NEWS_DATA[0].summary}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                            <Globe size={12} /> SOURCE: {NEWS_DATA[0].source}
                        </div>
                    </div>
                </div>

                {/* Regular News Items */}
                {NEWS_DATA.slice(1).map((news) => {
                    const ColorIcon = news.icon;
                    return (
                        <div key={news.id} className={`glass-panel p-5 border-t-2 border-t-${news.color}-500/30 hover:bg-slate-800/50 transition-all cursor-pointer group flex flex-col`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className={`p-2 rounded-lg bg-${news.color}-500/10 border border-${news.color}-500/20`}>
                                    <ColorIcon className={`text-${news.color}-400`} size={20} />
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono bg-black/30 px-2 py-1 rounded">{news.timestamp}</span>
                            </div>

                            <h4 className="font-bold text-slate-100 mb-2 group-hover:text-emerald-300 transition-colors line-clamp-2">{news.title}</h4>
                            <p className="text-sm text-slate-400 mb-4 flex-1 line-clamp-3">{news.summary}</p>

                            <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-xs text-slate-500">
                                <span>{news.source.toUpperCase()}</span>
                                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default NewsComponent;
