import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { useFinance } from '../../context/FinanceContext';
import { Plus, Target, PiggyBank, CreditCard, MoreVertical, Edit2, Trash2, Calendar, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { FinancialGoal } from '../../types';
import { formatCurrency } from '../../services/dataService';
import { GoalModal } from '../modals/GoalModal';

export const FinancialGoalsDashboard: React.FC = () => {
    const { goals, deleteGoal } = useFinance();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);

    const handleEdit = (goal: FinancialGoal) => {
        setEditingGoal(goal);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa mục tiêu này?')) {
            deleteGoal(id);
        }
    };

    const handleAddNew = () => {
        setEditingGoal(null);
        setIsModalOpen(true);
    };

    // Calculate Status Logic (Simplified for Stress-Free Mode)
    const getGoalStatus = (goal: FinancialGoal) => {
        const remaining = goal.targetAmount - goal.currentAmount;
        if (remaining <= 0) return { label: 'Đã hoàn thành', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };

        const monthly = goal.monthlyContribution;
        if (monthly <= 0) return { label: 'Đang tạm dừng', color: 'text-zinc-500', bg: 'bg-zinc-100 dark:bg-zinc-800' };

        const monthsLeft = Math.ceil(remaining / monthly);
        const date = new Date();
        date.setMonth(date.getMonth() + monthsLeft);
        const dateString = `Dự kiến: ${date.getMonth() + 1}/${date.getFullYear()}`;

        return { label: dateString, color: 'text-indigo-500', bg: 'bg-indigo-500/10' };
    };

    const getIcon = (type: FinancialGoal['type']) => {
        switch (type) {
            case 'SAVINGS': return <PiggyBank size={20} className="text-emerald-500" />;
            case 'DEBT': return <CreditCard size={20} className="text-rose-500" />;
            default: return <Target size={20} className="text-indigo-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <GoalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                goalToEdit={editingGoal}
            />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Danh sách Mục tiêu</h2>
                    <p className="text-sm text-zinc-500">Quản lý lộ trình tài chính của bạn.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-bold shadow-lg hover:scale-105 transition-transform"
                >
                    <Plus size={18} /> Thêm Mục tiêu
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map(goal => {
                    const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                    const status = getGoalStatus(goal);

                    return (
                        <GlassCard key={goal.id} className="relative group hover:border-indigo-500/30 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                        {getIcon(goal.type)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-zinc-900 dark:text-white text-lg">{goal.name}</h3>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                        <div className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                                            <Calendar size={12} />
                                            {status.label === 'Đã hoàn thành' ? 'Hoàn tất' : status.label.replace('Dự kiến: ', 'Đích đến: ')}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(goal)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-indigo-500">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(goal.id)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-rose-500">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                    <span>Tiến độ</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${goal.type === 'DEBT' ? 'bg-rose-500' :
                                            goal.type === 'SAVINGS' ? 'bg-emerald-500' : 'bg-indigo-500'
                                            }`}
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs font-bold mt-1">
                                    <span className="text-zinc-900 dark:text-white">{formatCurrency(goal.currentAmount)}</span>
                                    <span className="text-zinc-500"> / {formatCurrency(goal.targetAmount)}</span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                                <span className="text-zinc-500">Tích lũy tháng</span>
                                <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                                    <TrendingUp size={14} className="text-emerald-500" />
                                    {formatCurrency(goal.monthlyContribution)}
                                </span>
                            </div>
                        </GlassCard>
                    );
                })}

                {goals.length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center opacity-50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                        <Target size={48} className="mb-4 text-zinc-400" />
                        <h3 className="font-bold text-zinc-500">Chưa có mục tiêu nào</h3>
                        <p className="text-sm text-zinc-400 max-w-xs mt-1">Hãy thêm mục tiêu để bắt đầu hành trình tự do tài chính.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
