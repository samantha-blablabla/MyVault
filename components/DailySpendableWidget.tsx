import React, { useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../services/dataService';
import { Coffee, AlertCircle, CheckCircle2, CalendarDays, Calendar, Sun, Settings, AlertTriangle } from 'lucide-react';
import { BillManagerModal } from './BillManagerModal';

export const DailySpendableWidget: React.FC = () => {
  const { dailySpendable, fixedBills, updateBillStatus, spendingStats, isPrivacyMode } = useFinance();
  const [isBillManagerOpen, setIsBillManagerOpen] = useState(false);

  // Check if over budget
  const isOverBudget = dailySpendable < 0;

  const ManageButton = (
    <button 
      onClick={() => setIsBillManagerOpen(true)}
      className="text-zinc-500 hover:text-white transition-colors"
      title="Quản lý Hóa đơn"
    >
        <Settings size={14} />
    </button>
  );

  // Custom Title Component with conditional styling
  const TitleComponent = (
      <div className={`flex items-center gap-2 ${isOverBudget ? 'text-rose-400' : 'text-indigo-300'}`}>
          {isOverBudget ? <AlertTriangle size={18} /> : <Coffee size={18} />}
          <span>Hạn mức / ngày</span>
      </div>
  );

  return (
    <>
    <BillManagerModal isOpen={isBillManagerOpen} onClose={() => setIsBillManagerOpen(false)} />
    
    <GlassCard 
        title={TitleComponent}
        action={ManageButton}
        className={`h-full border-indigo-500/10 ${isOverBudget ? 'bg-gradient-to-br from-rose-950/50 to-zinc-900/60' : 'bg-gradient-to-br from-indigo-950/50 to-zinc-900/60'}`} 
    >
      <div className="flex flex-col h-full gap-4">
        
        {/* Top: Daily Allowance Value */}
        <div className="flex-none">
          <div>
            <span className={`text-3xl font-bold tracking-tight ${isOverBudget ? 'text-rose-500' : 'text-white'}`}>
              {isPrivacyMode ? '••••••' : formatCurrency(dailySpendable)}
            </span>
            <span className={`text-xs ml-1 font-medium ${isOverBudget ? 'text-rose-400' : 'text-zinc-400'}`}>
                {isOverBudget ? 'VƯỢT NGÂN SÁCH' : 'khả dụng'}
            </span>
          </div>
          {isOverBudget && (
              <p className="text-[10px] text-rose-400 mt-1">
                  Bạn đã tiêu quá đà hoặc hóa đơn quá cao. Hãy điều chỉnh lại chi tiêu!
              </p>
          )}
        </div>

        {/* Middle: Spending Stats Grid */}
        <div className="flex-none grid grid-cols-3 gap-2 bg-white/5 rounded-lg p-3 border border-white/5">
            <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-400 uppercase font-bold">
                    <Sun size={10} /> Hôm nay
                </div>
                <div className="text-sm font-bold text-white">
                    {isPrivacyMode ? '•••' : formatCurrency(spendingStats.day).replace('₫', '')}
                </div>
            </div>
            <div className="text-center space-y-1 border-l border-white/10">
                <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-400 uppercase font-bold">
                    <CalendarDays size={10} /> Tháng
                </div>
                <div className="text-sm font-bold text-white">
                    {isPrivacyMode ? '•••' : formatCurrency(spendingStats.month).replace('₫', '')}
                </div>
            </div>
            <div className="text-center space-y-1 border-l border-white/10">
                <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-400 uppercase font-bold">
                    <Calendar size={10} /> Năm
                </div>
                <div className="text-sm font-bold text-white">
                    {isPrivacyMode ? '•••' : formatCurrency(spendingStats.year).replace('₫', '')}
                </div>
            </div>
        </div>

        {/* Bottom: Mini Bill Tracker - Now Flexible to fill remaining height */}
        <div className="flex-1 min-h-0 flex flex-col border-t border-white/5 pt-3">
            <div className="flex-none text-[10px] text-zinc-500 uppercase font-bold tracking-wider flex justify-between items-center mb-2">
                <span>Hóa đơn cố định</span>
                <span className="text-[9px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">{fixedBills.length}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
                {fixedBills.length === 0 && <div className="text-xs text-zinc-600 italic">Chưa có hóa đơn</div>}
                {fixedBills.map(bill => (
                    <div key={bill.id} className="flex items-center justify-between group cursor-pointer" onClick={() => updateBillStatus(bill.id, !bill.isPaid)}>
                        <div className="flex items-center gap-2">
                            {bill.isPaid ? 
                                <CheckCircle2 size={14} className="text-emerald-500" /> : 
                                <AlertCircle size={14} className="text-rose-500" />
                            }
                            <span className={`text-xs font-medium ${bill.isPaid ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>{bill.name}</span>
                        </div>
                        <span className="text-xs font-bold text-zinc-500 group-hover:text-white transition-colors">
                            {isPrivacyMode ? '•••' : formatCurrency(bill.amount)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </GlassCard>
    </>
  );
};