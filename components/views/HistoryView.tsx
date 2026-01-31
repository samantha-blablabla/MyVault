import React from 'react';
import { RecentTransactions } from '../dashboard/RecentTransactions';
import { BudgetOverview } from '../dashboard/BudgetOverview';
import { useFinance } from '../../context/FinanceContext';

export const HistoryView: React.FC = () => {
    const { budget } = useFinance();

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                    Lịch sử & Ngân sách
                </h1>
            </div>

            {/* Budget Progress Bars */}
            <div className="mb-8">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase mb-3">Tình hình ngân sách tháng này</h3>
                <BudgetOverview budgets={budget} />
            </div>

            {/* Transactions List */}
            <div className="min-h-[500px]">
                <RecentTransactions />
            </div>
        </div>
    );
};
