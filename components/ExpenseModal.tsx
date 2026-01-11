import React, { useState, useEffect } from 'react';
import { X, Check, Camera, Coffee, CreditCard, ShoppingBag, ArrowUpCircle, ArrowDownCircle, Gift, Banknote, Sparkles } from 'lucide-react';
import { formatCurrency } from '../services/dataService';
import { TransactionType } from '../types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, note: string, type: TransactionType.EXPENSE | TransactionType.INCOME) => void;
  initialData?: {
      amount: number;
      note: string;
      type: TransactionType;
  };
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<TransactionType.EXPENSE | TransactionType.INCOME>(TransactionType.EXPENSE);
  const [isScanning, setIsScanning] = useState(false);

  // Populate data when opening in edit mode
  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setAmount(initialData.amount.toString());
            setNote(initialData.note);
            // Ensure type is cast correctly to only supported types here
            setType(initialData.type === TransactionType.INCOME ? TransactionType.INCOME : TransactionType.EXPENSE);
        } else {
            setAmount('');
            setNote('');
            setType(TransactionType.EXPENSE);
        }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    onSubmit(Number(amount), note, type);
    onClose();
    // Only reset if not editing (though onClose handles unmount/hide)
    if (!initialData) {
        setAmount('');
        setNote('');
        setType(TransactionType.EXPENSE);
    }
  };

  const handleScanFeature = () => {
      // Simulation of AI OCR Process
      setIsScanning(true);
      setTimeout(() => {
          setIsScanning(false);
          // Dummy data extraction
          setAmount('125000');
          setNote('Hóa đơn Highlands Coffee (Scan)');
          setType(TransactionType.EXPENSE);
      }, 2000);
  }

  // Configuration based on Type
  const isExpense = type === TransactionType.EXPENSE;
  
  const suggestions = isExpense ? [
      { icon: <Coffee size={14} />, label: 'Cà phê', value: 35000 },
      { icon: <ShoppingBag size={14} />, label: 'Siêu thị', value: 500000 },
      { icon: <CreditCard size={14} />, label: 'Xăng xe', value: 80000 },
  ] : [
      { icon: <Gift size={14} />, label: 'Được tặng', value: 500000 },
      { icon: <Banknote size={14} />, label: 'Thưởng nóng', value: 1000000 },
      { icon: <ArrowDownCircle size={14} />, label: 'Hoàn tiền', value: 50000 },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full md:max-w-md bg-zinc-900 border-t md:border border-zinc-800 rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden animate-slide-up relative">
        
        {/* Loading Overlay for Scanning */}
        {isScanning && (
            <div className="absolute inset-0 z-50 bg-zinc-950/90 flex flex-col items-center justify-center text-center p-6 animate-fade-in">
                <div className="w-16 h-16 relative mb-4">
                    <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 animate-pulse" size={24} />
                </div>
                <h3 className="text-white font-bold text-lg">Đang phân tích hóa đơn...</h3>
                <p className="text-zinc-500 text-sm mt-1">Sử dụng AI để trích xuất số tiền & nội dung</p>
            </div>
        )}

        {/* Header with Toggle */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
           <div className="flex gap-2 p-1 bg-black/20 rounded-lg border border-white/5">
                <button 
                    onClick={() => setType(TransactionType.EXPENSE)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${isExpense ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <ArrowUpCircle size={14} /> Chi Tiêu
                </button>
                <button 
                    onClick={() => setType(TransactionType.INCOME)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${!isExpense ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <ArrowDownCircle size={14} /> Thu Nhập
                </button>
           </div>
           
           <div className="flex items-center gap-1">
               {/* Scan Button */}
               <button 
                 onClick={handleScanFeature}
                 type="button"
                 className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-colors relative group"
                 title="Scan Hóa Đơn (AI)"
               >
                   <Camera size={20} />
                   <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                   </span>
               </button>

               <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
                 <X size={20} />
               </button>
           </div>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
           
           {/* Big Amount Input - FONT UPDATED to sans-serif */}
           <div className="text-center relative">
               <label className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-2 block">
                   Số tiền {isExpense ? '(Chi ra)' : '(Nhận vào)'}
               </label>
               <input 
                 type="number" 
                 autoFocus
                 required
                 placeholder="0"
                 value={amount}
                 onChange={e => setAmount(e.target.value)}
                 className={`w-full bg-transparent text-5xl font-bold text-center focus:outline-none placeholder-zinc-800 ${isExpense ? 'text-rose-500' : 'text-emerald-500'}`}
               />
               <div className={`text-sm mt-2 font-bold h-5 ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                   {amount ? (isExpense ? '-' : '+') : ''} {amount ? formatCurrency(Number(amount)) : ''}
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
                placeholder={isExpense ? "VD: Ăn trưa, Grab..." : "VD: Anh A trả nợ, Thưởng..."}
              />
           </div>

           {/* Submit */}
           <button 
             type="submit"
             className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${
                 isExpense 
                 ? 'bg-white text-black hover:bg-zinc-200' 
                 : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-900/20'
             }`}
           >
             <Check size={20} />
             {initialData ? 'Lưu Thay Đổi' : (isExpense ? 'Xác Nhận Chi Tiêu' : 'Xác Nhận Thu Nhập')}
           </button>
        </form>
      </div>
    </div>
  );
};