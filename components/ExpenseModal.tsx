import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Camera, Coffee, CreditCard, ShoppingBag, ArrowUpCircle, ArrowDownCircle, Gift, Banknote, Sparkles, Image as ImageIcon, Trash2 } from 'lucide-react';
import { formatCurrency } from '../services/dataService';
import { TransactionType } from '../types';
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
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<TransactionType.EXPENSE | TransactionType.INCOME>(TransactionType.EXPENSE);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  
  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate data when opening in edit mode
  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setAmount(initialData.amount.toString());
            setNote(initialData.note);
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
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    onSubmit(Number(amount), note, type);
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
      { icon: <CreditCard size={14} />, label: 'Xăng xe', value: 80000 },
  ] : [
      { icon: <Gift size={14} />, label: 'Được tặng', value: 500000 },
      { icon: <Banknote size={14} />, label: 'Thưởng nóng', value: 1000000 },
      { icon: <ArrowDownCircle size={14} />, label: 'Hoàn tiền', value: 50000 },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full md:max-w-md bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-800 rounded-t-2xl md:rounded-2xl shadow-hard dark:shadow-2xl overflow-hidden animate-slide-up relative flex flex-col max-h-[90vh] transition-colors">
        
        {/* Hidden Input for Camera/File */}
        <input 
            type="file" 
            accept="image/*" 
            capture="environment" // Forces rear camera on mobile
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden" 
        />

        {/* Loading Overlay for Scanning */}
        {isScanning && (
            <div className="absolute inset-0 z-50 bg-zinc-950/90 flex flex-col items-center justify-center text-center p-6 animate-fade-in backdrop-blur-sm">
                <div className="w-20 h-20 relative mb-6">
                    {scannedImage && (
                        <img src={scannedImage} alt="Scanning" className="w-full h-full object-cover rounded-xl opacity-50 absolute inset-0" />
                    )}
                    <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-xl"></div>
                    <div className="absolute inset-0 border-b-4 border-emerald-500 animate-[scan_1.5s_ease-in-out_infinite]"></div>
                </div>
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Sparkles className="text-emerald-500" size={20} /> Gemini AI Processing...
                </h3>
                <p className="text-zinc-500 text-sm mt-1">Đang trích xuất số tiền & nội dung</p>
            </div>
        )}

        {/* Header with Toggle */}
        <div className="flex-none flex items-center justify-between px-6 py-4 border-b-2 border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
           <div className="flex gap-2 p-1 bg-zinc-200 dark:bg-black/20 rounded-lg border border-zinc-300 dark:border-white/5">
                <button 
                    onClick={() => setType(TransactionType.EXPENSE)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${isExpense ? 'bg-black text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                >
                    <ArrowUpCircle size={14} /> Chi Tiêu
                </button>
                <button 
                    onClick={() => setType(TransactionType.INCOME)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${!isExpense ? 'bg-primary text-black border border-black shadow-hard-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                >
                    <ArrowDownCircle size={14} /> Thu Nhập
                </button>
           </div>
           
           <div className="flex items-center gap-1">
               {/* Scan Button - Mobile Optimized */}
               <button 
                 onClick={handleCameraClick}
                 type="button"
                 className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-full transition-colors relative group"
                 title="Chụp hóa đơn"
               >
                   <Camera size={22} />
               </button>

               <button onClick={onClose} className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                 <X size={22} />
               </button>
           </div>
        </div>
        
        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Image Preview Area */}
            {scannedImage && !isScanning && (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 group">
                    <img src={scannedImage} alt="Receipt Preview" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            <Check size={12} /> Đã quét xong
                        </span>
                    </div>
                    <button 
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-rose-500 transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )}

            {/* Big Amount Input */}
            <div className="text-center relative py-2">
                <label className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-2 block">
                    Số tiền {isExpense ? '(Chi ra)' : '(Nhận vào)'}
                </label>
                <input 
                    type="number" 
                    autoFocus={!scannedImage} 
                    required
                    placeholder="0"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className={`w-full bg-transparent text-5xl font-bold text-center focus:outline-none placeholder-zinc-300 dark:placeholder-zinc-800 tracking-tight ${isExpense ? 'text-black dark:text-white' : 'text-emerald-600 dark:text-primary'}`}
                />
                <div className={`text-sm mt-2 font-bold h-5 ${isExpense ? 'text-zinc-400' : 'text-emerald-600 dark:text-primary'}`}>
                    {amount ? (isExpense ? '-' : '+') : ''} {amount ? formatCurrency(Number(amount)) : ''}
                </div>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((s, idx) => (
                    <button 
                        key={idx}
                        type="button"
                        onClick={() => { setAmount(s.value.toString()); setNote(s.label); }}
                        className="flex items-center gap-2 px-3 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                        {s.icon} {s.label}
                    </button>
                ))}
            </div>

            {/* Note Input */}
            <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Nội dung</label>
                <input 
                    type="text" 
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg py-3 px-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-secondary dark:focus:border-primary transition-colors placeholder-zinc-400 dark:placeholder-zinc-600"
                    placeholder={isExpense ? "VD: Ăn trưa, Grab..." : "VD: Anh A trả nợ, Thưởng..."}
                />
            </div>
            </form>
        </div>

        {/* Footer Actions */}
        <div className="flex-none p-6 border-t-2 border-black dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm">
             <button 
             onClick={handleSubmit}
             className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-hard active:shadow-none hover:-translate-y-0.5 ${
                 isExpense 
                 ? 'bg-black text-white border-2 border-black dark:bg-white dark:text-black' 
                 : 'bg-primary text-black border-2 border-black dark:bg-primary dark:text-black'
             }`}
           >
             <Check size={20} />
             {initialData ? 'Lưu Thay Đổi' : (isExpense ? 'Xác Nhận Chi Tiêu' : 'Xác Nhận Thu Nhập')}
           </button>
        </div>

      </div>
    </div>
  );
};