import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { NetWorthCard } from '../dashboard/NetWorthCard';
import { DailySpendableWidget } from '../dashboard/DailySpendableWidget';
import { MonthlyPulse } from '../dashboard/MonthlyPulse';
import { RecentActivityWidget } from '../dashboard/RecentActivityWidget';
import { Plus } from 'lucide-react';


import { Transaction } from '../../types';

interface OverviewViewProps {
    onOpenIncome?: () => void;
    onOpenExpense?: () => void;
    onEditTransaction?: (tx: Transaction) => void;
    onViewHistory?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onOpenIncome, onOpenExpense, onEditTransaction, onViewHistory }) => {
    const { user } = useFinance();

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header / Greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                        Xin chào, {user.name}
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                        Tổng quan tài chính hôm nay.
                    </p>
                </div>

                {/* Main Action Button */}
                <button
                    onClick={onOpenExpense}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={20} strokeWidth={3} />
                    <span>Thêm Giao Dịch</span>
                </button>
            </div>

            {/* 1. Monthly Pulse (New) - Quick Health Check */}
            <MonthlyPulse onOpenIncome={onOpenIncome} onOpenExpense={onOpenExpense} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT COLUMN (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Net Worth (Updated with Sparkline if implemented inside) */}
                    <NetWorthCard />

                    {/* Alerts Placeholder (Moved here) */}
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-bold flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        Bạn đang đi đúng hướng với kế hoạch tiết kiệm tháng này!
                    </div>

                    {/* Recent Activity (New) */}
                    <RecentActivityWidget onEditTransaction={onEditTransaction} onViewHistory={onViewHistory} />
                </div>

                {/* RIGHT COLUMN (1/3) */}
                <div className="space-y-6">
                    {/* Daily Spendable */}
                    <DailySpendableWidget />
                </div>
            </div>
        </div>
    );
};
