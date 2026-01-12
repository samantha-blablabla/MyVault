import React from 'react';
import { GlassCard } from './ui/GlassCard';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../services/dataService';
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

  return (
    // Explicitly set bg-white for light mode, bg-zinc-950 for dark mode (solid)
    <GlassCard className="h-full relative overflow-hidden bg-white dark:bg-zinc-950">
      {/* Background Decor - Subtle */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-zinc-100 dark:bg-zinc-800/50 rounded-full blur-3xl opacity-50"></div>

      <div className="flex flex-col h-full justify-between gap-4 relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Landmark size={14} className="text-zinc-900 dark:text-primary"/> Tổng tài sản thực tế
                </h2>
                <div className="mt-2 flex items-end gap-3">
                    {/* Responsive Text Color: Black in Light, White in Dark */}
                    <span className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                        {isPrivacyMode ? '•••••••••' : formatCurrency(netWorth)}
                    </span>
                    
                    {/* Overall PnL Badge */}
                    <div className={`px-2 py-1 rounded text-xs font-bold mb-1.5 flex items-center gap-1 border ${totalPnL >= 0 ? 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-transparent' : 'bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-transparent'}`}>
                        {totalPnL >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {isPrivacyMode ? '•••' : `${totalPnL >= 0 ? '+' : ''}${formatCurrency(totalPnL)}`}
                    </div>
                </div>
            </div>
        </div>

        {/* Visual Bar */}
        <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex border border-zinc-200 dark:border-zinc-700">
            {/* Stock Part - Primary (Lime) */}
            <div className="h-full bg-primary border-r border-black/10" style={{ width: `${stockPercent}%` }}></div>
            {/* Cash Part - Zinc (Grey) */}
            <div className="h-full bg-zinc-400 dark:bg-zinc-500" style={{ width: `${cashPercent}%` }}></div>
        </div>

        {/* Breakdown Details */}
        <div className="grid grid-cols-2 gap-4">
            {/* Investment Section */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-700 hover:border-black dark:hover:border-zinc-500 transition-colors group">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-primary border border-black/10"></div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-semibold">Đầu tư & Tích sản</span>
                </div>
                <div className="text-lg font-bold text-zinc-900 dark:text-white">
                    {isPrivacyMode ? '••••••' : formatCurrency(portfolioValue)}
                </div>
                <div className={`text-[10px] font-medium ${totalPnL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    Hiệu suất: {pnlPercent.toFixed(2)}%
                </div>
            </div>

            {/* Cash Section */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-700 hover:border-black dark:hover:border-zinc-500 transition-colors group">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500"></div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-semibold">Tiền mặt & Dự phòng</span>
                </div>
                <div className="text-lg font-bold text-zinc-900 dark:text-white">
                    {isPrivacyMode ? '••••••' : formatCurrency(totalCash)}
                </div>
                <div className="text-[10px] text-zinc-400">
                    An toàn: {Math.round(cashPercent)}% cơ cấu
                </div>
            </div>
        </div>

      </div>
    </GlassCard>
  );
};