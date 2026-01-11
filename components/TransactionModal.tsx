import React, { useState } from 'react';
import { X, Save, Calendar, Hash, DollarSign, FileText, Search, TrendingUp } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency } from '../services/dataService';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Transaction) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    symbol: '',
    type: TransactionType.BUY,
    quantity: '',
    price: '',
    notes: ''
  });

  // Common quick picks
  const SUGGESTED_SYMBOLS = ['TCB', 'MBB', 'HPG', 'CTR', 'VNDAF', 'DFIX'];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symbol || !formData.quantity || !formData.price) return;

    const newTx: Transaction = {
      id: Date.now().toString(),
      date: formData.date,
      symbol: formData.symbol.toUpperCase(), // Ensure uppercase
      type: formData.type,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
      notes: formData.notes
    };
    onSubmit(newTx);
    onClose();
    // Reset form
    setFormData({
       date: new Date().toISOString().split('T')[0],
       symbol: '',
       type: TransactionType.BUY,
       quantity: '',
       price: '',
       notes: ''
    });
  };

  const totalValue = (Number(formData.quantity) || 0) * (Number(formData.price) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
           <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
               <TrendingUp size={18} className="text-emerald-500" />
               Giao dịch Đầu tư
           </h3>
           <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
             <X size={20} />
           </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
           
           {/* Section 1: When & What Type */}
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                 <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Ngày giao dịch</label>
                 <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-3 text-zinc-500" />
                    <input 
                      type="date" 
                      required
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                 </div>
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Loại lệnh</label>
                 <div className="relative">
                   <select 
                     value={formData.type}
                     onChange={e => setFormData({...formData, type: e.target.value as TransactionType})}
                     className={`w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-3 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer ${
                         formData.type === TransactionType.BUY ? 'text-emerald-400' : 
                         formData.type === TransactionType.SELL ? 'text-rose-400' : 'text-sky-400'
                     }`}
                   >
                     <option value={TransactionType.BUY}>MUA (Buy)</option>
                     <option value={TransactionType.SELL}>BÁN (Sell)</option>
                     <option value={TransactionType.DIVIDEND}>NHẬN CỔ TỨC</option>
                   </select>
                   <div className="absolute right-3 top-3 pointer-events-none text-zinc-500 text-[10px]">▼</div>
                 </div>
              </div>
           </div>

           {/* Section 2: Asset Symbol (Input + Suggestions) */}
           <div className="space-y-2 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
              <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider flex justify-between">
                  <span>Mã Chứng khoán / Quỹ</span>
                  <span className="text-zinc-600 font-normal normal-case">Nhập mã mới để tạo mới</span>
              </label>
              <div className="relative">
                 <Search size={16} className="absolute left-3 top-3.5 text-zinc-500" />
                 <input 
                   type="text" 
                   required
                   value={formData.symbol}
                   onChange={e => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                   placeholder="VD: FPT, MWG, VCB..."
                   className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 pl-10 pr-3 text-lg font-bold text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder-zinc-700 uppercase"
                 />
              </div>
              
              {/* Quick Chips */}
              <div className="flex flex-wrap gap-2 mt-2">
                 {SUGGESTED_SYMBOLS.map(sym => (
                   <button
                     type="button"
                     key={sym}
                     onClick={() => setFormData({...formData, symbol: sym})}
                     className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${formData.symbol === sym ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'}`}
                   >
                     {sym}
                   </button>
                 ))}
              </div>
           </div>

           {/* Section 3: Values */}
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                 <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Số lượng</label>
                 <div className="relative">
                    <Hash size={14} className="absolute left-3 top-3 text-zinc-500" />
                    <input 
                      type="number" 
                      required
                      placeholder="0"
                      min="0"
                      step="any"
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                 </div>
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Giá khớp (VND)</label>
                 <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-3 text-zinc-500" />
                    <input 
                      type="number" 
                      required
                      placeholder="0"
                      min="0"
                      step="any"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                 </div>
              </div>
           </div>
           
           {/* Total Preview */}
           {totalValue > 0 && (
               <div className="flex justify-between items-center px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                   <span className="text-xs text-emerald-500">Tổng giá trị:</span>
                   <span className="text-sm font-bold text-emerald-400">{formatCurrency(totalValue)}</span>
               </div>
           )}

           {/* Notes */}
           <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Ghi chú (Tùy chọn)</label>
              <div className="relative">
                 <FileText size={14} className="absolute left-3 top-3 text-zinc-500" />
                 <input 
                   type="text" 
                   value={formData.notes}
                   onChange={e => setFormData({...formData, notes: e.target.value})}
                   className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder-zinc-700"
                   placeholder="VD: Tích sản tháng 10..."
                 />
              </div>
           </div>

           {/* Submit */}
           <button 
             type="submit"
             className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
           >
             <Save size={18} />
             Lưu Giao Dịch
           </button>
        </form>
      </div>
    </div>
  );
};