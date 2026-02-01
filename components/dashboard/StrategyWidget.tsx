import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Radar, TrendingUp, Anchor, Flame, AlertTriangle, Fish } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/dataService';
import { AssetType, StockData } from '../../types';

// Define Type locally or import
interface MarketSignal {
    symbol: string;
    price: number;
    change: number;
    rsi: number;
    volume_state: string; // Snake case from DB
    note: string;
}

export const StrategyWidget: React.FC = () => {
    const [marketSignals, setMarketSignals] = useState<MarketSignal[]>([]);

    // Fetch Signals
    React.useEffect(() => {
        const fetchSignals = async () => {
            try {
                // In Dev: http://localhost:8788/api/signals
                // In Prod: /api/signals
                const res = await fetch('/api/signals');
                if (res.ok) {
                    const data = await res.json();
                    setMarketSignals(data);
                }
            } catch (e) {
                console.error("Failed to fetch signals", e);
            }
        };
        fetchSignals();
    }, []);

    return (
        <GlassCard
            title={<span className="uppercase tracking-wider font-bold text-zinc-900 dark:text-white flex items-center gap-2"><Fish className="text-primary" size={18} /> Shark Tracker</span>}
            className="h-full min-h-[24rem]"
        >
            <div className="flex flex-col h-full animate-fade-in pt-2">
                <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1">
                    {marketSignals.map((signal) => {
                        // UI Logic for Signals
                        let StatusIcon = Anchor;
                        let statusColor = 'text-zinc-500';
                        let statusBg = 'bg-zinc-100 dark:bg-zinc-800';
                        let rsiColor = 'bg-zinc-500';

                        // Map snake_case from DB to logic (or use snake_case directly if preferred, but let's keep logic consistent)
                        const volState = signal.volume_state;

                        if (volState === 'PUMPING') {
                            StatusIcon = Flame;
                            statusColor = 'text-emerald-500';
                            statusBg = 'bg-emerald-500/10 border-emerald-500/20';
                        } else if (volState === 'DISTRIBUTING') {
                            StatusIcon = AlertTriangle;
                            statusColor = 'text-rose-500';
                            statusBg = 'bg-rose-500/10 border-rose-500/20';
                        } else if (volState === 'ACCUMULATING') {
                            StatusIcon = Anchor;
                            statusColor = 'text-blue-500';
                            statusBg = 'bg-blue-500/10 border-blue-500/20';
                        }

                        // RSI Color Logic
                        if (signal.rsi > 70) rsiColor = 'bg-gradient-to-r from-rose-400 to-rose-600';
                        else if (signal.rsi < 30) rsiColor = 'bg-gradient-to-r from-emerald-400 to-emerald-600';
                        else rsiColor = 'bg-zinc-300 dark:bg-zinc-600';

                        return (
                            <div key={signal.symbol} className={`p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group relative overflow-hidden`}>

                                {/* Top Row: Symbol & Price */}
                                <div className="flex justify-between items-start mb-2 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-black text-zinc-900 dark:text-white">{signal.symbol}</span>
                                            <div className={`p-1 rounded-md border ${statusBg} ${statusColor}`}>
                                                <StatusIcon size={14} />
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-zinc-500 font-bold uppercase mt-0.5">{signal.note}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-zinc-900 dark:text-white">{formatCurrency(signal.price)}</div>
                                        <div className={`text-xs font-bold ${signal.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {signal.change > 0 ? '+' : ''}{signal.change}%
                                        </div>
                                    </div>
                                </div>

                                {/* RSI Bar */}
                                <div className="space-y-1 relative z-10">
                                    <div className="flex justify-between text-[9px] font-bold text-zinc-400 uppercase">
                                        <span>Oversold (30)</span>
                                        <span className={signal.rsi > 70 ? 'text-rose-500' : (signal.rsi < 30 ? 'text-emerald-500' : 'text-zinc-500')}>RSI: {signal.rsi}</span>
                                        <span>Overbought (70)</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-1000 ${rsiColor}`} style={{ width: `${signal.rsi}%` }}></div>
                                    </div>
                                </div>

                                {/* Faint Background Decor */}
                                <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                                    <StatusIcon size={80} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </GlassCard>
    );
};
