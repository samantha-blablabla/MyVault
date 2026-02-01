import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../services/dataService';
import { ArrowUpRight, ArrowDownLeft, Store, Coffee, ShoppingCart } from 'lucide-react';

export const RecentActivityWidget: React.FC = () => {
    const { transactions, isPrivacyMode } = useFinance();
    const recentTx = transactions.slice(0, 4); // Show list of 4

    // Helper for category icon (simplified)
    const getIcon = (category: string) => {
        // Simple mapping, can be expanded
        if (category === 'Food') return Coffee;
        if (category === 'Shopping') return ShoppingCart;
        return Store;
    };

    return (
        <div className="w-full">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center justify-between">
                <span>Hoạt động gần đây</span>
                <span className="text-xs font-semibold text-primary cursor-pointer hover:underline">Xem tất cả</span>
            </h3>

            <div className="space-y-3">
                {recentTx.map((tx) => {
                    const Icon = getIcon(tx.category);
                    const isExpense = tx.amount < 0;
                    return (
                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-100 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isExpense
                                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                                    : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600'
                                    }`}>
                                    <Icon size={18} strokeWidth={2} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-200">{tx.description}</div>
                                    <div className="text-[10px] font-medium text-zinc-400">{formatDate(tx.date)}</div>
                                </div>
                            </div>

                            <div className={`font-bold text-sm ${isExpense ? 'text-zinc-900 dark:text-white' : 'text-emerald-500'}`}>
                                {isPrivacyMode ? '••••••' : formatCurrency(Math.abs(tx.amount))}
                            </div>
                        </div>
                    );
                })}

                {recentTx.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-2xl bg-zinc-50/50 dark:bg-white/5">
                        <div className="p-3 rounded-full bg-zinc-200 dark:bg-white/10 mb-3 text-zinc-400 dark:text-white/40">
                            <Store size={24} strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">Chưa có giao dịch</p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">Các giao dịch mới sẽ xuất hiện tại đây</p>
                    </div>
                )}
            </div>
        </div>
    );
};
