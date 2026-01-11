import React, { useState } from 'react';
import { X, Save, Calendar, Hash, DollarSign, FileText } from 'lucide-react';
import { Transaction, TransactionType } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Transaction) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    symbol: 'TCB',
    type: TransactionType.BUY,
    quantity: '',
    price: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTx: Transaction = {
      id: Date.now().toString(),
      date: formData.date,
      symbol: formData.symbol,
      type: formData.type,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
      notes: formData.notes
    };
    onSubmit(newTx);
    onClose();
    // Reset form for next use
    setFormData({
       date: new Date().toISOString().split('T')[0],
       symbol: 'TCB',
       type: TransactionType.BUY,
       quantity: '',
       price: '',
       notes: ''
    });
  };

  const SYMBOLS = ['TCB', 'MBB', 'HPG', 'CTR', 'VNDAF', 'DFIX'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
           <h3 className="text-lg font-bold text-white tracking-wide">Thêm Giao dịch Mới</h3>
           <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
             <X size={20} />
           </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           {/* Date & Type */}
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                 <label className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Ngày GD</label>
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
                 <label className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Loại GD</label>
                 <div className="relative">
                   <select 
                     value={formData.type}
                     onChange={e => setFormData({...formData, type: e.target.value as TransactionType})}
                     className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
                   >
                     <option value={TransactionType.BUY}>MUA (Buy)</option>
                     <option value={TransactionType.SELL}>BÁN (Sell)</option>
                     <option value={TransactionType.DIVIDEND}>CỔ TỨC (Dividend)</option>
                   </select>
                   <div className="absolute right-3 top-3 pointer-events-none text-zinc-500 text-[10px]">▼</div>
                 </div>
              </div>
           </div>

           {/* Symbol Selector */}
           <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Mã CK / Quỹ</label>
              <div className="flex gap-2 flex-wrap">
                 {SYMBOLS.map(sym => (
                   <button
                     type="button"
                     key={sym}
                     onClick={() => setFormData({...formData, symbol: sym})}
                     className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all ${formData.symbol === sym ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'}`}
                   >
                     {sym}
                   </button>
                 ))}
              </div>
           </div>

           {/* Qty & Price */}
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                 <label className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Số lượng</label>
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
                 <label className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Giá / CP (VND)</label>
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

           {/* Notes */}
           <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Ghi chú (Tùy chọn)</label>
              <div className="relative">
                 <FileText size={14} className="absolute left-3 top-3 text-zinc-500" />
                 <input 
                   type="text" 
                   value={formData.notes}
                   onChange={e => setFormData({...formData, notes: e.target.value})}
                   className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder-zinc-700"
                   placeholder="VD: Mua tích sản tháng 10..."
                 />
              </div>
           </div>

           {/* Submit */}
           <button 
             type="submit"
             className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
           >
             <Save size={18} />
             Lưu Giao Dịch
           </button>
        </form>
      </div>
    </div>
  );
};