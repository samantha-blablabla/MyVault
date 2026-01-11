import React from 'react';
import { GlassCard } from './ui/GlassCard';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../services/dataService';
import { Coffee, AlertCircle, CheckCircle2 } from 'lucide-react';

export const DailySpendableWidget: React.FC = () => {
  const { dailySpendable, daysRemaining, fixedBills, updateBillStatus } = useFinance();

  return (
    <GlassCard className="h-full bg-gradient-to-br from-indigo-900/40 to-zinc-900/60">
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 mb-2">
            <Coffee size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Daily Spendable</span>
          </div>
          
          <div className="mt-2">
            <span className="text-3xl font-mono font-bold text-white shadow-glow">
              {formatCurrency(dailySpendable)}
            </span>
            <span className="text-xs text-zinc-400 ml-1">/ ngày</span>
          </div>
          
          <p className="text-xs text-zinc-500 mt-2">
            Bạn còn <span className="text-white font-bold">{daysRemaining} ngày</span> trong tháng.
            Con số này đã trừ các hóa đơn cố định chưa thanh toán.
          </p>
        </div>

        {/* Mini Bill Tracker */}
        <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
            <div className="text-[10px] text-zinc-500 uppercase font-semibold">Hóa đơn sắp tới</div>
            {fixedBills.map(bill => (
                <div key={bill.id} className="flex items-center justify-between group cursor-pointer" onClick={() => updateBillStatus(bill.id, !bill.isPaid)}>
                    <div className="flex items-center gap-2">
                        {bill.isPaid ? 
                            <CheckCircle2 size={14} className="text-emerald-500" /> : 
                            <AlertCircle size={14} className="text-rose-500" />
                        }
                        <span className={`text-xs ${bill.isPaid ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>{bill.name}</span>
                    </div>
                    <span className="text-xs font-mono text-zinc-400">{formatCurrency(bill.amount)}</span>
                </div>
            ))}
        </div>
      </div>
    </GlassCard>
  );
};
