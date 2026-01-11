import React, { useState, useEffect } from 'react';
import { X, Save, Wallet } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../services/dataService';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IncomeModal: React.FC<IncomeModalProps> = ({ isOpen, onClose }) => {
  const { monthlyIncome, updateIncome } = useFinance();
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (isOpen) {
        setAmount(monthlyIncome.toString());
    }
  }, [isOpen, monthlyIncome]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(amount) {
        updateIncome(Number(amount));
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
           <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
               <Wallet size={18} className="text-emerald-500"/> Cập nhật Lương
           </h3>
           <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
             <X size={20} />
           </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
           
           <p className="text-xs text-zinc-500 mb-4">
               Hệ thống sẽ tự động tính lại 3 hũ ngân sách (50-30-20) dựa trên con số này.
           </p>

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
                   {amount ? formatCurrency(Number(amount)) : ''}
               </div>
           </div>

           {/* Preview */}
           <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20 text-center">
                    <div className="text-[10px] text-blue-400 uppercase">Thiết yếu</div>
                    <div className="text-xs font-bold text-white">{amount ? formatCurrency(Number(amount) * 0.5) : '...'}</div>
                </div>
                <div className="p-2 bg-emerald-500/10 rounded border border-emerald-500/20 text-center">
                    <div className="text-[10px] text-emerald-400 uppercase">Đầu tư</div>
                    <div className="text-xs font-bold text-white">{amount ? formatCurrency(Number(amount) * 0.3) : '...'}</div>
                </div>
                <div className="p-2 bg-amber-500/10 rounded border border-amber-500/20 text-center">
                    <div className="text-[10px] text-amber-400 uppercase">Dự phòng</div>
                    <div className="text-xs font-bold text-white">{amount ? formatCurrency(Number(amount) * 0.2) : '...'}</div>
                </div>
           </div>

           {/* Submit */}
           <button 
             type="submit"
             className="w-full mt-2 bg-white text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] hover:bg-zinc-200"
           >
             <Save size={18} />
             Lưu & Tính Lại
           </button>
        </form>
      </div>
    </div>
  );
};