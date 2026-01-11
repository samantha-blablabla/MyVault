import React, { useState } from 'react';
import { X, Check, Camera, Coffee, CreditCard, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../services/dataService';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, note: string) => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    onSubmit(Number(amount), note);
    onClose();
    setAmount('');
    setNote('');
  };

  const handleScanFeature = () => {
      // Placeholder for the future AI Feature
      setIsScanning(true);
      setTimeout(() => {
          setIsScanning(false);
          alert("Tính năng AI Scan Hóa Đơn sẽ được cập nhật trong phiên bản tiếp theo!");
      }, 1000);
  }

  // Quick suggestions
  const suggestions = [
      { icon: <Coffee size={14} />, label: 'Cà phê', value: 35000 },
      { icon: <ShoppingBag size={14} />, label: 'Siêu thị', value: 500000 },
      { icon: <CreditCard size={14} />, label: 'Xăng xe', value: 80000 },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full md:max-w-md bg-zinc-900 border-t md:border border-zinc-800 rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
           <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
               Quick Add Chi Tiêu
           </h3>
           <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
             <X size={20} />
           </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
           
           {/* Big Amount Input */}
           <div className="text-center">
               <label className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-2 block">Số tiền (VND)</label>
               <input 
                 type="number" 
                 autoFocus
                 required
                 placeholder="0"
                 value={amount}
                 onChange={e => setAmount(e.target.value)}
                 className="w-full bg-transparent text-5xl font-mono font-bold text-white text-center focus:outline-none placeholder-zinc-800"
               />
               <div className="text-emerald-500 text-sm mt-2 font-mono h-5">
                   {amount ? formatCurrency(Number(amount)) : ''}
               </div>
           </div>

           {/* Quick Suggestions */}
           <div className="flex justify-center gap-3">
               {suggestions.map((s, idx) => (
                   <button 
                    key={idx}
                    type="button"
                    onClick={() => { setAmount(s.value.toString()); setNote(s.label); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs hover:bg-zinc-700 hover:text-white transition-colors"
                   >
                       {s.icon} {s.label}
                   </button>
               ))}
           </div>

           {/* Note Input */}
           <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Nội dung</label>
              <input 
                type="text" 
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="VD: Ăn trưa, Grab..."
              />
           </div>

           {/* AI Scan Button (Future Feature) */}
           <button 
             type="button"
             onClick={handleScanFeature}
             className="w-full py-3 border border-dashed border-zinc-700 rounded-lg flex items-center justify-center gap-2 text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
           >
               {isScanning ? (
                   <span className="w-4 h-4 border-2 border-zinc-500 border-t-emerald-500 rounded-full animate-spin"></span>
               ) : (
                   <Camera size={18} className="group-hover:scale-110 transition-transform" />
               )}
               <span className="text-sm font-medium">Scan Hóa Đơn (AI)</span>
           </button>

           {/* Submit */}
           <button 
             type="submit"
             className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] hover:bg-zinc-200"
           >
             <Check size={20} />
             Xác Nhận Chi Tiêu
           </button>
        </form>
      </div>
    </div>
  );
};
