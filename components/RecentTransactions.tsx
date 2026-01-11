import React, { useMemo } from 'react';
import { GlassCard } from './ui/GlassCard';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../services/dataService';
import { TransactionType } from '../types';
import { ArrowUpRight, ArrowDownLeft, History, Clock } from 'lucide-react';

export const RecentTransactions: React.FC = () => {
  const { transactions, isPrivacyMode } = useFinance();

  // Filter only Income and Expense, sort by newest
  const history = useMemo(() => {
    return transactions
        .filter(t => t.type === TransactionType.EXPENSE || t.type === TransactionType.INCOME)
        .sort((a, b) => {
            // Since ID contains timestamp for new items, or we can use date
            // For robustness, lets try to parse date or ID
            const timeA = new Date(a.date).getTime();
            const timeB = new Date(b.date).getTime();
            // If dates are equal (same day), fall back to ID if it's numeric/timestamp based
            if (timeA === timeB) {
                 return b.id > a.id ? 1 : -1;
            }
            return timeB - timeA;
        });
  }, [transactions]);

  const formatDate = (isoString: string) => {
      const date = new Date(isoString);
      const today = new Date();
      if (date.toDateString() === today.toDateString()) {
          return 'Hôm nay';
      }
      return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <GlassCard title="Lịch sử Thu / Chi" className="h-full min-h-[22rem]">
       <div className="flex flex-col h-full">
           
           <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
               {history.length === 0 && (
                   <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2 opacity-50">
                       <History size={32} />
                       <span className="text-xs">Chưa có giao dịch nào</span>
                   </div>
               )}

               {history.map(tx => {
                   const isIncome = tx.type === TransactionType.INCOME;
                   return (
                       <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-white/5 hover:bg-zinc-800/60 transition-colors group">
                           <div className="flex items-center gap-3">
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isIncome ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-rose-500/10 border-rose-500/30 text-rose-500'}`}>
                                   {isIncome ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                               </div>
                               <div>
                                   <div className="text-sm font-medium text-white line-clamp-1">{tx.notes || (isIncome ? 'Thu nhập' : 'Chi tiêu')}</div>
                                   <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                                       <Clock size={10} /> {formatDate(tx.date)}
                                   </div>
                               </div>
                           </div>
                           <div className={`font-bold font-mono text-sm ${isIncome ? 'text-emerald-400' : 'text-white'}`}>
                               {isIncome ? '+' : '-'}{isPrivacyMode ? '•••' : formatCurrency(tx.price)}
                           </div>
                       </div>
                   )
               })}
           </div>
       </div>
    </GlassCard>
  );
};