import React, { useState } from 'react';
import { UserState, AssetType } from '../types';
import { formatCurrency } from '../services/dataService';
import { INITIAL_BUDGET } from '../constants';
import { StockCard } from './StockCard';
import { BudgetOverview } from './BudgetOverview';
import { GlassCard } from './ui/GlassCard';
import { DailySpendableWidget } from './DailySpendableWidget';
import { InvestmentRoadmap } from './InvestmentRoadmap';
import { TransactionModal } from './TransactionModal';
import { ExpenseModal } from './ExpenseModal'; 
import { ShieldCheck, LogOut, TrendingUp, Plus, Zap, Eye, EyeOff } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface DashboardProps {
  user: UserState;
  logout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, logout }) => {
  const { portfolio, addTransaction, addDailyTransaction, isPrivacyMode, togglePrivacyMode } = useFinance();
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const totalNetWorth = portfolio.reduce((acc, stock) => acc + (stock.quantity * stock.currentPrice), 0) + 
                        INITIAL_BUDGET.find(b => b.id === 'savings')?.allocated!; 

  const stockAssets = portfolio.filter(s => s.type === AssetType.Stock);
  const fundAssets = portfolio.filter(s => s.type === AssetType.Fund);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 animate-fade-in pb-24 md:pb-8">
      
      {/* Transaction Modal (Stocks) */}
      <TransactionModal 
        isOpen={isTransModalOpen} 
        onClose={() => setIsTransModalOpen(false)} 
        onSubmit={addTransaction} 
      />

      {/* Expense/Income Modal (Quick Add) */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSubmit={addDailyTransaction}
      />

      {/* Top Bar */}
      <header className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
             <ShieldCheck className="text-emerald-500" /> FinVault
           </h1>
           <p className="text-zinc-500 text-sm mt-1">Hệ thống quản trị tài sản cá nhân</p>
        </div>
        <div className="flex items-center gap-3">
           {/* Quick Add Button (Desktop) */}
           <button 
             onClick={() => setIsExpenseModalOpen(true)}
             className="hidden md:flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 px-3 py-2 rounded-full transition-colors text-xs font-bold uppercase tracking-wider shadow-lg"
           >
              <Zap size={16} className="text-amber-400" fill="currentColor" />
              Thu / Chi Nhanh
           </button>

           {/* Privacy Toggle */}
           <button 
             onClick={togglePrivacyMode}
             className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
             title={isPrivacyMode ? "Hiện số dư" : "Ẩn số dư"}
           >
              {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
           </button>

           <div className="text-right hidden sm:block">
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Tổng tài sản</div>
              <div className="text-xl text-emerald-400 font-bold">
                  {isPrivacyMode ? '••••••' : formatCurrency(totalNetWorth)}
              </div>
           </div>
           
           <div className="h-8 w-[1px] bg-zinc-800 mx-1 hidden sm:block"></div>

           <button onClick={logout} className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
              <LogOut size={20} />
           </button>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-min">
        
        {/* Row 1: Budget takes 2 cols */}
        <div className="col-span-1 md:col-span-2 row-span-2 min-h-[18rem]">
          <BudgetOverview budgets={INITIAL_BUDGET} />
        </div>

        {/* Daily Spendable Widget */}
        <div className="col-span-1 row-span-2 h-full">
            <DailySpendableWidget />
        </div>

        {/* Investment Roadmap */}
        <div className="col-span-1 row-span-2 h-full">
            <InvestmentRoadmap />
        </div>
        
        {/* Row 2: Header for Stocks */}
        <div className="col-span-1 md:col-span-4 mt-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                    <TrendingUp size={20} className="text-emerald-500" />
                    Danh mục Đầu tư (Real-time)
                </h2>
                <button 
                  onClick={() => setIsTransModalOpen(true)}
                  className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                >
                    <Plus size={14} />
                    Thêm Giao dịch
                </button>
            </div>
        </div>

        {/* Stock Cards Grid - Generated from Context */}
        {stockAssets.map((stock) => (
           <div key={stock.symbol} className="col-span-1 md:col-span-2 lg:col-span-1 h-64">
              <StockCard stock={stock} />
           </div>
        ))}

        {/* Funds List */}
        <div className="col-span-1 md:col-span-2 h-full min-h-[16rem]">
            <GlassCard title="Chứng chỉ quỹ" className="h-full">
                <div className="space-y-4">
                    {fundAssets.map((fund) => (
                        <div key={fund.symbol} className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/40 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-sky-500/10 flex items-center justify-center text-sky-400 font-bold text-xs">
                                    {fund.symbol[0]}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white">{fund.symbol}</div>
                                    <div className="text-xs text-zinc-500">{fund.name}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-white">
                                    {isPrivacyMode ? '••••••' : formatCurrency(fund.currentPrice * fund.quantity)}
                                </div>
                                <div className="text-xs text-emerald-500">
                                   Lãi: {isPrivacyMode ? '•••' : formatCurrency((fund.currentPrice - fund.avgPrice) * fund.quantity)}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="mt-4 p-3 border border-dashed border-zinc-700 rounded-lg text-center text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer hover:border-zinc-500 transition-all">
                        Hệ thống tự động đồng bộ giá từ n8n
                    </div>
                </div>
            </GlassCard>
        </div>

      </div>

      {/* Mobile Floating Action Button (Quick Add) */}
      <div className="fixed bottom-6 right-6 md:hidden z-40">
          <button 
            onClick={() => setIsExpenseModalOpen(true)}
            className="w-14 h-14 rounded-full bg-zinc-800 text-amber-400 border border-zinc-700 shadow-2xl shadow-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          >
              <Zap size={24} fill="currentColor" />
          </button>
      </div>
    </div>
  );
};