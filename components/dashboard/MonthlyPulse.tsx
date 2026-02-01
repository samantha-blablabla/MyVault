import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { TransactionType } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { ArrowDownAZ, ArrowUpAZ, PiggyBank, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from '../../services/dataService';

export const MonthlyPulse: React.FC = () => {
    const { budget, transactions, isPrivacyMode } = useFinance();

    // Calculate Monthly Stats
    const stats = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Filter transactions for this month
        const monthlyTx = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const income = monthlyTx
            .filter(t => t.type === TransactionType.INCOME)
            .reduce((sum, t) => sum + t.price, 0);

        const expenses = monthlyTx
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((sum, t) => sum + t.price, 0);

        // Budget Cap (Sum of all category allocations)
        const totalBudget = budget.reduce((sum, b) => sum + b.allocated, 0);

        // Estimated Savings (Total Income - Total Expenses)
        // Or (Allocated Savings + Unspent Discretionary)? 
        // Let's use simple Cashflow: Income - Expense
        const cashflow = income - expenses;

        return { income, expenses, cashflow, totalBudget };
    }, [transactions, budget]);

    // Hardcoded Income for Demo if 0 (since we don't have income tx logic fully separate usually)
    // Actually FinanceContext might not have explicit income transactions yet, usually 'budget' implies allocated income.
    // Let's rely on constants.TOTAL_INCOME if stats.income is 0 for better UI visualization
    // Use actual income stats
    const displayIncome = stats.income;
    const savings = displayIncome - stats.expenses;
    const savingsRate = Math.round((savings / displayIncome) * 100);

    return (
        <div className="grid grid-cols-3 gap-3 md:gap-4">
            {/* Income */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 shadow-sm flex flex-col justify-between group hover:border-emerald-500/20 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        <TrendingUp size={16} strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-bold text-zinc-500 uppercase">Thu nhập</span>
                </div>
                <div>
                    <div className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                        {isPrivacyMode ? '••••••' : formatCurrency(displayIncome)}
                    </div>
                </div>
            </div>

            {/* Expense */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 shadow-sm flex flex-col justify-between group hover:border-rose-500/20 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
                        <TrendingDown size={16} strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-bold text-zinc-500 uppercase">Chi tiêu</span>
                </div>
                <div>
                    <div className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                        {isPrivacyMode ? '••••••' : formatCurrency(stats.expenses)}
                    </div>
                </div>
            </div>

            {/* Savings */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 shadow-sm flex flex-col justify-between group hover:border-primary/20 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <PiggyBank size={16} strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-bold text-zinc-500 uppercase">Dư</span>
                </div>
                <div>
                    <div className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                        {isPrivacyMode ? '••••••' : formatCurrency(savings)}
                    </div>
                </div>
            </div>
        </div>
    );
};
