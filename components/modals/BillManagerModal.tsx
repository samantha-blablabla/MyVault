import React, { useState } from 'react';
import { X, Calendar, Check, Plus, Trash2, AlertCircle, Receipt, Home, Zap, Wifi, PlayCircle, Shield, CreditCard, Circle } from 'lucide-react';

import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/dataService';
import { FixedBill } from '../../types';

interface BillManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// MONOTONE CATEGORY CONFIG
const CATEGORIES: { id: FixedBill['category'], label: string, icon: any }[] = [
    { id: 'housing', label: 'Nhà cửa', icon: Home },
    { id: 'utilities', label: 'Điện nước', icon: Zap },
    { id: 'internet', label: 'Internet', icon: Wifi },
    { id: 'subscription', label: 'Dịch vụ', icon: PlayCircle },
    { id: 'insurance', label: 'Bảo hiểm', icon: Shield },
    { id: 'debt', label: 'Trả góp', icon: CreditCard },
    { id: 'other', label: 'Khác', icon: Circle },
];

export const BillManagerModal: React.FC<BillManagerModalProps> = ({ isOpen, onClose }) => {
    const { fixedBills, updateBillAmount, addBill, removeBill } = useFinance();

    const [newName, setNewName] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newDay, setNewDay] = useState('');
    const [selectedCat, setSelectedCat] = useState<FixedBill['category']>('other');

    if (!isOpen) return null;

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName && newAmount && newDay) {
            addBill(newName, Number(newAmount), Number(newDay), selectedCat);
            setNewName('');
            setNewAmount('');
            setNewDay('');
            setSelectedCat('other');
        }
    };

    const getCategoryConfig = (id?: string) => {
        return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-800 rounded-2xl shadow-hard dark:shadow-none overflow-hidden animate-slide-up transition-colors">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                    <h3 className="text-lg font-bold text-black dark:text-white tracking-wide flex items-center gap-2">
                        <Receipt size={18} className="text-black dark:text-primary" /> Quản lý Hóa đơn
                    </h3>
                    <button onClick={onClose} className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-xs text-zinc-500 mb-4 font-semibold">
                        Các khoản này được trừ tự động khỏi ngân sách "Thiết yếu" trước khi tính tiền tiêu hàng ngày.
                    </p>

                    {/* List Existing Bills */}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar mb-6">
                        {fixedBills.length === 0 && <div className="text-center text-zinc-400 dark:text-zinc-600 text-sm py-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl font-bold uppercase">Chưa có hóa đơn nào</div>}
                        {fixedBills.map(bill => {
                            const config = getCategoryConfig(bill.category);
                            const Icon = config.icon;
                            return (
                                <div key={bill.id} className="flex items-center justify-between bg-white dark:bg-zinc-950 p-2.5 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-600 transition-colors group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        {/* Icon Box - Monotone */}
                                        <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center border border-black dark:border-zinc-700 bg-black dark:bg-zinc-800 text-white">
                                            <Icon size={18} />
                                        </div>

                                        <div className="min-w-0">
                                            <div className="text-sm font-bold text-black dark:text-white truncate">{bill.name}</div>
                                            <div className="text-[10px] text-zinc-500 flex items-center gap-1 font-semibold">
                                                <Calendar size={10} /> Ngày {bill.dueDay}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <input
                                            type="number"
                                            value={bill.amount}
                                            onChange={(e) => updateBillAmount(bill.id, Number(e.target.value))}
                                            className="w-20 bg-transparent text-right font-bold text-black dark:text-white focus:outline-none border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-black dark:focus:border-primary py-1 text-sm transition-colors"
                                        />
                                        <button
                                            onClick={() => removeBill(bill.id)}
                                            className="text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-lg transition-all"
                                            title="Xóa"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Add New Bill (Compact UI) */}
                    <div className="pt-4 border-t-2 border-zinc-100 dark:border-zinc-800">
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3">Thêm hóa đơn mới</div>

                        <form onSubmit={handleAdd} className="space-y-3">
                            {/* 1. Category Selector */}
                            <div className="flex gap-2 overflow-x-auto pb-2 snap-x custom-scrollbar">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setSelectedCat(cat.id)}
                                        className={`flex-shrink-0 snap-start flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-xs font-bold transition-all ${selectedCat === cat.id
                                            ? 'bg-primary text-black border-black shadow-hard-sm dark:bg-white dark:text-black dark:border-white dark:shadow-none'
                                            : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                                            }`}
                                    >
                                        <cat.icon size={14} />
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* 2. Compact Inputs */}
                            <div className="flex flex-col gap-2">
                                {/* Row 1: Name */}
                                <input
                                    placeholder="Tên hóa đơn (VD: Netflix, Tiền nhà)"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-primary transition-colors font-bold"
                                    required
                                />

                                {/* Row 2: Day, Amount, Add */}
                                <div className="flex gap-2">
                                    <div className="relative w-20">
                                        <input
                                            placeholder="Ngày"
                                            type="number"
                                            min="1" max="31"
                                            value={newDay}
                                            onChange={e => setNewDay(e.target.value)}
                                            className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-lg pl-3 pr-1 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-primary text-center font-bold"
                                            required
                                        />
                                        <span className="absolute right-2 top-3 text-[10px] text-zinc-400 pointer-events-none font-bold">/th</span>
                                    </div>

                                    <input
                                        placeholder="Số tiền (VND)"
                                        type="number"
                                        value={newAmount}
                                        onChange={e => setNewAmount(e.target.value)}
                                        className="flex-1 bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-primary font-bold"
                                        required
                                    />

                                    <button
                                        type="submit"
                                        className="px-4 bg-primary text-black border-2 border-black rounded-lg flex items-center justify-center transition-all shadow-hard-sm active:translate-y-0.5 active:shadow-none hover:-translate-y-0.5 hover:bg-primary/90"
                                    >
                                        <Plus size={20} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};