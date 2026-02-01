import React, { useEffect, useState } from 'react';
import { fetchMarketIndices } from '../../services/marketData';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MarketIndex {
    symbol: string;
    value: number;
    change: number;
    percentChange: number;
}

export const MarketTicker: React.FC = () => {
    const [indices, setIndices] = useState<MarketIndex[]>([]);

    useEffect(() => {
        const load = async () => {
            const data = await fetchMarketIndices();
            setIndices(data);
        };
        load();
        // Refresh every 5 seconds to show "Live" jumping effect
        const interval = setInterval(load, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-zinc-900 border-b border-zinc-800 overflow-hidden py-2 mb-4 dark:bg-black dark:border-white/10">
            {/* Ticker Container - CSS Marquee Animation */}
            {/* Ideally we use a library or custom CSS for smooth scrolling. For now, a simple flex overflow or simulated slide. */}
            <div className="flex animate-marquee whitespace-nowrap gap-8 items-center px-4">
                {/* Duplicate logic for infinite scroll illusion if needed, but simple flex for now */}
                {[...indices, ...indices].map((index, idx) => ( // Duplicate for seamless look
                    <div key={`${index.symbol}-${idx}`} className="flex items-center gap-2 text-xs font-mono">
                        <span className="font-bold text-zinc-400">{index.symbol}</span>
                        <span className="text-white font-bold">{index.value.toLocaleString()}</span>
                        <span className={`flex items-center gap-0.5 ${index.change > 0 ? 'text-emerald-500' :
                            index.change < 0 ? 'text-rose-500' : 'text-zinc-500'
                            }`}>
                            {index.change > 0 ? <TrendingUp size={10} /> : index.change < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
                            {index.percentChange > 0 ? '+' : ''}{index.percentChange}%
                        </span>
                        {/* Separator */}
                        <span className="text-zinc-700 mx-2">|</span>
                    </div>
                ))}
            </div>

            {/* Inline CSS for marquee since Tailwind config might not have it */}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};
