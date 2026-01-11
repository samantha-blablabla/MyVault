import React from 'react';
import { GlassCard } from './ui/GlassCard';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../services/dataService';
import { TrendingUp, TrendingDown, Wallet, PieChart, Landmark } from 'lucide-react';

export const NetWorthCard: React.FC = () => {
  const { portfolio, budget, isPrivacyMode } = useFinance();

  // 1. Calculate Portfolio Value (Live)
  const portfolioValue = portfolio.reduce((acc, item) => acc + (item.quantity * item.currentPrice), 0);
  const portfolioCost = portfolio.reduce((acc, item) => acc + (item.quantity * item.avgPrice), 0);
  const totalPnL = portfolioValue - portfolioCost;
  const pnlPercent = portfolioCost > 0 ? (totalPnL / portfolioCost) * 100 : 0;

  // 2. Calculate Cash Available
  // Cash = (Needs Allocated - Needs Spent) + Savings Allocated
  // Note: We assume Investment Budget is transferred to Portfolio, so we don't count "Invest Remaining" as Cash here to avoid confusion.
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
    <GlassCard className="h-full relative overflow-hidden bg-gradient-to-br from-zinc-900/80 to-black/50">
      {/* Background Decor */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>

      <div className="flex flex-col h-full justify-between gap-4">
        
        {/* Header */}
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Landmark size={14} className="text-emerald-500"/> Tổng Tài Sản Thực Tế
                </h2>
                <div className="mt-2 flex items-end gap-3">
                    <span className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                        {isPrivacyMode ? '•••••••••' : formatCurrency(netWorth)}
                    </span>
                    
                    {/* Overall PnL Badge (Only shows Investment PnL context) */}
                    <div className={`px-2 py-1 rounded text-xs font-bold mb-1.5 flex items-center gap-1 ${totalPnL >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {totalPnL >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {isPrivacyMode ? '•••' : `${totalPnL >= 0 ? '+' : ''}${formatCurrency(totalPnL)}`}
                    </div>
                </div>
            </div>
        </div>

        {/* Visual Bar */}
        <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-500" style={{ width: `${stockPercent}%` }}></div>
            <div className="h-full bg-sky-500" style={{ width: `${cashPercent}%` }}></div>
        </div>

        {/* Breakdown Details */}
        <div className="grid grid-cols-2 gap-4">
            {/* Investment Section */}
            <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5 hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs text-zinc-500 uppercase font-semibold">Đầu tư & Tích sản</span>
                </div>
                <div className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {isPrivacyMode ? '••••••' : formatCurrency(portfolioValue)}
                </div>
                <div className={`text-[10px] font-medium ${totalPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    Hiệu suất: {pnlPercent.toFixed(2)}%
                </div>
            </div>

            {/* Cash Section */}
            <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5 hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                    <span className="text-xs text-zinc-500 uppercase font-semibold">Tiền mặt & Dự phòng</span>
                </div>
                <div className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors">
                    {isPrivacyMode ? '••••••' : formatCurrency(totalCash)}
                </div>
                <div className="text-[10px] text-zinc-500">
                    An toàn: {Math.round(cashPercent)}% cơ cấu
                </div>
            </div>
        </div>

      </div>
    </GlassCard>
  );
};