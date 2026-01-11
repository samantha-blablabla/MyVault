import React, { useState, useEffect } from 'react';
import { X, Save, Target } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { AssetType } from '../types';

interface TargetEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TargetEditModal: React.FC<TargetEditModalProps> = ({ isOpen, onClose }) => {
  const { targets, updateTarget, portfolio } = useFinance();
  const [localTargets, setLocalTargets] = useState<Record<string, number>>({});

  // Generate dynamic list of symbols to edit
  // Combine: Default Keys + Portfolio Keys
  const availableSymbols = Array.from(new Set([
      ...Object.keys(targets),
      ...portfolio.filter(p => p.type === AssetType.Stock).map(p => p.symbol),
      'MBB', 'TCB', 'HPG', 'CTR' // Ensure these always exist as defaults
  ])).sort();

  // Sync state when opening
  useEffect(() => {
    if (isOpen) {
        setLocalTargets({...targets});
    }
  }, [isOpen, targets]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update all targets in context
    Object.entries(localTargets).forEach(([symbol, qty]) => {
        updateTarget(symbol, Number(qty));
    });
    onClose();
  };

  const handleChange = (symbol: string, value: string) => {
      setLocalTargets(prev => ({
          ...prev,
          [symbol]: Number(value)
      }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
           <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
               <Target size={18} className="text-emerald-500"/> Thiết lập Mục tiêu
           </h3>
           <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
             <X size={20} />
           </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
           
           <p className="text-xs text-zinc-500 mb-4">
               Điều chỉnh số lượng cổ phiếu mục tiêu bạn muốn nắm giữ. Hệ thống sẽ tự động tính lại tiến độ.
           </p>

           <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
               {availableSymbols.map(symbol => (
                   <div key={symbol} className="flex items-center justify-between bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                       <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center font-bold text-xs text-white">
                               {symbol}
                           </div>
                           <span className="text-sm font-medium text-zinc-300">Số lượng</span>
                       </div>
                       <input 
                         type="number"
                         min="0"
                         value={localTargets[symbol] || 0}
                         onChange={(e) => handleChange(symbol, e.target.value)}
                         className="w-24 bg-transparent text-right font-bold text-white focus:outline-none border-b border-zinc-700 focus:border-emerald-500 py-1"
                       />
                   </div>
               ))}
           </div>

           {/* Submit */}
           <button 
             type="submit"
             className="w-full mt-2 bg-white text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] hover:bg-zinc-200"
           >
             <Save size={18} />
             Lưu Thay Đổi
           </button>
        </form>
      </div>
    </div>
  );
};