import React, { useState, useRef, useEffect } from 'react';
import { UserState, AssetType } from '../types';
import { formatCurrency } from '../services/dataService';
import { INITIAL_BUDGET } from '../constants';
import { StockCard } from './StockCard';
import { BudgetOverview } from './BudgetOverview';
import { GlassCard } from './ui/GlassCard';
import { DailySpendableWidget } from './DailySpendableWidget';
import { InvestmentRoadmap } from './InvestmentRoadmap';
import { StrategyWidget } from './StrategyWidget';
import { TransactionModal } from './TransactionModal';
import { ExpenseModal } from './ExpenseModal'; 
import { NetWorthCard } from './NetWorthCard';
import { RecentTransactions } from './RecentTransactions';
import { ShieldCheck, LogOut, TrendingUp, Plus, Zap, Eye, EyeOff, Wallet, PieChart as PieIcon, ServerOff, Moon, Sun, ArrowRight, LayoutGrid, List } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { MobileNavigation } from './MobileNavigation';

interface DashboardProps {
  user: UserState;
  logout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, logout }) => {
  const { portfolio, budget, addTransaction, addDailyTransaction, isPrivacyMode, togglePrivacyMode, transactions } = useFinance();
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  
  // Mobile Nav State
  const [activeTab, setActiveTab] = useState('overview');

  // Horizontal Scroll Logic for Stocks
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Refs for Scroll to Section (Mobile Nav)
  const overviewRef = useRef<HTMLDivElement>(null);
  const strategyRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);

  const stockAssets = portfolio.filter(s => s.type === AssetType.Stock);
  const fundAssets = portfolio.filter(s => s.type === AssetType.Fund);
  
  // Total Slides = Stocks (or 1 if empty) + Add Button
  const totalSlides = Math.max(stockAssets.length, 1) + 1;

  const handleScroll = () => {
    if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const firstChild = container.firstElementChild;
        const stride = firstChild ? firstChild.clientWidth + 16 : 276;
        
        const newIndex = Math.round(container.scrollLeft / stride);
        if (newIndex !== activeSlide && newIndex < totalSlides) {
            setActiveSlide(newIndex);
        }
    }
  };

  const scrollToSlide = (index: number) => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const firstChild = container.firstElementChild;
        const stride = firstChild ? firstChild.clientWidth + 16 : 276;
        
        container.scrollTo({
            left: index * stride,
            behavior: 'smooth'
        });
        setActiveSlide(index); 
      }
  };

  // Handle Mobile Nav Tab Change
  const handleTabChange = (tabId: string) => {
      setActiveTab(tabId);
      if (tabId === 'overview' && overviewRef.current) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (tabId === 'strategy' && strategyRef.current) {
          strategyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (tabId === 'portfolio' && portfolioRef.current) {
          portfolioRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  };

  // --- ALLOCATION CALCULATION ---
  const stockValue = stockAssets.reduce((sum, item) => sum + (item.quantity * item.currentPrice), 0);
  const fundValue = fundAssets.reduce((sum, item) => sum + (item.quantity * item.currentPrice), 0);
  
  // Calculate Cash (Available Budget + Savings)
  const needs = budget.find(b => b.id === 'needs');
  const savings = budget.find(b => b.id === 'savings');
  const cashValue = (Math.max(0, (needs?.allocated || 0) - (needs?.spent || 0))) + (savings?.allocated || 0);

  const totalAssets = stockValue + fundValue + cashValue;

  // Data for Chart - Dark Mode Colors Only
  const hasData = totalAssets > 0;
  const allocationData = hasData ? [
    { name: 'Cổ phiếu', value: stockValue, color: '#cafc01' }, // Primary Lime
    { name: 'CC Quỹ', value: fundValue, color: '#ffffff' },    // White
    { name: 'Tiền mặt', value: cashValue, color: '#52525b' },  // Zinc 600
  ] : [
    { name: 'Cổ phiếu', value: 1, color: '#cafc01' },
    { name: 'CC Quỹ', value: 1, color: '#ffffff' },
    { name: 'Tiền mặt', value: 1, color: '#52525b' },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 animate-fade-in pb-48 md:pb-8 overflow-x-hidden selection:bg-primary selection:text-black">
      
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
      
      {/* Mobile Navigation */}
      <MobileNavigation 
          onAddClick={() => setIsExpenseModalOpen(true)} 
          activeTab={activeTab}
          onTabChange={handleTabChange}
      />

      {/* Top Bar */}
      <header ref={overviewRef} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-10 gap-4">
        <div>
           {/* BIG BOLD TYPOGRAPHY */}
           <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter flex items-center gap-3">
             <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-black border-2 border-transparent shadow-lg">
                <ShieldCheck size={24} />
             </div>
             FINVAULT
           </h1>
           <div className="flex items-center gap-2 mt-2">
               <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-300 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest border border-zinc-200 dark:border-zinc-700">
                   Beta v2.1
               </span>
               <p className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold tracking-wide">Strategy & Wealth</p>
           </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
           {/* Primary Action Button: Black/Lime in Light, White/Black in Dark */}
           <button 
             onClick={() => setIsExpenseModalOpen(true)}
             className="hidden md:flex items-center gap-2 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-primary dark:text-zinc-900 border-2 border-transparent px-6 py-3 rounded-full transition-all text-sm font-black uppercase tracking-wider shadow-lg hover:shadow-xl hover:-translate-y-1"
           >
              <Zap size={18} fill="currentColor" />
              Thu / Chi Nhanh
           </button>

           <div className="flex bg-white dark:bg-zinc-900/50 p-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 backdrop-blur-md shadow-sm">
                <button 
                    onClick={togglePrivacyMode}
                    className="p-3 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                    title={isPrivacyMode ? "Hiện số dư" : "Ẩn số dư"}
                >
                    {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>

                {/* Theme Toggle Removed - Dark Mode Only */}
                
                <div className="w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1 my-2"></div>

                <button onClick={logout} className="p-3 rounded-full hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/20 text-zinc-600 dark:text-zinc-400 transition-colors">
                    <LogOut size={20} />
                </button>
           </div>
        </div>
      </header>

      {/* === SECTION 1: Bento Grid (Overview, Daily, Strategy) === */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-min mb-8">
        
        {/* Row 1 */}
        <div className="col-span-1 md:col-span-2 row-span-1 min-h-[22rem]">
            <NetWorthCard />
        </div>
        <div className="col-span-1 row-span-1 min-h-[22rem]">
            <DailySpendableWidget />
        </div>
        <div ref={strategyRef} className="col-span-1 md:col-span-1 row-span-1 min-h-[22rem]">
            <StrategyWidget />
        </div>
        
        {/* Row 2 */}
        <div className="col-span-1 md:col-span-2 min-h-[22rem]">
            <InvestmentRoadmap />
        </div>
        <div className="col-span-1 md:col-span-2 min-h-[22rem]">
            <BudgetOverview budgets={budget} />
        </div>

        {/* Row 3 - Transactions moved down */}
        <div className="col-span-1 md:col-span-4 min-h-[22rem]">
            <RecentTransactions />
        </div>
      </div>


      {/* === SECTION 2: INVESTMENT PORTFOLIO === */}
      
      {/* Header Area */}
      <div ref={portfolioRef} className="flex flex-row items-center justify-between mb-6 gap-4 mt-8 md:mt-16">
          <h2 className="text-2xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase leading-none">
              Danh Mục Đầu Tư
          </h2>
          {/* Ghost Button: Icon only on Mobile, Full on Desktop */}
          <button 
              onClick={() => setIsTransModalOpen(true)}
              className="group bg-transparent hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-900 dark:text-white border-2 border-zinc-900 dark:border-white rounded-full transition-all flex items-center justify-center gap-2 font-black uppercase tracking-wide hover:-translate-y-1 w-10 h-10 md:w-auto md:h-auto md:px-6 md:py-3"
          >
              <Plus size={18} strokeWidth={3} />
              <span className="hidden md:inline text-xs">Thêm Giao dịch</span>
          </button>
      </div>

      <div className="space-y-8">
        
        {/* 1. FUNDS ROW & ALLOCATION CHART */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Column 1 & 2: Funds List */}
             <div className="col-span-1 md:col-span-2 h-full">
                <GlassCard 
                    title={<div className="flex items-center gap-2 font-extrabold text-lg text-zinc-900 dark:text-white"><LayoutGrid size={20}/><span>Chứng chỉ Quỹ</span></div>} 
                    className="h-full min-h-[14rem]"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {fundAssets.map((fund) => (
                            <div key={fund.symbol} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-black/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-800 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-black dark:text-white font-black text-sm border border-zinc-200 dark:border-zinc-700 shadow-sm group-hover:scale-110 transition-transform">
                                        {fund.symbol[0]}
                                    </div>
                                    <div>
                                        <div className="text-base font-extrabold text-zinc-900 dark:text-white">{fund.symbol}</div>
                                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{fund.name}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-base font-extrabold text-zinc-900 dark:text-white">
                                        {isPrivacyMode ? '••••••' : formatCurrency(fund.currentPrice * fund.quantity)}
                                    </div>
                                    <div className="text-xs font-bold text-black bg-primary px-2 py-1 rounded-md inline-block mt-1">
                                    Lãi: {isPrivacyMode ? '•••' : formatCurrency((fund.currentPrice - fund.avgPrice) * fund.quantity)}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {fundAssets.length === 0 && (
                            <div className="text-zinc-500 dark:text-zinc-400 text-sm font-medium italic p-8 flex flex-col items-center gap-3 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
                                <ServerOff size={24} />
                                <span className="font-bold tracking-wider opacity-60 uppercase">Chưa có dữ liệu quỹ</span>
                            </div>
                        )}
                    </div>
                </GlassCard>
             </div>
             
             {/* Column 3: Allocation Chart (Real Data) */}
             <div className="col-span-1 h-full min-h-[14rem]">
                <GlassCard title={<span className="font-extrabold text-lg text-zinc-900 dark:text-white">Cơ cấu Tài sản</span>} className="h-full">
                    <div className="flex flex-col h-full">
                        <div className="flex-1 min-h-[150px] relative">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={allocationData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        {allocationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={hasData ? entry.color : '#e4e4e7'} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value: number) => hasData && !isPrivacyMode ? formatCurrency(value) : (isPrivacyMode ? '••••••' : `${value}%`)}
                                        contentStyle={{ backgroundColor: '#fff', borderColor: '#e4e4e7', color: '#000', fontSize: '12px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontWeight: 600 }}
                                        itemStyle={{ color: 'inherit' }}
                                    />
                                </PieChart>
                             </ResponsiveContainer>
                             {/* Center Text */}
                             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-80">
                                 <Wallet size={24} className="text-zinc-300 dark:text-zinc-600 mb-1" strokeWidth={2.5} />
                             </div>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-col gap-2 mt-2 px-2 pb-2">
                             {hasData ? allocationData.map((item, idx) => {
                                 // Calculate percent
                                 const percent = ((item.value / totalAssets) * 100).toFixed(1);
                                 return (
                                     <div key={idx} className="flex items-center justify-between text-xs">
                                         <div className="flex items-center gap-2">
                                             <div className="w-3 h-3 rounded-full border border-black/10 dark:border-white/10 shadow-sm" style={{ backgroundColor: item.color }}></div>
                                             <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wide">{item.name}</span>
                                         </div>
                                         <span className="font-extrabold text-zinc-900 dark:text-white">{percent}%</span>
                                     </div>
                                 )
                             }) : (
                                 <div className="text-[10px] text-zinc-500 dark:text-zinc-500 text-center mt-1 italic opacity-50 font-medium">
                                     (Chưa có dữ liệu tài sản)
                                 </div>
                             )}
                        </div>
                    </div>
                </GlassCard>
             </div>
        </div>

        {/* 2. STOCKS ROW (Horizontal Scroll with Dots) */}
        <div>
            {/* Header without Lines */}
            <div className="flex items-center justify-between mb-5 px-1">
                <span className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <List size={20} /> Cổ phiếu niêm yết
                </span>
                
                {/* Arrow Button - Ghost Style */}
                <button className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 dark:hover:bg-white dark:hover:text-black transition-colors">
                    <ArrowRight size={20} strokeWidth={3}/>
                </button>
            </div>
            
            {/* Scroll Container with PADDING to prevent Hover Clip */}
            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex gap-4 overflow-x-auto pb-8 pt-4 px-2 -mx-2 snap-x scrollbar-hide"
            >
                {stockAssets.map((stock) => (
                    <div key={stock.symbol} className="min-w-[280px] md:min-w-[300px] snap-center h-[280px]">
                        <StockCard stock={stock} />
                    </div>
                ))}
                
                {/* Empty State / Add New Card */}
                {stockAssets.length === 0 && (
                    <div className="min-w-[280px] h-[280px] snap-center flex flex-col gap-3 items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-400 dark:text-zinc-500 group hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
                        <ServerOff size={28} />
                        <span className="text-sm font-extrabold uppercase tracking-wide">Chưa có cổ phiếu</span>
                    </div>
                )}
                
                {/* Add Button as a Card - Ghost/Transparent */}
                <button 
                    onClick={() => setIsTransModalOpen(true)}
                    className="min-w-[100px] h-[280px] snap-center flex items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                    <div className="flex flex-col items-center gap-2 text-zinc-300 dark:text-zinc-700 group-hover:text-primary dark:group-hover:text-primary transition-colors">
                        <Plus size={40} strokeWidth={3} />
                    </div>
                </button>
            </div>

            {/* Pagination Dots - Clean */}
            {stockAssets.length > 0 && (
                <div className="flex items-center justify-center gap-2 mt-2">
                    {Array.from({ length: totalSlides }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => scrollToSlide(idx)}
                            className={`h-2 rounded-full transition-all duration-300 ${activeSlide === idx ? 'w-8 bg-zinc-900 dark:bg-primary' : 'w-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-600'}`}
                            aria-label={`Go to item ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>

      </div>

      {/* Mobile FAB removed in favor of Mobile Navigation */}
    </div>
  );
};