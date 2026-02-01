import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Calendar, Target, Wallet, CreditCard } from 'lucide-react';
import { FinancialGoal } from '../../types';
import { useFinance } from '../../context/FinanceContext';

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    goalToEdit?: FinancialGoal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, goalToEdit }) => {
    const { addGoal, updateGoal } = useFinance();

    const [name, setName] = useState('');
    const [type, setType] = useState<FinancialGoal['type']>('ASSET');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const [monthlyContribution, setMonthlyContribution] = useState('');
    const [priority, setPriority] = useState<FinancialGoal['priority']>('MEDIUM');

    useEffect(() => {
        if (goalToEdit) {
            setName(goalToEdit.name);
            setType(goalToEdit.type);
            setTargetAmount(goalToEdit.targetAmount.toString());
            setCurrentAmount(goalToEdit.currentAmount.toString());
            setMonthlyContribution(goalToEdit.monthlyContribution.toString());
            setPriority(goalToEdit.priority);
        } else {
            // Reset
            setName('');
            setType('ASSET');
            setTargetAmount('');
            setCurrentAmount('');
            setMonthlyContribution('');
            setPriority('MEDIUM');
        }
    }, [goalToEdit, isOpen]);

    // Calculate Estimated Deadline
    const estimatedMonths = React.useMemo(() => {
        const target = Number(targetAmount) || 0;
        const current = Number(currentAmount) || 0;
        const monthly = Number(monthlyContribution) || 0;
        const remaining = Math.max(0, target - current);

        if (remaining === 0) return 0;
        if (monthly <= 0) return Infinity;

        return Math.ceil(remaining / monthly);
    }, [targetAmount, currentAmount, monthlyContribution]);

    const estimatedDateDisplay = React.useMemo(() => {
        if (estimatedMonths === 0) return 'Đã hoàn thành';
        if (estimatedMonths === Infinity) return '---';

        const date = new Date();
        date.setMonth(date.getMonth() + estimatedMonths);
        return `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
    }, [estimatedMonths]);


    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let deadlineIso = new Date().toISOString();
        if (estimatedMonths !== Infinity && estimatedMonths > 0) {
            const d = new Date();
            d.setMonth(d.getMonth() + estimatedMonths);
            deadlineIso = d.toISOString();
        }

        const goalData: FinancialGoal = {
            id: goalToEdit ? goalToEdit.id : `goal-${Date.now()}`,
            name,
            type,
            targetAmount: Number(targetAmount),
            currentAmount: Number(currentAmount),
            deadline: deadlineIso,
            monthlyContribution: Number(monthlyContribution),
            priority,
            status: 'ON_TRACK',
            icon: type === 'ASSET' ? 'home' : type === 'SAVINGS' ? 'piggy-bank' : 'credit-card'
        };

        if (goalToEdit) {
            updateGoal(goalToEdit.id, goalData);
        } else {
            addGoal(goalData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                        {goalToEdit ? 'Chỉnh sửa Kế hoạch' : 'Lập Kế hoạch Mới'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Name & Type */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">Tên mục tiêu</label>
                            <input
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="Vd: Mua nhà, Xe hơi..."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">Loại</label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value as any)}
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            >
                                <option value="ASSET">Tài sản</option>
                                <option value="SAVINGS">Tiết kiệm</option>
                                <option value="DEBT">Trả nợ</option>
                            </select>
                        </div>
                    </div>

                    {/* Amounts */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">Mục tiêu (VND)</label>
                            <div className="relative">
                                <Target size={14} className="absolute left-3 top-3 text-zinc-400" />
                                <input
                                    type="number"
                                    required
                                    value={targetAmount}
                                    onChange={e => setTargetAmount(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 p-2 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">Đã có (VND)</label>
                            <div className="relative">
                                <Wallet size={14} className="absolute left-3 top-3 text-zinc-400" />
                                <input
                                    type="number"
                                    required
                                    value={currentAmount}
                                    onChange={e => setCurrentAmount(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 p-2 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Auto Calculation Block */}
                    <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20 space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-indigo-500 dark:text-indigo-400">Bạn sẽ để dành bao nhiêu / tháng?</label>
                            <div className="relative">
                                <CreditCard size={14} className="absolute left-3 top-3 text-indigo-400" />
                                <input
                                    type="number"
                                    required
                                    value={monthlyContribution}
                                    onChange={e => setMonthlyContribution(e.target.value)}
                                    className="w-full bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-500/30 rounded-lg pl-9 p-2 text-lg font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Nhập số tiền..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                            <Calendar size={18} className="text-indigo-500" />
                            <div className="text-xs text-zinc-600 dark:text-zinc-400">
                                Dự kiến hoàn thành: <br />
                                <span className="text-base font-bold text-indigo-600 dark:text-indigo-300">
                                    {estimatedDateDisplay}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-zinc-500">Độ ưu tiên</label>
                        <div className="flex gap-2">
                            {(['HIGH', 'MEDIUM', 'LOW'] as const).map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPriority(p)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${priority === p
                                        ? (p === 'HIGH' ? 'bg-rose-500 text-white border-rose-600' : p === 'MEDIUM' ? 'bg-amber-500 text-white border-amber-600' : 'bg-emerald-500 text-white border-emerald-600')
                                        : 'bg-white dark:bg-zinc-950 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                                        }`}
                                >
                                    {p === 'HIGH' ? 'Cao' : p === 'MEDIUM' ? 'Trung bình' : 'Thấp'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                        <Save size={18} />
                        Lưu Mục tiêu
                    </button>
                </form>
            </div>
        </div>
    );
};
