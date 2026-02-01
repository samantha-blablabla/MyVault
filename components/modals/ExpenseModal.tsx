import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Camera, Coffee, CreditCard, ShoppingBag, ArrowUpCircle, ArrowDownCircle, Gift, Banknote, Sparkles, Image as ImageIcon, Trash2, CalendarClock } from 'lucide-react';
import { formatCurrency } from '../../services/dataService';
import { TransactionType } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { GoogleGenAI, Type } from "@google/genai";

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (amount: number, note: string, type: TransactionType.EXPENSE | TransactionType.INCOME) => void;
    initialData?: {
        amount: number;
        note: string;
        type: TransactionType;
    };
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const { addBill } = useFinance();
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [type, setType] = useState<TransactionType.EXPENSE | TransactionType.INCOME>(TransactionType.EXPENSE);
    const [isScanning, setIsScanning] = useState(false);
    const [scannedImage, setScannedImage] = useState<string | null>(null);

    // Fixed Bill State
    const [isFixedBill, setIsFixedBill] = useState(false);
    const [dueDay, setDueDay] = useState(1);

    // Ref for the hidden file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Populate data when opening in edit mode
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setAmount(initialData.amount?.toString() || '');
                setNote(initialData.note || '');
                setType(initialData.type === TransactionType.INCOME ? TransactionType.INCOME : TransactionType.EXPENSE);
            } else {
                resetForm();
            }
        } else {
            // Cleanup preview URL to avoid memory leaks
            if (scannedImage) {
                URL.revokeObjectURL(scannedImage);
                setScannedImage(null);
            }
        }
    }, [isOpen, initialData]);

    const resetForm = () => {
        setAmount('');
        setNote('');
        setType(TransactionType.EXPENSE);
        setScannedImage(null);
        setIsFixedBill(false);
        setDueDay(1);
    };

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount) return;

        if (type === TransactionType.EXPENSE && isFixedBill) {
            // Add as Fixed Bill
            addBill(note || 'Hóa đơn mới', Number(amount), Number(dueDay));
        } else {
            // Add as Normal Transaction
            onSubmit(Number(amount), note, type);
        }
        onClose();
    };

    const handleCameraClick = () => {
        // Trigger the hidden file input
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Create a local preview URL
            const previewUrl = URL.createObjectURL(file);
            setScannedImage(previewUrl);
            scanReceiptWithGemini(file);
        }
    };

    const scanReceiptWithGemini = async (file: File) => {
        setIsScanning(true);

        try {
            // Convert to Base64
            const base64Data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    const result = reader.result as string;
                    // remove data:image/xyz;base64,
                    resolve(result.split(',')[1]);
                };
                reader.onerror = reject;
            });

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-latest',
                contents: {
                    parts: [
                        { inlineData: { mimeType: file.type, data: base64Data } },
                        { text: "Analyze this receipt. Extract the total amount (numeric only) and the merchant name or a brief description. Identify if it is an EXPENSE or INCOME (receipts are usually EXPENSE)." }
                    ]
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            amount: { type: Type.NUMBER, description: "Total amount found on the receipt" },
                            note: { type: Type.STRING, description: "Merchant name or description" },
                            type: { type: Type.STRING, enum: ["EXPENSE", "INCOME"] }
                        }
                    }
                }
            });

            const text = response.text;
            if (text) {
                const data = JSON.parse(text);
                if (data.amount) setAmount(data.amount.toString());
                if (data.note) setNote(data.note);
                if (data.type) setType(data.type === 'INCOME' ? TransactionType.INCOME : TransactionType.EXPENSE);
            }
        } catch (error) {
            console.error("Gemini Scan Error:", error);
        } finally {
            setIsScanning(false);
        }
    };

    const removeImage = () => {
        setScannedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Configuration based on Type
    const isExpense = type === TransactionType.EXPENSE;

    const suggestions = isExpense ? [
        { icon: <Coffee size={14} />, label: 'Cà phê', value: 35000 },
        { icon: <ShoppingBag size={14} />, label: 'Siêu thị', value: 500000 },
        { icon: <CreditCard size={14} />, label: 'Xăng xe', value: 70000 },
        { icon: <CreditCard size={14} />, label: 'Ăn ngoài', value: 150000 },
    ] : [
        { icon: <Banknote size={14} />, label: 'Lương', value: 10000000 },
        { icon: <Gift size={14} />, label: 'Thưởng', value: 1000000 },
        { icon: <Banknote size={14} />, label: 'Hoàn tiền', value: 50000 },
    ];

    return (
        // Z-INDEX UPDATE: z-[100] to ensure it covers the Mobile Navigation (which is z-50)
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border-t-2 sm:border-2 border-black dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.3)] sm:shadow-hard dark:shadow-2xl overflow-hidden animate-slide-up transition-colors">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                    {/* Type Switcher */}
                    <div className="flex bg-zinc-200 dark:bg-zinc-800 rounded-lg p-1">
                        <button
                            type="button"
                            onClick={() => setType(TransactionType.EXPENSE)}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${type === TransactionType.EXPENSE ? 'bg-white dark:bg-zinc-600 text-black dark:text-white shadow-sm' : 'text-zinc-500'}`}
                        >
                            <ArrowUpCircle size={14} className={type === TransactionType.EXPENSE ? 'text-rose-500' : ''} /> Chi Tiêu
                        </button>
                        <button
                            type="button"
                            onClick={() => setType(TransactionType.INCOME)}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${type === TransactionType.INCOME ? 'bg-white dark:bg-zinc-600 text-black dark:text-white shadow-sm' : 'text-zinc-500'}`}
                        >
                            <ArrowDownCircle size={14} className={type === TransactionType.INCOME ? 'text-emerald-500' : ''} /> Thu Nhập
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Gemini Scan Button */}
                        <button
                            type="button"
                            onClick={handleCameraClick}
                            disabled={isScanning}
                            className={`p-2 rounded-full transition-all ${isScanning ? 'bg-primary animate-pulse' : 'hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white'}`}
                            title="Scan Receipt with AI"
                        >
                            {isScanning ? <Sparkles size={20} className="text-black" /> : <Camera size={20} />}
                        </button>
                        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Hidden File Input */}
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>

                {/* Form Body - Increased padding-bottom (pb-10) for mobile safe area */}
                <form onSubmit={handleSubmit} className="p-6 pb-10 space-y-5 max-h-[85vh] overflow-y-auto custom-scrollbar">

                    {/* Image Preview Area */}
                    {scannedImage && (
                        <div className="relative w-full h-32 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-black/50">
                            <img src={scannedImage} alt="Receipt" className="w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                {isScanning ? (
                                    <div className="flex items-center gap-2 bg-black/70 px-4 py-2 rounded-full text-primary text-xs font-bold backdrop-blur-md">
                                        <Sparkles size={14} className="animate-spin" />
                                        <span>Gemini AI is reading...</span>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2 text-center">
                        <label className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">
                            {isExpense ? 'SỐ TIỀN (CHI RA)' : 'SỐ TIỀN (THU VÀO)'}
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0"
                                autoFocus
                                className={`w-full bg-transparent text-center text-5xl font-black focus:outline-none placeholder-zinc-200 dark:placeholder-zinc-800 transition-colors ${isExpense ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-500 dark:text-emerald-400'}`}
                            />
                        </div>
                        {amount && (
                            <div className="text-xs font-bold text-zinc-400">
                                {formatCurrency(Number(amount))}
                            </div>
                        )}
                    </div>

                    {/* Quick Suggestions */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {suggestions.map((s, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                    setAmount(s.value.toString());
                                    setNote(s.label);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-bold hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all"
                            >
                                {s.icon} {s.label}
                            </button>
                        ))}
                    </div>

                    {/* Note Input */}
                    <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider ml-1">Nội dung</label>
                        <input
                            type="text"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            className="w-full bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3.5 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-black dark:focus:border-primary font-medium"
                            placeholder="VD: Ăn trưa, Grab, Lương tháng 10..."
                        />
                    </div>

                    {/* Fixed Bill Toggle (Only for Expense) */}
                    {isExpense && (
                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isFixedBill ? 'bg-primary border-primary text-white' : 'border-zinc-300 dark:border-zinc-600'}`}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={isFixedBill}
                                            onChange={e => setIsFixedBill(e.target.checked)}
                                        />
                                        {isFixedBill && <Check size={14} strokeWidth={3} />}
                                    </div>
                                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Đây là Hóa đơn cố định?</span>
                                </label>
                                <CalendarClock size={16} className="text-zinc-400" />
                            </div>

                            {isFixedBill && (
                                <div className="space-y-1 animate-fade-in text-sm">
                                    <div className="flex justify-between text-xs text-zinc-500 font-bold uppercase">
                                        <span>Ngày đến hạn hàng tháng</span>
                                        <span className="text-primary font-black text-lg">{dueDay}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="31"
                                        value={dueDay}
                                        onChange={e => setDueDay(Number(e.target.value))}
                                        className="w-full h-1 bg-zinc-200 dark:bg-black rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <p className="text-[10px] text-zinc-400 italic">Bill sẽ tự động trừ vào hạn mức chi tiêu hàng tháng.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        className={`w-full font-black text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg ${isExpense
                            ? 'bg-white text-black border-2 border-black hover:bg-zinc-100 dark:bg-white dark:text-black dark:border-transparent'
                            : 'bg-emerald-500 text-white hover:bg-emerald-600'
                            }`}
                    >
                        <Check size={24} strokeWidth={3} />
                        {isExpense ? 'Xác Nhận Chi Tiêu' : 'Xác Nhận Thu Nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
};