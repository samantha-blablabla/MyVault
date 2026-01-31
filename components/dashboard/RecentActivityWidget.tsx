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
                    <div className="text-center py-8 text-zinc-400 text-sm">
                        Chưa có giao dịch nào
                    </div>
                )}
            </div>
        </div>
    );
};
