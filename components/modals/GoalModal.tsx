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
    const [deadline, setDeadline] = useState('');
    const [monthlyContribution, setMonthlyContribution] = useState('');
    const [priority, setPriority] = useState<FinancialGoal['priority']>('MEDIUM');

    useEffect(() => {
        if (goalToEdit) {
            setName(goalToEdit.name);
            setType(goalToEdit.type);
            setTargetAmount(goalToEdit.targetAmount.toString());
            setCurrentAmount(goalToEdit.currentAmount.toString());
            setDeadline(goalToEdit.deadline.split('T')[0]);
            setMonthlyContribution(goalToEdit.monthlyContribution.toString());
            setPriority(goalToEdit.priority);
        } else {
            // Reset
            setName('');
            setType('ASSET');
            setTargetAmount('');
            setCurrentAmount('');
            setDeadline('');
            setMonthlyContribution('');
            setPriority('MEDIUM');
        }
    }, [goalToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const goalData: FinancialGoal = {
            id: goalToEdit ? goalToEdit.id : `goal-${Date.now()}`,
            name,
            type,
            targetAmount: Number(targetAmount),
            currentAmount: Number(currentAmount),
            deadline: new Date(deadline).toISOString(),
            monthlyContribution: Number(monthlyContribution),
            priority,
            status: 'ON_TRACK', // Initial default, dashboard calculation will override
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
                        {goalToEdit ? 'Chỉnh sửa Mục tiêu' : 'Thêm Mục tiêu Mới'}
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
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-sm font-bold text-zinc-900 dark:text-white"
                                placeholder="Vd: Mua nhà, Xe hơi..."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">Loại</label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value as any)}
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-sm font-bold text-zinc-900 dark:text-white"
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
                            <label className="text-[10px] uppercase font-bold text-zinc-500">Số tiền mục tiêu</label>
                            <div className="relative">
                                <Target size={14} className="absolute left-3 top-3 text-zinc-400" />
                                <input
                                    type="number"
                                    required
                                    value={targetAmount}
                                    onChange={e => setTargetAmount(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 p-2 text-sm font-bold text-zinc-900 dark:text-white"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">Hiện có</label>
                            <div className="relative">
                                <Wallet size={14} className="absolute left-3 top-3 text-zinc-400" />
                                <input
                                    type="number"
                                    required
                                    value={currentAmount}
                                    onChange={e => setCurrentAmount(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 p-2 text-sm font-bold text-zinc-900 dark:text-white"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Planning */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">Hạn chót</label>
                            <div className="relative">
                                <Calendar size={14} className="absolute left-3 top-3 text-zinc-400" />
                                <input
                                    type="date"
                                    required
                                    value={deadline}
                                    onChange={e => setDeadline(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 p-2 text-sm font-bold text-zinc-900 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">Tiết kiệm hàng tháng</label>
                            <div className="relative">
                                <CreditCard size={14} className="absolute left-3 top-3 text-zinc-400" />
                                <input
                                    type="number"
                                    required
                                    value={monthlyContribution}
                                    onChange={e => setMonthlyContribution(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 p-2 text-sm font-bold text-zinc-900 dark:text-white"
                                    placeholder="0"
                                />
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
