import React, { useMemo, useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/dataService';
import { Transaction, TransactionType } from '../../types';

import { ArrowUpRight, ArrowDownLeft, History, Clock, Pencil, Trash2 } from 'lucide-react';
import { ExpenseModal } from '../modals/ExpenseModal';


export const RecentTransactions: React.FC = () => {
    const { transactions, isPrivacyMode, deleteTransaction, editTransaction } = useFinance();
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);

    // Filter only Income and Expense, sort by newest
    const history = useMemo(() => {
        return transactions
            .filter(t => t.type === TransactionType.EXPENSE || t.type === TransactionType.INCOME)
            .sort((a, b) => {
                const timeA = new Date(a.date).getTime();
                const timeB = new Date(b.date).getTime();
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

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) {
            deleteTransaction(id);
        }
    };

    const handleEditClick = (e: React.MouseEvent, tx: Transaction) => {
        e.stopPropagation();
        setEditingTx(tx);
    };

    const handleEditSubmit = (amount: number, note: string, type: TransactionType.EXPENSE | TransactionType.INCOME) => {
        if (editingTx) {
            editTransaction(editingTx.id, { amount, note, type });
            setEditingTx(null);
        }
    };

    return (
        <>
            {/* Edit Modal (Reusing ExpenseModal) */}
            <ExpenseModal
                isOpen={!!editingTx}
                onClose={() => setEditingTx(null)}
                onSubmit={handleEditSubmit}
                initialData={editingTx ? { amount: editingTx.price, note: editingTx.notes || '', type: editingTx.type } : undefined}
            />

            <GlassCard title="Lịch sử Thu / Chi" className="h-full min-h-[22rem]">
                <div className="flex flex-col h-full">

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                        {history.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-2 opacity-50">
                                <History size={32} />
                                <span className="text-xs uppercase tracking-wide">Chưa có giao dịch nào</span>
                            </div>
                        )}

                        {history.map(tx => {
                            const isIncome = tx.type === TransactionType.INCOME;
                            return (
                                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors group relative overflow-hidden">

                                    {/* Info Side */}
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isIncome
                                            ? 'bg-primary border-black text-black'
                                            : 'bg-rose-100 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400'
                                            }`}>
                                            {isIncome ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1 max-w-[120px] sm:max-w-[200px]">{tx.notes || (isIncome ? 'Thu nhập' : 'Chi tiêu')}</div>
                                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                                <Clock size={10} /> {formatDate(tx.date)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Value Side */}
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className={`font-bold font-mono text-sm ${isIncome ? 'text-black dark:text-white' : 'text-zinc-900 dark:text-zinc-300'}`}>
                                            {isIncome ? '+' : '-'}{isPrivacyMode ? '•••' : formatCurrency(tx.price)}
                                        </div>

                                        {/* Action Buttons (Visible on Hover/Focus) */}
                                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity pl-2 border-l border-zinc-200 dark:border-zinc-700">
                                            <button
                                                onClick={(e) => handleEditClick(e, tx)}
                                                className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
                                                title="Sửa"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(e, tx.id)}
                                                className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/10 rounded transition-colors"
                                                title="Xóa"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </GlassCard>
        </>
    );
};