import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Receipt } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../services/dataService';

interface BillManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BillManagerModal: React.FC<BillManagerModalProps> = ({ isOpen, onClose }) => {
  const { fixedBills, updateBillAmount, addBill, removeBill } = useFinance();
  
  // State for new bill
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDay, setNewDay] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if(newName && newAmount && newDay) {
          addBill(newName, Number(newAmount), Number(newDay));
          setNewName('');
          setNewAmount('');
          setNewDay('');
      }
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
        
        <div className="p-6 space-y-6">
           <p className="text-xs text-zinc-500">
               Cập nhật các khoản chi cố định. Hệ thống sẽ trừ các khoản này khỏi ngân sách trước khi tính toán số tiền khả dụng hàng ngày.
           </p>

           {/* List Existing Bills */}
           <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
               {fixedBills.length === 0 && <div className="text-center text-zinc-600 text-sm py-4">Chưa có hóa đơn nào</div>}
               {fixedBills.map(bill => (
                   <div key={bill.id} className="flex items-center justify-between bg-zinc-950 p-3 rounded-lg border border-zinc-800 group">
                       <div className="flex-1">
                           <div className="text-sm font-bold text-white">{bill.name}</div>
                           <div className="text-[10px] text-zinc-500">Ngày thanh toán: {bill.dueDay} hàng tháng</div>
                       </div>
                       <div className="flex items-center gap-3">
                           <input 
                             type="number"
                             value={bill.amount}
                             onChange={(e) => updateBillAmount(bill.id, Number(e.target.value))}
                             className="w-24 bg-transparent text-right font-bold text-white focus:outline-none border-b border-zinc-800 focus:border-emerald-500 py-1 text-sm"
                           />
                           <button 
                             onClick={() => removeBill(bill.id)}
                             className="text-zinc-600 hover:text-rose-500 transition-colors p-1"
                             title="Xóa"
                           >
                               <Trash2 size={16} />
                           </button>
                       </div>
                   </div>
               ))}
           </div>

           {/* Add New Bill */}
           <div className="pt-4 border-t border-zinc-800">
               <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Thêm hóa đơn mới</div>
               <form onSubmit={handleAdd} className="flex flex-col gap-3">
                   <div className="flex gap-2">
                       <input 
                         placeholder="Tên (VD: Netflix)" 
                         value={newName}
                         onChange={e => setNewName(e.target.value)}
                         className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                         required
                       />
                       <input 
                         placeholder="Ngày (1-31)" 
                         type="number"
                         min="1" max="31"
                         value={newDay}
                         onChange={e => setNewDay(e.target.value)}
                         className="w-20 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                         required
                       />
                   </div>
                   <div className="flex gap-2">
                        <input 
                            placeholder="Số tiền (VND)" 
                            type="number"
                            value={newAmount}
                            onChange={e => setNewAmount(e.target.value)}
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                            required
                        />
                        <button 
                            type="submit"
                            className="px-4 bg-zinc-800 hover:bg-emerald-600 text-white rounded flex items-center justify-center transition-colors"
                        >
                            <Plus size={18} />
                        </button>
                   </div>
               </form>
           </div>
        </div>
      </div>
    </div>
  );
};