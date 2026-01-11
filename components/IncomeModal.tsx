import React, { useState, useEffect } from 'react';
import { X, Save, Wallet, PieChart, AlertCircle } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../services/dataService';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IncomeModal: React.FC<IncomeModalProps> = ({ isOpen, onClose }) => {
  const { monthlyIncome, budget, updateBudgetPlan } = useFinance();
  const [amount, setAmount] = useState('');
  
  // Percentages state
  const [needsPct, setNeedsPct] = useState(50);
  const [investPct, setInvestPct] = useState(30);
  const [savingsPct, setSavingsPct] = useState(20);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
        setAmount(monthlyIncome.toString());
        // Find percentages from current budget
        const n = budget.find(b => b.id === 'needs')?.percentage || 50;
        const i = budget.find(b => b.id === 'invest')?.percentage || 30;
        const s = budget.find(b => b.id === 'savings')?.percentage || 20;
        setNeedsPct(n);
        setInvestPct(i);
        setSavingsPct(s);
    }
  }, [isOpen, monthlyIncome, budget]);

  if (!isOpen) return null;

  const totalPct = Number(needsPct) + Number(investPct) + Number(savingsPct);
  const isValid = totalPct === 100 && Number(amount) > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(isValid) {
        updateBudgetPlan(Number(amount), {
            needs: Number(needsPct),
            invest: Number(investPct),
            savings: Number(savingsPct)
        });
        onClose();
    }
  };

  const parsedAmount = Number(amount) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
           <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
               <Wallet size={18} className="text-emerald-500"/> Điều chỉnh Kế hoạch
           </h3>
           <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
             <X size={20} />
           </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           
           {/* 1. Income Input */}
           <div className="space-y-2">
               <label className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Tổng thu nhập tháng này</label>
               <input 
                 type="number"
                 min="0"
                 required
                 value={amount}
                 onChange={(e) => setAmount(e.target.value)}
                 className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-lg font-bold text-white focus:outline-none focus:border-emerald-500"
                 placeholder="VD: 13000000"
               />
               <div className="text-right text-xs text-emerald-400 font-bold h-4">
                   {amount ? formatCurrency(parsedAmount) : ''}
               </div>
           </div>

           {/* 2. Percentage Sliders */}
           <div className="space-y-4 pt-2 border-t border-zinc-800">
               <div className="flex items-center justify-between">
                   <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-2">
                       <PieChart size={12}/> Phân bổ tỷ lệ (%)
                   </label>
                   <span className={`text-xs font-bold ${totalPct === 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
                       Tổng: {totalPct}%
                   </span>
               </div>

               {/* Needs */}
               <div className="space-y-1">
                   <div className="flex justify-between text-xs">
                       <span className="text-blue-400">Thiết yếu</span>
                       <span className="text-white font-bold">{needsPct}%</span>
                   </div>
                   <input 
                        type="range" min="0" max="100" step="5"
                        value={needsPct}
                        onChange={e => setNeedsPct(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                   />
               </div>

               {/* Invest */}
               <div className="space-y-1">
                   <div className="flex justify-between text-xs">
                       <span className="text-emerald-400">Đầu tư</span>
                       <span className="text-white font-bold">{investPct}%</span>
                   </div>
                   <input 
                        type="range" min="0" max="100" step="5"
                        value={investPct}
                        onChange={e => setInvestPct(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                   />
               </div>

               {/* Savings */}
               <div className="space-y-1">
                   <div className="flex justify-between text-xs">
                       <span className="text-amber-400">Dự phòng</span>
                       <span className="text-white font-bold">{savingsPct}%</span>
                   </div>
                   <input 
                        type="range" min="0" max="100" step="5"
                        value={savingsPct}
                        onChange={e => setSavingsPct(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                   />
               </div>
           </div>

           {/* Preview Logic */}
           {totalPct !== 100 ? (
               <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-rose-400 text-xs">
                   <AlertCircle size={16} /> Tổng tỷ lệ phải bằng 100% (Hiện tại: {totalPct}%)
               </div>
           ) : (
               <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="p-2 bg-blue-500/5 rounded border border-blue-500/20 text-center">
                        <div className="text-[10px] text-blue-400 font-bold mb-1">{formatCurrency(parsedAmount * (needsPct / 100))}</div>
                        <div className="text-[9px] text-zinc-500">Thiết yếu</div>
                    </div>
                    <div className="p-2 bg-emerald-500/5 rounded border border-emerald-500/20 text-center">
                        <div className="text-[10px] text-emerald-400 font-bold mb-1">{formatCurrency(parsedAmount * (investPct / 100))}</div>
                        <div className="text-[9px] text-zinc-500">Đầu tư</div>
                    </div>
                    <div className="p-2 bg-amber-500/5 rounded border border-amber-500/20 text-center">
                        <div className="text-[10px] text-amber-400 font-bold mb-1">{formatCurrency(parsedAmount * (savingsPct / 100))}</div>
                        <div className="text-[9px] text-zinc-500">Dự phòng</div>
                    </div>
               </div>
           )}

           {/* Submit */}
           <button 
             type="submit"
             disabled={!isValid}
             className={`w-full mt-2 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                 isValid 
                 ? 'bg-white text-black hover:bg-zinc-200 active:scale-[0.98]' 
                 : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
             }`}
           >
             <Save size={18} />
             Lưu Kế Hoạch Mới
           </button>
        </form>
      </div>
    </div>
  );
};