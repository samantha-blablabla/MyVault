import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Radar, ArrowRightLeft, TrendingUp, Anchor, Flame, AlertTriangle, Fish, Calculator, ArrowRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/dataService';
import { AssetType, StockData } from '../../types';

// REMOVE MOCK DATA
// const MARKET_SIGNALS = [...];

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
    const { portfolio } = useFinance();
    const [activeTab, setActiveTab] = useState<'radar' | 'rebalance'>('radar');
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

    // Rebalance State
    const [sellSymbol, setSellSymbol] = useState('');
    const [sellPercent, setSellPercent] = useState(30);
    const [buySymbol, setBuySymbol] = useState('');

    // --- LOGIC: REBALANCE CALCULATOR ---
    const sellAsset = portfolio.find(p => p.symbol === sellSymbol);
    const buyAssetPrice = marketSignals.find(s => s.symbol === buySymbol)?.price ||
        portfolio.find(p => p.symbol === buySymbol)?.currentPrice || 0;


    const estimatedCashBack = sellAsset ? (sellAsset.quantity * sellAsset.currentPrice * (sellPercent / 100)) : 0;
    const estimatedNewShares = (estimatedCashBack > 0 && buyAssetPrice > 0) ? Math.floor(estimatedCashBack / buyAssetPrice) : 0;

    const HeaderAction = (
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700">
            <button
                onClick={() => setActiveTab('radar')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${activeTab === 'radar' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm' : 'text-zinc-500'}`}
            >
                <Radar size={14} /> Radar
            </button>
            <button
                onClick={() => setActiveTab('rebalance')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${activeTab === 'rebalance' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm' : 'text-zinc-500'}`}
            >
                <ArrowRightLeft size={14} /> Gặt lúa
            </button>
        </div>
    );

    return (
        <GlassCard
            title={<span className="uppercase tracking-wider font-bold text-zinc-900 dark:text-white flex items-center gap-2"><Fish className="text-primary" size={18} /> Shark Tracker</span>}
            action={HeaderAction}
            className="h-full min-h-[24rem]"
        >
            <div className="flex flex-col h-full animate-fade-in pt-2">

                {/* === TAB 1: SHARK RADAR (VSA & RSI) === */}
                {activeTab === 'radar' && (
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
                )}


                {/* === TAB 2: REBALANCING CALCULATOR === */}
                {activeTab === 'rebalance' && (
                    <div className="flex flex-col h-full gap-4">
                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 leading-relaxed">
                            <span className="font-bold text-zinc-900 dark:text-white">Chiến thuật "Gặt lúa":</span> Chốt lời một phần mã đã tăng nóng để tái đầu tư vào mã đang ở vùng giá tốt (RSI thấp / Tích lũy).
                        </div>

                        {/* STEP 1: SELL SIDE */}
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">1. Chốt lời mã (Portfolio)</label>
                            <div className="flex gap-2">
                                <select
                                    value={sellSymbol}
                                    onChange={e => setSellSymbol(e.target.value)}
                                    className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-sm font-bold focus:outline-none focus:border-primary"
                                >
                                    <option value="">Chọn mã...</option>
                                    {portfolio.filter(p => p.type === AssetType.Stock && p.quantity > 0).map(p => (
                                        <option key={p.symbol} value={p.symbol}>{p.symbol} (Lãi: {p.pnlPercent?.toFixed(1)}%)</option>
                                    ))}
                                </select>
                                <select
                                    value={sellPercent}
                                    onChange={e => setSellPercent(Number(e.target.value))}
                                    className="w-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-sm font-bold focus:outline-none focus:border-primary text-center"
                                >
                                    <option value={25}>25%</option>
                                    <option value={30}>30%</option>
                                    <option value={50}>50%</option>
                                    <option value={100}>All</option>
                                </select>
                            </div>
                            {estimatedCashBack > 0 && (
                                <div className="text-right text-xs text-emerald-500 font-bold">
                                    Thu về dự kiến: {formatCurrency(estimatedCashBack)}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center -my-1 text-zinc-400">
                            <ArrowRight className="rotate-90 md:rotate-90" size={16} />
                        </div>

                        {/* STEP 2: BUY SIDE */}
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">2. Tái đầu tư vào (Watchlist)</label>
                            <select
                                value={buySymbol}
                                onChange={e => setBuySymbol(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-sm font-bold focus:outline-none focus:border-primary"
                            >
                                <option value="">Chọn cơ hội...</option>
                                {marketSignals.map(s => (
                                    <option key={s.symbol} value={s.symbol}>{s.symbol} - {formatCurrency(s.price)} ({s.note})</option>
                                ))}
                            </select>

                        </div>

                        {/* RESULT BOX */}
                        <div className="mt-auto p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between">
                            <div>
                                <div className="text-[10px] uppercase font-bold text-primary opacity-80">Kết quả tái cơ cấu</div>
                                <div className="text-lg font-black text-primary">{estimatedNewShares} <span className="text-xs font-bold text-zinc-500 dark:text-white">cp {buySymbol}</span></div>
                            </div>
                            <button className="bg-primary text-white p-3 rounded-lg shadow-hard-sm hover:translate-y-0.5 hover:shadow-none transition-all">
                                <Calculator size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                    </div>
                )}
            </div>
        </GlassCard>
    );
};