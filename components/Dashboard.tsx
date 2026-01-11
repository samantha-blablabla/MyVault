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
import { NetWorthCard } from './NetWorthCard';
import { RecentTransactions } from './RecentTransactions';
import { ShieldCheck, LogOut, TrendingUp, Plus, Zap, Eye, EyeOff, Wallet, PieChart as PieIcon } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  user: UserState;
  logout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, logout }) => {
  const { portfolio, budget, addTransaction, addDailyTransaction, isPrivacyMode, togglePrivacyMode } = useFinance();
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const stockAssets = portfolio.filter(s => s.type === AssetType.Stock);
  const fundAssets = portfolio.filter(s => s.type === AssetType.Fund);

  // --- ALLOCATION CALCULATION ---
  const stockValue = stockAssets.reduce((sum, item) => sum + (item.quantity * item.currentPrice), 0);
  const fundValue = fundAssets.reduce((sum, item) => sum + (item.quantity * item.currentPrice), 0);
  
  // Calculate Cash (Available Budget + Savings)
  const needs = budget.find(b => b.id === 'needs');
  const savings = budget.find(b => b.id === 'savings');
  const cashValue = (Math.max(0, (needs?.allocated || 0) - (needs?.spent || 0))) + (savings?.allocated || 0);

  const totalAssets = stockValue + fundValue + cashValue;

  // Data for Chart (Use real data if available, otherwise dummy for preview)
  // MONOTONE COLORS: White (Stock), Zinc-400 (Funds), Zinc-600 (Cash)
  const hasData = totalAssets > 0;
  const allocationData = hasData ? [
    { name: 'Cổ phiếu', value: stockValue, color: '#e4e4e7' }, // Zinc-200 (Brightest)
    { name: 'CC Quỹ', value: fundValue, color: '#a1a1aa' },   // Zinc-400 (Mid)
    { name: 'Tiền mặt', value: cashValue, color: '#52525b' }, // Zinc-600 (Dark)
  ] : [
    { name: 'Cổ phiếu', value: 45, color: '#e4e4e7' },
    { name: 'CC Quỹ', value: 30, color: '#a1a1aa' },
    { name: 'Tiền mặt', value: 25, color: '#52525b' },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 animate-fade-in pb-24 md:pb-8 overflow-x-hidden">
      
      <TransactionModal 
        isOpen={isTransModalOpen} 
        onClose={() => setIsTransModalOpen(false)} 
        onSubmit={addTransaction} 
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSubmit={addDailyTransaction}
      />

      {/* Top Bar */}
      <header className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
             <ShieldCheck className="text-zinc-100" /> FinVault
           </h1>
           <p className="text-zinc-500 text-sm mt-1">Hệ thống quản trị tài sản cá nhân</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setIsExpenseModalOpen(true)}
             className="hidden md:flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 px-3 py-2 rounded-full transition-colors text-xs font-bold uppercase tracking-wider shadow-lg"
           >
              <Zap size={16} className="text-zinc-200" fill="currentColor" />
              Thu / Chi Nhanh
           </button>

           <button 
             onClick={togglePrivacyMode}
             className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
             title={isPrivacyMode ? "Hiện số dư" : "Ẩn số dư"}
           >
              {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
           </button>
           
           <div className="h-8 w-[1px] bg-zinc-800 mx-1 hidden sm:block"></div>

           <button onClick={logout} className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
              <LogOut size={20} />
           </button>
        </div>
      </header>

      {/* === SECTION 1 & 2: Overview & Cashflow (Bento Grid) === */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-min mb-8">
        
        {/* Row 1 */}
        <div className="col-span-1 md:col-span-2 row-span-1 min-h-[22rem]">
            <NetWorthCard />
        </div>
        <div className="col-span-1 row-span-1 min-h-[22rem]">
            <DailySpendableWidget />
        </div>
        <div className="col-span-1 row-span-1 min-h-[22rem]">
            <InvestmentRoadmap />
        </div>
        
        {/* Row 2 */}
        <div className="col-span-1 md:col-span-2 min-h-[22rem]">
          <BudgetOverview budgets={INITIAL_BUDGET} />
        </div>
        <div className="col-span-1 md:col-span-2 min-h-[22rem]">
            <RecentTransactions />
        </div>
      </div>


      {/* === SECTION 3: INVESTMENT PORTFOLIO === */}
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp size={24} className="text-zinc-400" />
              Danh mục Đầu tư & Tích sản
          </h2>
          <button 
              onClick={() => setIsTransModalOpen(true)}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 px-4 py-2 rounded-full transition-colors flex items-center gap-2 font-bold uppercase tracking-wide w-fit"
          >
              <Plus size={16} />
              Thêm Giao dịch Mới
          </button>
      </div>

      <div className="space-y-6">
        
        {/* 1. FUNDS ROW & ALLOCATION CHART */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Column 1 & 2: Funds List */}
             <div className="col-span-1 md:col-span-2 h-full">
                <GlassCard 
                    title={<div className="flex items-center gap-2"><PieIcon size={16} className="text-zinc-400"/><span>Chứng chỉ quỹ (Funds)</span></div>} 
                    className="h-full min-h-[14rem]"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {fundAssets.map((fund) => (
                            <div key={fund.symbol} className="flex items-center justify-between p-4 rounded-xl bg-black/20 hover:bg-black/40 transition-colors border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-sm border border-zinc-700">
                                        {fund.symbol[0]}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{fund.symbol}</div>
                                        <div className="text-xs text-zinc-500">{fund.name}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-white">
                                        {isPrivacyMode ? '••••••' : formatCurrency(fund.currentPrice * fund.quantity)}
                                    </div>
                                    <div className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded inline-block mt-1">
                                    Lãi: {isPrivacyMode ? '•••' : formatCurrency((fund.currentPrice - fund.avgPrice) * fund.quantity)}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {fundAssets.length === 0 && <div className="text-zinc-500 text-sm italic p-2">Chưa có quỹ nào.</div>}
                    </div>
                    <div className="mt-4 text-[10px] text-zinc-600 uppercase tracking-wider text-center border-t border-white/5 pt-2">
                        Dữ liệu NAV cập nhật tự động
                    </div>
                </GlassCard>
             </div>
             
             {/* Column 3: Allocation Chart (Real Data) */}
             <div className="col-span-1 h-full min-h-[14rem]">
                <GlassCard title="Cơ cấu tài sản" className="h-full">
                    <div className="flex flex-col h-full">
                        <div className="flex-1 min-h-[150px] relative">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={allocationData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={60}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        {allocationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value: number) => hasData && !isPrivacyMode ? formatCurrency(value) : (isPrivacyMode ? '••••••' : `${value}%`)}
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff', fontSize: '12px', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                             </ResponsiveContainer>
                             {/* Center Text */}
                             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-80">
                                 <Wallet size={16} className="text-zinc-500 mb-1" />
                             </div>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-col gap-2 mt-2 px-2 pb-2">
                             {allocationData.map((item, idx) => {
                                 // Calculate percent
                                 const percent = hasData 
                                     ? ((item.value / totalAssets) * 100).toFixed(1) 
                                     : item.value; // dummy value is already percent
                                 
                                 return (
                                     <div key={idx} className="flex items-center justify-between text-xs">
                                         <div className="flex items-center gap-2">
                                             <div className="w-2 h-2 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: item.color, boxShadow: `0 0 5px ${item.color}` }}></div>
                                             <span className="text-zinc-400">{item.name}</span>
                                         </div>
                                         <span className="font-bold text-white">{percent}%</span>
                                     </div>
                                 )
                             })}
                             {!hasData && (
                                 <div className="text-[10px] text-zinc-600 text-center mt-1 italic">
                                     (Biểu đồ minh họa)
                                 </div>
                             )}
                        </div>
                    </div>
                </GlassCard>
             </div>
        </div>

        {/* 2. STOCKS ROW (Horizontal Scroll) */}
        <div>
            <div className="flex items-center gap-2 mb-3 px-1">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Cổ phiếu niêm yết</span>
                <div className="h-[1px] flex-1 bg-zinc-800"></div>
                <span className="text-[10px] text-zinc-600">Scroll ngang để xem thêm &rarr;</span>
            </div>
            
            {/* Scroll Container */}
            <div className="flex gap-4 overflow-x-auto pb-6 snap-x custom-scrollbar">
                {stockAssets.map((stock) => (
                    <div key={stock.symbol} className="min-w-[260px] md:min-w-[280px] snap-center h-[230px]">
                        <StockCard stock={stock} />
                    </div>
                ))}
                
                {/* Empty State / Add New Card */}
                {stockAssets.length === 0 && (
                    <div className="min-w-[260px] h-[230px] flex items-center justify-center border border-dashed border-zinc-700 rounded-2xl bg-zinc-900/20 text-zinc-500">
                        Chưa có cổ phiếu
                    </div>
                )}
                
                {/* Add Button as a Card */}
                <button 
                    onClick={() => setIsTransModalOpen(true)}
                    className="min-w-[80px] md:min-w-[100px] flex items-center justify-center rounded-2xl border border-dashed border-zinc-800 hover:border-zinc-500/50 hover:bg-zinc-500/5 transition-all group"
                >
                    <div className="flex flex-col items-center gap-2 text-zinc-600 group-hover:text-zinc-300">
                        <Plus size={24} />
                    </div>
                </button>
            </div>
        </div>

      </div>

      {/* Mobile Floating Action Button (Quick Add) */}
      <div className="fixed bottom-6 right-6 md:hidden z-40">
          <button 
            onClick={() => setIsExpenseModalOpen(true)}
            className="w-14 h-14 rounded-full bg-zinc-800 text-white border border-zinc-700 shadow-2xl shadow-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          >
              <Zap size={24} fill="currentColor" />
          </button>
      </div>
    </div>
  );
};