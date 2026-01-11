import React from 'react';
import { GlassCard } from './ui/GlassCard';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../services/dataService';
import { Coffee, AlertCircle, CheckCircle2, CalendarDays, Calendar, Sun } from 'lucide-react';

export const DailySpendableWidget: React.FC = () => {
  const { dailySpendable, daysRemaining, fixedBills, updateBillStatus, spendingStats, isPrivacyMode } = useFinance();

  return (
    <GlassCard className="h-full bg-gradient-to-br from-indigo-950/50 to-zinc-900/60 border-indigo-500/10">
      <div className="flex flex-col h-full gap-4">
        
        {/* Top: Daily Allowance */}
        <div>
          <div className="flex items-center gap-2 text-indigo-300 mb-2">
            <Coffee size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Hạn mức / ngày</span>
          </div>
          
          <div>
            <span className="text-3xl font-bold text-white tracking-tight">
              {isPrivacyMode ? '••••••' : formatCurrency(dailySpendable)}
            </span>
            <span className="text-xs text-zinc-400 ml-1 font-medium">khả dụng</span>
          </div>
        </div>

        {/* Middle: Spending Stats Grid */}
        <div className="grid grid-cols-3 gap-2 bg-white/5 rounded-lg p-3 border border-white/5">
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

        {/* Bottom: Mini Bill Tracker */}
        <div className="flex-1 flex flex-col justify-end">
            <div className="pt-3 border-t border-white/5 space-y-2">
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Hóa đơn sắp tới</div>
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
  );
};