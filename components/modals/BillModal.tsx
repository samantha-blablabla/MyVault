import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface BillModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string, amount: number, dueDay: number }) => void;
    initialData?: {
        name: string;
        amount: number;
        dueDay: number;
    } | null;
}

export const BillModal: React.FC<BillModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDay, setDueDay] = useState('');

    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name);
            setAmount(initialData.amount.toString());
            setDueDay(initialData.dueDay.toString());
        } else if (isOpen) {
            setName('');
            setAmount('');
            setDueDay('');
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name,
            amount: Number(amount),
            dueDay: Number(dueDay)
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                        {initialData ? 'Sửa hóa đơn' : 'Thêm hóa đơn'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <X size={20} className="text-zinc-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase">Tên hóa đơn</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ví dụ: Tiền điện, Internet..."
                            className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none outline-none font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/50"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-500 uppercase">Số tiền</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0"
                                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none outline-none font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/50"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-500 uppercase">Ngày đến hạn</label>
                            <input
                                type="number"
                                min="1"
                                max="31"
                                value={dueDay}
                                onChange={(e) => setDueDay(e.target.value)}
                                placeholder="1-31"
                                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none outline-none font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/50"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 mt-2 rounded-xl bg-primary text-white font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/30"
                    >
                        {initialData ? 'Lưu thay đổi' : 'Thêm hóa đơn'}
                    </button>
                </form>
            </div>
        </div>
    );
};
