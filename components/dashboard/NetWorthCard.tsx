import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/dataService';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Landmark } from 'lucide-react';

export const NetWorthCard: React.FC = () => {
    const { portfolio, budget, isPrivacyMode } = useFinance();

    // 1. Calculate Portfolio Value (Live)
    const portfolioValue = portfolio.reduce((acc, item) => acc + (item.quantity * item.currentPrice), 0);
    const portfolioCost = portfolio.reduce((acc, item) => acc + (item.quantity * item.avgPrice), 0);
    const totalPnL = portfolioValue - portfolioCost;
    const pnlPercent = portfolioCost > 0 ? (totalPnL / portfolioCost) * 100 : 0;

    // 2. Calculate Cash Available
    const needs = budget.find(b => b.id === 'needs');
    const savings = budget.find(b => b.id === 'savings');

    const cashNeeds = (needs?.allocated || 0) - (needs?.spent || 0);
    const cashSavings = savings?.allocated || 0;
    const totalCash = Math.max(0, cashNeeds) + cashSavings;

    // 3. Total Net Worth
    const netWorth = portfolioValue + totalCash;

    // Chart bars calculation
    const totalForBar = netWorth || 1; // avoid div by 0
    const stockPercent = (portfolioValue / totalForBar) * 100;
    const cashPercent = (totalCash / totalForBar) * 100;

    // Generate Synthetic History for Sparkline (Last 30 days)
    const sparklineData = React.useMemo(() => {
        const data = [];
        let cv = netWorth * 0.95; // Start slightly lower
        for (let i = 0; i < 30; i++) {
            // Random walk
            const change = (Math.random() - 0.4) * (netWorth * 0.02);
            cv += change;
            if (i === 29) cv = netWorth;
            data.push({ i, val: cv });
        }
        return data;
    }, [netWorth]);

    return (
        <div className="relative overflow-hidden rounded-3xl bg-zinc-900 dark:bg-black border border-zinc-800 p-6 md:p-8 text-white shadow-2xl">
            {/* Background Sparkline */}
            <div className="absolute inset-x-0 bottom-0 top-1/3 opacity-10 pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparklineData}>
                        <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="val" stroke="#4f46e5" strokeWidth={2} fill="url(#colorVal)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="relative z-10 flex flex-col justify-between h-full gap-6">

                {/* Top Row: Net Worth (Left) + Breakdown (Right) */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    {/* Left: Header & Total */}
                    <div>
                        <h2 className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <Landmark size={14} className="text-zinc-900 dark:text-primary" /> Tổng tài sản thực tế
                        </h2>
                        <div className="mt-2 flex items-end gap-3">
                            <span className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">
                                {isPrivacyMode ? '•••••••••' : formatCurrency(netWorth)}
                            </span>

                            {/* Overall PnL Badge */}
                            <div className={`px-2 py-1 rounded-lg text-xs font-bold mb-2 flex items-center gap-1 border ${totalPnL >= 0 ? 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                                {totalPnL >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {isPrivacyMode ? '•••' : `${totalPnL >= 0 ? '+' : ''}${formatCurrency(totalPnL)}`}
                            </div>
                        </div>
                    </div>

                    {/* Right: Breakdown Details (Grid) */}
                    <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                        {/* Investment Section */}
                        <div className="p-3 pl-4 pr-6 rounded-2xl bg-zinc-50/50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 backdrop-blur-md">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
                                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-bold">Đầu tư</span>
                            </div>
                            <div className="text-sm font-bold text-zinc-900 dark:text-white">
                                {isPrivacyMode ? '••••••' : formatCurrency(portfolioValue)}
                            </div>
                        </div>

                        {/* Cash Section */}
                        <div className="p-3 pl-4 pr-6 rounded-2xl bg-zinc-50/50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 backdrop-blur-md">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500"></div>
                                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-bold">Tiền mặt</span>
                            </div>
                            <div className="text-sm font-bold text-zinc-900 dark:text-white">
                                {isPrivacyMode ? '••••••' : formatCurrency(totalCash)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Visual Bar */}
                <div className="w-full h-4 bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden flex border border-zinc-200 dark:border-white/5 p-1 relative">
                    {/* Stock Part - Primary (Lime) */}
                    <div
                        className="h-full bg-primary rounded-l-full relative group transition-all duration-500"
                        style={{ width: `${stockPercent}%` }}
                    >
                        {/* Tooltip or Label could go here */}
                    </div>
                    {/* Cash Part - Zinc (Grey) */}
                    <div
                        className="h-full bg-zinc-300 dark:bg-zinc-600 rounded-r-full transition-all duration-500"
                        style={{ width: `${cashPercent}%` }}
                    ></div>
                </div>

            </div>
        </div>
    );
};