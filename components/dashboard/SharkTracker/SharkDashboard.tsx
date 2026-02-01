import React, { useEffect, useState } from 'react';
import { fetchSharkData, SharkData } from '../../../services/marketData';
import { GlassCard } from '../../ui/GlassCard';
import { TrendingUp, TrendingDown, AlertCircle, Activity, Info, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../../../services/dataService';

export const SharkDashboard: React.FC = () => {
    const [data, setData] = useState<SharkData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const res = await fetchSharkData();
            setData(res);
            setIsLoading(false);
        };
        load();
    }, []);

    if (isLoading || !data) {
        return <div className="p-12 text-center text-zinc-500 animate-pulse">Đang quét dữ liệu Cá mập...</div>;
    }

    // Determine signal color and icon
    const getSignalConfig = (signal: string) => {
        switch (signal) {
            case 'STRONG_BUY': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: TrendingUp, label: 'MUA MẠNH' };
            case 'BUY': return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: ArrowUpRight, label: 'TÍCH CỰC' };
            case 'STRONG_SELL': return { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: TrendingDown, label: 'BÁN THÁO' };
            case 'SELL': return { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: ArrowDownRight, label: 'TIÊU CỰC' };
            default: return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Activity, label: 'LƯỠNG LỰ' };
        }
    };

    const signalConfig = getSignalConfig(data.signal);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* 1. DAILY SIGNAL ALERT */}
            <div className={`rounded-2xl p-4 border ${signalConfig.bg} ${signalConfig.border} flex items-start gap-4 shadow-sm`}>
                <div className={`p-3 rounded-xl bg-white dark:bg-zinc-900 shadow-sm ${signalConfig.color}`}>
                    <signalConfig.icon size={28} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-lg font-black tracking-tight ${signalConfig.color}`}>
                            TÍN HIỆU: {signalConfig.label}
                        </h3>
                        {/* Tooltip hint */}
                        <div className="group relative">
                            <Info size={16} className="text-zinc-400 cursor-help" />
                            <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-64 p-3 bg-zinc-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                                {data.signalReason}
                                <div className="absolute left-1/2 top-full -translate-x-1/2 border-8 border-transparent border-t-zinc-800"></div>
                            </div>
                        </div>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">
                        {data.signalReason}
                    </p>
                </div>
            </div>

            {/* 2. MAIN METRICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FOREIGN FLOW */}
                <GlassCard className="h-64 flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4 z-10">
                        <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <BarChart3 size={18} className="text-indigo-500" />
                            Dòng vốn Khối Ngoại
                        </h4>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${data.foreignFlow.at(-1)?.netValue! > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            Hôm nay: {formatCurrency(Math.abs(data.foreignFlow.at(-1)?.netValue || 0))}
                            {data.foreignFlow.at(-1)?.netValue! > 0 ? ' (Mua ròng)' : ' (Bán ròng)'}
                        </span>
                    </div>

                    {/* Simple CSS Chart for Preview - Recharts would be better but keeping it zero-dep for this quick iteration */}
                    <div className="flex-1 flex items-end justify-between gap-2 px-2 pb-2 z-10">
                        {data.foreignFlow.map((day, idx) => {
                            const maxVal = Math.max(...data.foreignFlow.map(d => Math.abs(d.netValue)));
                            const height = Math.abs(day.netValue) / maxVal * 80; // max 80% height relative
                            const isBuy = day.netValue > 0;

                            return (
                                <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                                    <div className="relative w-full flex justify-center items-end h-[120px]">
                                        <div
                                            style={{ height: `${height}%` }}
                                            className={`w-full max-w-[30px] rounded-t-sm transition-all group-hover:opacity-80 ${isBuy ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                        >
                                            {/* Tooltip on hover chart bar */}
                                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-20">
                                                {formatCurrency(day.netValue)}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-400">{day.date}</span>
                                </div>
                            )
                        })}
                    </div>
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-grid-white/5 opacity-20 pointer-events-none" />
                </GlassCard>

                {/* LEADERBOARD */}
                <GlassCard className="h-64 overflow-hidden flex flex-col">
                    <h4 className="font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-orange-500" />
                        Cá Mập đang gom gì? (Top Buy)
                    </h4>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {data.topBuy.map(item => (
                            <div key={item.symbol} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-[10px]">
                                        {item.symbol}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-zinc-900 dark:text-white">{item.symbol}</div>
                                        <div className="text-[10px] text-emerald-500 font-bold">+{item.change}%</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-sm text-zinc-900 dark:text-white">{formatCurrency(item.value)}</div>
                                    <div className="text-[10px] text-zinc-400">Giá trị gom</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            {/* Optional: Proprietary Flow could be a third card/row */}
        </div>
    );
};
