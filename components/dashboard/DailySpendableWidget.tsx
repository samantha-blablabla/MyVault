import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/dataService';

import { Coffee, AlertCircle, CheckCircle2, CalendarDays, Calendar, Sun, Settings, AlertTriangle } from 'lucide-react';
import { BillManagerModal } from '../modals/BillManagerModal';


export const DailySpendableWidget: React.FC = () => {
    const { dailySpendable, fixedBills, updateBillStatus, spendingStats, isPrivacyMode } = useFinance();
    const [isBillManagerOpen, setIsBillManagerOpen] = useState(false);

    // Check if over budget
    const isOverBudget = dailySpendable < 0;

    const ManageButton = (
        <button
            onClick={() => setIsBillManagerOpen(true)}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            title="Quản lý Hóa đơn"
        >
            <Settings size={14} />
        </button>
    );

    // Custom Title Component with LIME ACCENT for Icon
    const TitleComponent = (
        <div className={`flex items-center gap-2 ${isOverBudget ? 'text-rose-500' : 'text-zinc-900 dark:text-white'}`}>
            <div className={`p-1.5 rounded-md border border-black dark:border-transparent flex items-center justify-center ${isOverBudget
                ? 'bg-rose-100 text-rose-600'
                : 'bg-primary text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-none'
                }`}>
                {isOverBudget ? <AlertTriangle size={14} /> : <Coffee size={14} strokeWidth={2.5} />}
            </div>
            <span className="uppercase tracking-wider font-bold text-xs">Hạn mức / ngày</span>
        </div>
    );

    return (
        <>
            <BillManagerModal isOpen={isBillManagerOpen} onClose={() => setIsBillManagerOpen(false)} />

            <GlassCard
                title={TitleComponent}
                action={ManageButton}
                className={`h-full ${isOverBudget
                    ? 'bg-rose-50 dark:bg-rose-900/10'
                    : 'bg-white dark:bg-zinc-900/50'
                    }`}
            >
                <div className="flex flex-col h-full gap-4">

                    {/* Top: Daily Allowance Value */}
                    <div className="flex-none">
                        <div className="flex items-baseline gap-2">
                            <span className={`text-3xl font-extrabold tracking-tight ${isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-white'}`}>
                                {isPrivacyMode ? '••••••' : formatCurrency(dailySpendable)}
                            </span>
                            {/* LIME BADGE FOR "AVAILABLE" */}
                            <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase border ${isOverBudget
                                ? 'bg-rose-500 text-white border-rose-600'
                                : 'bg-primary text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-none dark:border-transparent'
                                }`}>
                                {isOverBudget ? 'VƯỢT NGÂN SÁCH' : 'khả dụng'}
                            </span>
                        </div>
                        {isOverBudget && (
                            <p className="text-[10px] text-rose-500 mt-1 font-medium">
                                Bạn đã tiêu quá đà hoặc hóa đơn quá cao. Hãy điều chỉnh lại chi tiêu!
                            </p>
                        )}
                    </div>

                    {/* Middle: Spending Stats Grid */}
                    <div className="flex-none grid grid-cols-3 gap-2 bg-zinc-100 dark:bg-black/40 rounded-lg p-3 border border-zinc-200 dark:border-zinc-800">
                        <div className="text-center space-y-1">
                            <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-wider">
                                <Sun size={10} /> Hôm nay
                            </div>
                            <div className="text-sm font-bold text-zinc-900 dark:text-white">
                                {isPrivacyMode ? '•••' : formatCurrency(spendingStats.day).replace('₫', '')}
                            </div>
                        </div>
                        <div className="text-center space-y-1 border-l border-zinc-300 dark:border-zinc-700">
                            <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-wider">
                                <CalendarDays size={10} /> Tháng
                            </div>
                            <div className="text-sm font-bold text-zinc-900 dark:text-white">
                                {isPrivacyMode ? '•••' : formatCurrency(spendingStats.month).replace('₫', '')}
                            </div>
                        </div>
                        <div className="text-center space-y-1 border-l border-zinc-300 dark:border-zinc-700">
                            <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-wider">
                                <Calendar size={10} /> Năm
                            </div>
                            <div className="text-sm font-bold text-zinc-900 dark:text-white">
                                {isPrivacyMode ? '•••' : formatCurrency(spendingStats.year).replace('₫', '')}
                            </div>
                        </div>
                    </div>

                    {/* Bottom: Mini Bill Tracker */}
                    <div className="flex-1 min-h-0 flex flex-col border-t border-zinc-200 dark:border-zinc-800 pt-3">
                        <div className="flex-none text-[10px] font-bold text-zinc-400 mb-2 flex justify-between items-center">
                            <span>Hóa đơn sắp tới</span>
                            <span className="text-zinc-400 font-medium normal-case">{fixedBills.filter(b => !b.isPaid).length} chưa thanh toán</span>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
                            {fixedBills.length === 0 && <div className="text-center text-[10px] text-zinc-400 italic py-2">Không có hóa đơn</div>}
                            {fixedBills.sort((a, b) => a.dueDay - b.dueDay).map(bill => (
                                <div key={bill.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-black/20 border border-zinc-100 dark:border-zinc-800 group">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <button
                                            onClick={() => updateBillStatus(bill.id, !bill.isPaid)}
                                            className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${bill.isPaid ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-300 dark:border-zinc-600 hover:border-emerald-500'}`}
                                        >
                                            {bill.isPaid && <CheckCircle2 size={10} className="text-white" />}
                                        </button>
                                        <div className="min-w-0">
                                            <div className={`text-xs font-bold truncate ${bill.isPaid ? 'text-zinc-400 line-through' : 'text-zinc-900 dark:text-zinc-200'}`}>{bill.name}</div>
                                            <div className="text-[9px] text-zinc-500">Ngày {bill.dueDay} • {formatCurrency(bill.amount)}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </GlassCard>
        </>
    );
};