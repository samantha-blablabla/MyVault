import React, { useState } from 'react';
import { X, Plus, Trash2, Receipt, Home, Zap, Wifi, PlayCircle, Shield, CreditCard, Circle, Calendar } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../services/dataService';
import { FixedBill } from '../types';

interface BillManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { id: FixedBill['category'], label: string, icon: any, color: string, bg: string }[] = [
  { id: 'housing', label: 'Nhà cửa', icon: Home, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { id: 'utilities', label: 'Điện nước', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { id: 'internet', label: 'Internet', icon: Wifi, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  { id: 'subscription', label: 'Dịch vụ', icon: PlayCircle, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
  { id: 'insurance', label: 'Bảo hiểm', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { id: 'debt', label: 'Trả góp', icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { id: 'other', label: 'Khác', icon: Circle, color: 'text-zinc-400', bg: 'bg-zinc-800 border-zinc-700' },
];

export const BillManagerModal: React.FC<BillManagerModalProps> = ({ isOpen, onClose }) => {
  const { fixedBills, updateBillAmount, addBill, removeBill } = useFinance();
  
  // State for new bill
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDay, setNewDay] = useState('');
  const [selectedCat, setSelectedCat] = useState<FixedBill['category']>('other');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if(newName && newAmount && newDay) {
          addBill(newName, Number(newAmount), Number(newDay), selectedCat);
          setNewName('');
          setNewAmount('');
          setNewDay('');
          setSelectedCat('other');
      }
  };

  const getCategoryConfig = (id?: string) => {
      return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
           <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
               <Receipt size={18} className="text-emerald-500"/> Quản lý Hóa đơn
           </h3>
           <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
             <X size={20} />
           </button>
        </div>
        
        <div className="p-6">
           <p className="text-xs text-zinc-500 mb-4">
               Các khoản này được trừ tự động khỏi ngân sách "Thiết yếu" trước khi tính tiền tiêu hàng ngày.
           </p>

           {/* List Existing Bills */}
           <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar mb-6">
               {fixedBills.length === 0 && <div className="text-center text-zinc-600 text-sm py-8 border border-dashed border-zinc-800 rounded-xl">Chưa có hóa đơn nào</div>}
               {fixedBills.map(bill => {
                   const config = getCategoryConfig(bill.category);
                   const Icon = config.icon;
                   return (
                       <div key={bill.id} className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors group">
                           <div className="flex items-center gap-3 overflow-hidden">
                               {/* Icon Box */}
                               <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center border ${config.bg}`}>
                                   <Icon size={18} className={config.color} />
                               </div>
                               
                               <div className="min-w-0">
                                   <div className="text-sm font-bold text-white truncate">{bill.name}</div>
                                   <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                                       <Calendar size={10} /> Ngày {bill.dueDay}
                                   </div>
                               </div>
                           </div>
                           
                           <div className="flex items-center gap-2 flex-shrink-0">
                               <input 
                                 type="number"
                                 value={bill.amount}
                                 onChange={(e) => updateBillAmount(bill.id, Number(e.target.value))}
                                 className="w-20 bg-transparent text-right font-bold text-white focus:outline-none border-b border-zinc-800 focus:border-emerald-500 py-1 text-sm transition-colors"
                               />
                               <button 
                                 onClick={() => removeBill(bill.id)}
                                 className="text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition-all"
                                 title="Xóa"
                               >
                                   <Trash2 size={16} />
                               </button>
                           </div>
                       </div>
                   );
               })}
           </div>

           {/* Add New Bill (Compact UI) */}
           <div className="pt-4 border-t border-zinc-800">
               <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3">Thêm hóa đơn mới</div>
               
               <form onSubmit={handleAdd} className="space-y-3">
                   {/* 1. Category Selector (Horizontal Scroll) */}
                   <div className="flex gap-2 overflow-x-auto pb-2 snap-x custom-scrollbar">
                       {CATEGORIES.map(cat => (
                           <button
                             key={cat.id}
                             type="button"
                             onClick={() => setSelectedCat(cat.id)}
                             className={`flex-shrink-0 snap-start flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
                                 selectedCat === cat.id 
                                 ? 'bg-white text-black border-white' 
                                 : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:bg-zinc-800'
                             }`}
                           >
                               <cat.icon size={14} />
                               {cat.label}
                           </button>
                       ))}
                   </div>

                   {/* 2. Compact Inputs */}
                   <div className="flex flex-col gap-2">
                       {/* Row 1: Name */}
                       <input 
                           placeholder="Tên hóa đơn (VD: Netflix, Tiền nhà)" 
                           value={newName}
                           onChange={e => setNewName(e.target.value)}
                           className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                           required
                       />
                       
                       {/* Row 2: Day, Amount, Add */}
                       <div className="flex gap-2">
                           <div className="relative w-20">
                               <input 
                                   placeholder="Ngày" 
                                   type="number"
                                   min="1" max="31"
                                   value={newDay}
                                   onChange={e => setNewDay(e.target.value)}
                                   className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-3 pr-1 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 text-center"
                                   required
                               />
                               <span className="absolute right-2 top-3 text-[10px] text-zinc-600 pointer-events-none">/th</span>
                           </div>
                           
                           <input 
                               placeholder="Số tiền (VND)" 
                               type="number"
                               value={newAmount}
                               onChange={e => setNewAmount(e.target.value)}
                               className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                               required
                           />
                           
                           <button 
                               type="submit"
                               className="px-4 bg-white text-black hover:bg-emerald-400 hover:text-white rounded-lg flex items-center justify-center transition-all shadow-lg active:scale-95"
                           >
                               <Plus size={20} />
                           </button>
                       </div>
                   </div>
               </form>
           </div>
        </div>
      </div>
    </div>
  );
};