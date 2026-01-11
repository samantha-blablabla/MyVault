import React, { useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { useFinance } from '../context/FinanceContext';
import { Target, Lock, CheckCircle, Pencil } from 'lucide-react';
import { TargetEditModal } from './TargetEditModal';
import { formatCurrency } from '../services/dataService';

export const InvestmentRoadmap: React.FC = () => {
  const { portfolio, isPrivacyMode, monthlyIncome } = useFinance();
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Find priority targets
  const mbb = portfolio.find(s => s.symbol === 'MBB');
  const ctr = portfolio.find(s => s.symbol === 'CTR');

  // Logic: Is MBB done?
  const isMbbDone = (mbb?.quantity || 0) >= (mbb?.targetQuantity || 100);
  
  // Active Target logic
  const activeTarget = isMbbDone ? ctr : mbb;
  const targetSymbol = activeTarget?.symbol || 'DONE';
  const targetQty = activeTarget?.targetQuantity || 0;
  const currentQty = activeTarget?.quantity || 0;
  
  // Prevent division by zero
  const progress = targetQty > 0 ? Math.min(100, (currentQty / targetQty) * 100) : 0;
  
  // Dynamic Calculation: 
  // Invest Bucket (30%) - Fixed Funds (VNDAF 2M + DFIX 1M = 3M) = Remaining for Stocks
  // If result is negative (income too low), assume 0 or minimum.
  const investBudget = monthlyIncome * 0.3;
  const stockBudget = Math.max(0, investBudget - 3000000); // 3M fixed for funds

  const price = activeTarget?.currentPrice || 0;
  const needed = (targetQty - currentQty) * price;
  
  // If stockBudget is very low, avoid Infinity
  const effectiveStockBudget = stockBudget > 0 ? stockBudget : 500000; // Fallback estimation
  const monthsToGoal = (price > 0 && needed > 0) ? (needed / effectiveStockBudget).toFixed(1) : 0;

  const EditButton = (
      <button 
        onClick={() => setIsEditOpen(true)}
        className="p-2 -mr-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-all"
        title="Chỉnh sửa mục tiêu"
      >
          <Pencil size={16} />
      </button>
  );

  return (
    <>
        <TargetEditModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
        
        <GlassCard title="Mục tiêu tiếp theo" action={EditButton} className="h-full relative overflow-hidden">
            {/* Background Effect */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Target size={80} className="text-emerald-500" />
            </div>

            <div className="space-y-6 relative z-10">
                {/* Step 1: MBB */}
                <div className={`flex items-center gap-3 ${isMbbDone ? 'opacity-50' : 'opacity-100'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isMbbDone ? 'bg-emerald-500 border-emerald-500' : 'border-emerald-500 text-emerald-500'}`}>
                        {isMbbDone ? <CheckCircle size={16} className="text-white" /> : <span className="text-xs font-bold">1</span>}
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                            MB Bank (MBB) {isMbbDone && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1 rounded">HOÀN THÀNH</span>}
                        </div>
                        <div className="text-xs text-zinc-500">Mục tiêu: {mbb?.targetQuantity || 100} cp</div>
                    </div>
                </div>

                {/* Connecting Line */}
                <div className="absolute left-4 top-10 w-0.5 h-8 bg-zinc-800 -z-10"></div>

                {/* Step 2: CTR */}
                <div className={`flex items-center gap-3 ${!isMbbDone ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center border border-zinc-600 bg-zinc-800 text-zinc-400">
                        {!isMbbDone ? <Lock size={14} /> : <span className="text-xs font-bold">2</span>}
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white">Viettel Constr (CTR)</div>
                        <div className="text-xs text-zinc-500">Mục tiêu: {ctr?.targetQuantity || 50} cp</div>
                    </div>
                </div>

                {/* Active Progress */}
                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex justify-between text-xs mb-2">
                        <span className="text-zinc-300">Tiến độ {targetSymbol}</span>
                        <span className="text-emerald-400">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-700 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="text-[10px] text-zinc-500 text-center">
                        Dự kiến hoàn thành trong <span className="text-white font-bold">{isPrivacyMode ? '•••' : `${monthsToGoal} tháng`}</span> với ngân sách {formatCurrency(effectiveStockBudget)}/tháng.
                    </div>
                </div>
            </div>
        </GlassCard>
    </>
  );
};