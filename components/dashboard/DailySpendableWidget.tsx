import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/dataService';
import { BillModal } from '../modals/BillModal';

import { Coffee, AlertCircle, CheckCircle2, CalendarDays, Calendar, Sun, AlertTriangle, Pencil, Trash2, Plus, TrendingDown, TrendingUp, Target } from 'lucide-react';


export const DailySpendableWidget: React.FC = () => {
    const { dailySpendable, fixedBills, updateBillStatus, spendingStats, isPrivacyMode, editBill, removeBill, addBill, budget } = useFinance();
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    const [editingBill, setEditingBill] = useState<any>(null);

    // Check if over budget
    const isOverBudget = dailySpendable < 0;

    const handleEditBill = (bill: any) => {
        setEditingBill(bill);
        setIsBillModalOpen(true);
    };

    const handleAddBill = () => {
        setEditingBill(null);
        setIsBillModalOpen(true);
    };

    const handleBillSubmit = (data: any) => {
        if (editingBill) {
            editBill(editingBill.id, data);
        } else {
            addBill(data.name, data.amount, data.dueDay);
        }
        setIsBillModalOpen(false);
    };

    // Stats Logic
    const needsBudget = budget.find(b => b.id === 'needs');
    const monthLimit = needsBudget?.allocated || 1;
    const monthPct = Math.min(100, (spendingStats.month / monthLimit) * 100);

    // Day Limit Estimate
    const dayLimitEst = spendingStats.day + dailySpendable;
    const dayPct = dayLimitEst > 0 ? (spendingStats.day / dayLimitEst) * 100 : 0;

    // Week Trend
    const weekTrend = spendingStats.lastWeek > 0
        ? ((spendingStats.week - spendingStats.lastWeek) / spendingStats.lastWeek) * 100
        : 0;
    const isTrendGood = weekTrend <= 0;

    // Custom Title Component with LIME ACCENT for Icon
    const TitleComponent = (
        <div className={`flex items-center gap-2 ${isOverBudget ? 'text-rose-500' : 'text-zinc-900 dark:text-white'}`}>
            <div className={`p-1.5 rounded-md border border-transparent flex items-center justify-center ${isOverBudget
                ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                : 'bg-primary text-white shadow-glow'
                }`}>
                {isOverBudget ? <AlertTriangle size={14} /> : <Coffee size={14} strokeWidth={2.5} />}
            </div>
            <span className="uppercase tracking-wider font-bold text-xs">Hạn mức / ngày</span>
        </div>
    );

    return (
        <>
            <GlassCard
                title={TitleComponent}
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
                                : 'bg-primary text-white border-transparent shadow-glow-sm'
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

                    {/* Middle: Smart Stats Grid */}
                    <div className="flex-none grid grid-cols-3 gap-2 bg-zinc-100 dark:bg-black/40 rounded-lg p-3 border border-zinc-200 dark:border-zinc-800">
                        {/* TODAY */}
                        <div className="text-center space-y-1">
                            <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-wider">
                                <Sun size={10} /> Hôm nay
                            </div>
                            <div className="text-sm font-bold text-zinc-900 dark:text-white">
                                {isPrivacyMode ? '•••' : formatCurrency(spendingStats.day).replace('₫', '')}
                            </div>
                            {!isPrivacyMode && (
                                <div className={`text-[9px] font-medium ${dayPct > 100 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {dayPct.toFixed(0)}% hạn mức
                                </div>
                            )}
                        </div>

                        {/* WEEK */}
                        <div className="text-center space-y-1 border-l border-zinc-300 dark:border-zinc-700">
                            <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-wider">
                                <TrendingUp size={10} /> Tuần này
                            </div>
                            <div className="text-sm font-bold text-zinc-900 dark:text-white">
                                {isPrivacyMode ? '•••' : formatCurrency(spendingStats.week).replace('₫', '')}
                            </div>
                            {!isPrivacyMode && (
                                <div className={`flex items-center justify-center gap-0.5 text-[9px] font-medium ${isTrendGood ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {isTrendGood ? <TrendingDown size={8} /> : <TrendingUp size={8} />}
                                    {Math.abs(weekTrend).toFixed(0)}%
                                </div>
                            )}
                        </div>

                        {/* MONTH */}
                        <div className="text-center space-y-1 border-l border-zinc-300 dark:border-zinc-700">
                            <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-wider">
                                <Target size={10} /> Tháng
                            </div>
                            <div className="text-sm font-bold text-zinc-900 dark:text-white">
                                {isPrivacyMode ? '•••' : formatCurrency(spendingStats.month).replace('₫', '')}
                            </div>
                            {!isPrivacyMode && (
                                <div className={`text-[9px] font-medium ${monthPct > 80 ? 'text-rose-500' : monthPct > 50 ? 'text-amber-500' : 'text-zinc-500'}`}>
                                    Dùng {monthPct.toFixed(0)}%
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom: Mini Bill Tracker */}
                    <div className="flex-1 min-h-0 flex flex-col border-t border-zinc-200 dark:border-zinc-800 pt-3">
                        <div className="flex-none text-[10px] font-bold text-zinc-400 mb-2 flex justify-between items-center">
                            <span>Hóa đơn sắp tới</span>
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-400 font-medium normal-case">{fixedBills.filter(b => !b.isPaid).length} chưa thanh toán</span>
                                <button onClick={handleAddBill} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-primary">
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
                            {fixedBills.length === 0 && <div className="text-center text-[10px] text-zinc-400 italic py-2">Không có hóa đơn</div>}
                            {fixedBills.sort((a, b) => a.dueDay - b.dueDay).map(bill => (
                                <div key={bill.id} className="group flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-black/20 border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                                    <div className="flex items-center gap-2 overflow-hidden flex-1">
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

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                                        <button
                                            onClick={() => handleEditBill(bill)}
                                            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                        >
                                            <Pencil size={12} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Xóa hóa đơn này?')) removeBill(bill.id)
                                            }}
                                            className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-900/30 text-zinc-400 hover:text-rose-500 transition-colors"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </GlassCard>

            <BillModal
                isOpen={isBillModalOpen}
                onClose={() => setIsBillModalOpen(false)}
                onSubmit={handleBillSubmit}
                initialData={editingBill}
            />
        </>
    );
};
