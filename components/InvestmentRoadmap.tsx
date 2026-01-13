import React, { useState, useMemo } from 'react';
import { GlassCard } from './ui/GlassCard';
import { useFinance } from '../context/FinanceContext';
import { Target, Lock, CheckCircle, Lightbulb, AlertTriangle, TrendingUp, ShoppingBag, Calculator, Calendar, Wallet, ArrowRight, Hourglass } from 'lucide-react';
import { TargetEditModal } from './TargetEditModal';
import { formatCurrency } from '../services/dataService';
import { getMonthlyHistory, getFinancialAdvice } from '../services/financeLogic';

export const InvestmentRoadmap: React.FC = () => {
  const { portfolio, isPrivacyMode, monthlyIncome, transactions, budget, shoppingPlan, updateShoppingPlan } = useFinance();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'stocks' | 'shopping'>('stocks');
  
  // --- SHOPPING PLAN STATE ---
  const [editShopping, setEditShopping] = useState(false);
  const [tempPlanName, setTempPlanName] = useState(shoppingPlan.name);
  const [tempPlanPrice, setTempPlanPrice] = useState(shoppingPlan.price.toString());
  const [tempSource, setTempSource] = useState<'savings' | 'invest'>(shoppingPlan.fundSource);
  // Default contribution is the stored one, or 20% of the total budget of that source
  const [tempContribution, setTempContribution] = useState<number>(shoppingPlan.monthlyContribution || 0);

  // 1. Calculate Insights (Stocks)
  const advice = useMemo(() => {
     const rules = {
         needs: budget.find(b => b.id === 'needs')?.percentage || 50,
         invest: budget.find(b => b.id === 'invest')?.percentage || 30,
     };
     const history = getMonthlyHistory(transactions, monthlyIncome);
     return getFinancialAdvice(history, rules);
  }, [transactions, monthlyIncome, budget]);

  // Stocks Data Logic
  const mbb = portfolio.find(s => s.symbol === 'MBB');
  const ctr = portfolio.find(s => s.symbol === 'CTR');
  const isMbbDone = (mbb?.quantity || 0) >= (mbb?.targetQuantity || 100);
  const activeTarget = isMbbDone ? ctr : mbb;
  const targetSymbol = activeTarget?.symbol || 'DONE';
  const targetQty = activeTarget?.targetQuantity || 0;
  const currentQty = activeTarget?.quantity || 0;
  const progress = targetQty > 0 ? Math.min(100, (currentQty / targetQty) * 100) : 0;
  const investBudget = monthlyIncome * 0.3;
  const stockBudget = Math.max(0, investBudget - 3000000); 
  const price = activeTarget?.currentPrice || 0;
  const needed = (targetQty - currentQty) * price;
  const effectiveStockBudget = stockBudget > 0 ? stockBudget : 500000; 
  const monthsToGoal = (price > 0 && needed > 0) ? (needed / effectiveStockBudget).toFixed(1) : 0;

  // --- SHOPPING CALCULATION LOGIC ---
  const sourceCategory = budget.find(b => b.id === tempSource);
  const maxAvailable = sourceCategory?.allocated || 0;
  
  // Update temp contribution if switching sources or first load
  React.useEffect(() => {
      if (editShopping && tempContribution === 0 && maxAvailable > 0) {
          setTempContribution(maxAvailable * 0.3); // Default to 30% of bucket
      }
  }, [maxAvailable, editShopping, tempSource]);

  const saveShoppingPlan = () => {
      updateShoppingPlan({
          name: tempPlanName,
          price: Number(tempPlanPrice),
          fundSource: tempSource,
          monthlyContribution: Number(tempContribution)
      });
      setEditShopping(false);
  };

  // View Mode Calculation
  const actualSourceCat = budget.find(b => b.id === shoppingPlan.fundSource);
  const contribution = shoppingPlan.monthlyContribution > 0 ? shoppingPlan.monthlyContribution : (actualSourceCat?.allocated || 0) * 0.3;
  
  const monthsToBuy = (shoppingPlan.price > 0 && contribution > 0) 
    ? (shoppingPlan.price / contribution).toFixed(1) 
    : 'N/A';
  const monthsNum = Number(monthsToBuy) || 0;

  // Calculate End Date
  const today = new Date();
  const endDate = new Date(today.setMonth(today.getMonth() + Math.ceil(monthsNum)));
  const endDateString = `Tháng ${endDate.getMonth() + 1}, ${endDate.getFullYear()}`;

  // Risk Assessment for Slider
  const riskPercent = maxAvailable > 0 ? (tempContribution / maxAvailable) * 100 : 0;
  let riskLevel = 'safe'; // safe, warning, danger
  let riskText = 'An toàn. Bạn vẫn còn dư nhiều để dự phòng.';
  
  if (riskPercent > 70) {
      riskLevel = 'danger';
      riskText = 'Rủi ro cao! Chiếm gần hết quỹ này.';
  } else if (riskPercent > 40) {
      riskLevel = 'warning';
      riskText = 'Cân nhắc. Nên giữ lại 50% quỹ.';
  }

  // --- MOBILE OPTIMIZED TABS ---
  const HeaderAction = (
     <div className="w-full sm:w-auto flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700">
        <button 
            onClick={() => setActiveTab('stocks')}
            className={`flex-1 sm:flex-none px-4 sm:px-3 py-1.5 sm:py-1 rounded-md text-xs font-bold transition-all text-center ${activeTab === 'stocks' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
        >
            Tích sản
        </button>
        <button 
            onClick={() => setActiveTab('shopping')}
            className={`flex-1 sm:flex-none px-4 sm:px-3 py-1.5 sm:py-1 rounded-md text-xs font-bold transition-all text-center ${activeTab === 'shopping' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
        >
            Mua sắm
        </button>
     </div>
  );

  return (
    <>
        <TargetEditModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
        
        <GlassCard 
            title={<span className="uppercase tracking-wider font-bold text-zinc-900 dark:text-white">Mục tiêu Tài chính</span>} 
            action={HeaderAction} 
            className="h-full relative overflow-hidden flex flex-col bg-white dark:bg-zinc-950"
        >
            
            {/* Background Effect */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                {activeTab === 'stocks' ? <Target size={80} className="text-black dark:text-white" /> : <ShoppingBag size={80} className="text-black dark:text-white" />}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 relative z-10 flex flex-col pt-4 pb-2">
                
                {/* === TAB 1: STOCKS ROADMAP === */}
                {activeTab === 'stocks' && (
                    <div className="flex flex-col h-full animate-fade-in">
                        {/* Advisor */}
                        {advice && (
                            <div className={`mb-5 p-3 rounded-lg border flex gap-3 flex-shrink-0 ${
                                advice.status === 'alert' ? 'bg-rose-100 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300' :
                                advice.status === 'warning' ? 'bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300' :
                                'bg-primary border-black text-black shadow-hard-sm dark:bg-primary/20 dark:border-primary/30 dark:text-white dark:shadow-none'
                            }`}>
                                <div className="flex-shrink-0 mt-0.5">
                                    {advice.status === 'good' ? <TrendingUp size={16} /> : <Lightbulb size={16} />}
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80 flex justify-between">
                                        <span>Tổng kết tháng {advice.month}</span>
                                        {advice.status === 'alert' && <AlertTriangle size={10} />}
                                    </div>
                                    <div className="text-xs font-medium leading-relaxed mb-1">
                                        {advice.message}
                                    </div>
                                    <div className="text-[10px] font-bold opacity-90 flex items-center gap-1">
                                        &rarr; {advice.action}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4 flex-1">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-zinc-500 uppercase">Lộ trình 2024</span>
                                <button onClick={() => setIsEditOpen(true)} className="text-xs text-secondary dark:text-primary hover:underline">Chỉnh sửa</button>
                             </div>

                             {/* Step 1 */}
                            <div className={`flex items-center gap-3 relative z-10 ${isMbbDone ? 'opacity-50' : 'opacity-100'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isMbbDone ? 'bg-primary border-black text-black' : 'border-primary text-black bg-primary/20'}`}>
                                    {isMbbDone ? <CheckCircle size={16} /> : <span className="text-xs font-bold">1</span>}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                        MB Bank (MBB) {isMbbDone && <span className="text-[10px] bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 px-1 rounded">HOÀN THÀNH</span>}
                                    </div>
                                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Mục tiêu: {mbb?.targetQuantity || 100} cp</div>
                                </div>
                            </div>
                             
                             {/* Line */}
                            <div className="w-0.5 h-6 bg-zinc-200 dark:bg-zinc-700 ml-4"></div>

                            {/* Step 2 */}
                            <div className={`flex items-center gap-3 relative z-10 ${!isMbbDone ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                                    {!isMbbDone ? <Lock size={14} /> : <span className="text-xs font-bold">2</span>}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-zinc-900 dark:text-white">Viettel Constr (CTR)</div>
                                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Mục tiêu: {ctr?.targetQuantity || 50} cp</div>
                                </div>
                            </div>

                             {/* Progress Box */}
                            <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 relative z-10">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-zinc-500 dark:text-zinc-400">Tiến độ {targetSymbol}</span>
                                    <span className="text-zinc-900 dark:text-white font-bold">{Math.round(progress)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
                                    <div className="h-full bg-primary border-r border-black/20 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                </div>
                                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 text-center">
                                    Dự kiến xong trong <span className="text-zinc-900 dark:text-white font-bold">{isPrivacyMode ? '•••' : `${monthsToGoal} tháng`}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* === TAB 2: SHOPPING PLANNER === */}
                {activeTab === 'shopping' && (
                    <div className="flex flex-col h-full animate-fade-in">
                        
                        {!shoppingPlan.name || editShopping ? (
                            // EDIT MODE
                            <div className="space-y-4">
                                {/* Mobile: Stack Inputs, Desktop: Grid 2 */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-bold text-zinc-500">Món đồ</label>
                                        <input 
                                            type="text" 
                                            placeholder="Tên món đồ..." 
                                            value={tempPlanName}
                                            onChange={e => setTempPlanName(e.target.value)}
                                            // text-base on mobile prevents iOS zoom
                                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-base sm:text-xs font-bold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-bold text-zinc-500">Giá (VND)</label>
                                        <input 
                                            type="number" 
                                            placeholder="0" 
                                            value={tempPlanPrice}
                                            onChange={e => setTempPlanPrice(e.target.value)}
                                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-base sm:text-xs font-bold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">Nguồn tiền sử dụng</label>
                                    {/* Mobile: Grid 2 for even width, Desktop: Same */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => setTempSource('savings')}
                                            className={`py-3 sm:py-2.5 rounded-xl text-xs font-bold border transition-colors shadow-sm ${tempSource === 'savings' ? 'bg-secondary text-white dark:bg-primary dark:text-black border-transparent shadow-md' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 bg-white dark:bg-zinc-900'}`}
                                        >
                                            Quỹ Dự phòng
                                        </button>
                                        <button 
                                            onClick={() => setTempSource('invest')}
                                            className={`py-3 sm:py-2.5 rounded-xl text-xs font-bold border transition-colors shadow-sm ${tempSource === 'invest' ? 'bg-secondary text-white dark:bg-primary dark:text-black border-transparent shadow-md' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 bg-white dark:bg-zinc-900'}`}
                                        >
                                            Quỹ Đầu tư
                                        </button>
                                    </div>
                                    <div className="text-[10px] text-zinc-500 text-right">
                                        Hạn mức quỹ: <span className="font-bold text-zinc-900 dark:text-white">{formatCurrency(maxAvailable)}</span>/tháng
                                    </div>
                                </div>

                                {/* SLIDER FOR MONTHLY CONTRIBUTION */}
                                <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                                     <div className="flex justify-between items-end">
                                        <label className="text-[10px] uppercase font-bold text-zinc-500">Trích lập hàng tháng</label>
                                        <span className={`text-base sm:text-sm font-black ${riskLevel === 'danger' ? 'text-rose-500' : 'text-primary'}`}>
                                            {formatCurrency(Number(tempContribution))}
                                        </span>
                                     </div>
                                     <div className="px-1">
                                         <input 
                                            type="range"
                                            min="0"
                                            max={maxAvailable}
                                            step="100000"
                                            value={tempContribution}
                                            onChange={(e) => setTempContribution(Number(e.target.value))}
                                            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                                                riskLevel === 'danger' ? 'bg-rose-900 accent-rose-500' : 
                                                riskLevel === 'warning' ? 'bg-amber-900 accent-amber-500' : 
                                                'bg-zinc-800 accent-primary'
                                            }`}
                                         />
                                     </div>
                                     
                                     {/* SMART ADVISOR BOX */}
                                     <div className={`p-3 rounded-xl border text-[11px] sm:text-[10px] flex items-start gap-2 leading-relaxed ${
                                         riskLevel === 'danger' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                                         riskLevel === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                                         'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                     }`}>
                                         {riskLevel === 'danger' ? <AlertTriangle size={16} className="shrink-0 mt-0.5" /> : 
                                          riskLevel === 'warning' ? <AlertTriangle size={16} className="shrink-0 mt-0.5" /> :
                                          <CheckCircle size={16} className="shrink-0 mt-0.5" />}
                                         <span>{riskText}</span>
                                     </div>
                                </div>

                                <button 
                                    onClick={saveShoppingPlan}
                                    className="w-full bg-black text-white dark:bg-white dark:text-black font-bold py-3.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 mt-2 shadow-lg active:scale-[0.98] transition-transform"
                                >
                                    <Calculator size={18} /> Lập kế hoạch
                                </button>
                                {shoppingPlan.name && (
                                    <button onClick={() => setEditShopping(false)} className="w-full text-xs text-zinc-500 hover:text-white underline py-3">Hủy bỏ</button>
                                )}
                            </div>
                        ) : (
                            // VIEW MODE (THE "PLAN DISPLAY")
                            <div className="flex flex-col h-full animate-slide-up">
                                
                                {/* 1. Header: Item & Cost (Optimized for Mobile) */}
                                <div className="flex flex-col gap-2 mb-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-sm shrink-0">
                                                <ShoppingBag size={24} className="text-zinc-900 dark:text-white" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Mục tiêu</div>
                                                <div className="text-lg font-black text-zinc-900 dark:text-white leading-tight line-clamp-2">{shoppingPlan.name}</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="pl-[3.75rem]">
                                         <div className="text-lg font-black text-zinc-900 dark:text-white">
                                            {isPrivacyMode ? '••••••' : formatCurrency(shoppingPlan.price)}
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Main Stat: Monthly Installment */}
                                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 mb-4 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-3 opacity-10">
                                        <Calendar size={80} className="text-zinc-900 dark:text-white" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-bold mb-1">Cần trích lập hàng tháng</div>
                                        <div className="text-3xl font-black text-primary flex flex-wrap items-baseline gap-2">
                                            {formatCurrency(contribution)} 
                                            <span className="text-xs text-zinc-500 dark:text-zinc-500 font-bold whitespace-nowrap opacity-60">/ tháng</span>
                                        </div>
                                        <div className="mt-3 text-[11px] text-zinc-500 flex items-center gap-1.5 bg-zinc-200/50 dark:bg-zinc-800/50 w-fit px-2 py-1 rounded-md">
                                            <Wallet size={12} /> 
                                            Trích từ <span className="font-bold text-zinc-900 dark:text-white">{actualSourceCat?.name.split('(')[0]}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Timeline Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                        <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Thời gian</div>
                                        <div className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                                            <Hourglass size={14} className="text-secondary dark:text-primary"/> 
                                            {monthsNum} tháng
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                        <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Hoàn thành</div>
                                        <div className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                                            <CheckCircle size={14} className="text-emerald-500"/> 
                                            {endDateString}
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Visual Progress Bar (Simulated 0% start) */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase">
                                        <span>Bắt đầu</span>
                                        <span>Mục tiêu</span>
                                    </div>
                                    <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-zinc-300 dark:bg-zinc-700 w-[2%] rounded-full"></div> 
                                    </div>
                                    <div className="text-center text-[10px] text-zinc-400 italic mt-1">
                                        Kế hoạch đang được theo dõi
                                    </div>
                                </div>

                                <div className="flex-1"></div>

                                <button 
                                    onClick={() => setEditShopping(true)}
                                    className="w-full mt-4 py-3.5 sm:py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 rounded-xl transition-all"
                                >
                                    Điều chỉnh kế hoạch
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </GlassCard>
    </>
  );
};