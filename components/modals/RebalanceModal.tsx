import React, { useState, useEffect } from 'react';
import { ArrowRight, Calculator, X, TrendingUp, AlertTriangle, CheckCircle2, ArrowRightLeft, DollarSign, Wallet, ArrowLeft } from 'lucide-react';
import { AssetType, StockData } from '../../types';
import { formatCurrency } from '../../services/dataService';

interface RebalanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    portfolio: StockData[];
    marketSignals: any[];
}

export const RebalanceModal: React.FC<RebalanceModalProps> = ({ isOpen, onClose, portfolio, marketSignals }) => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [sellSymbol, setSellSymbol] = useState('');
    const [sellPercent, setSellPercent] = useState(30);
    const [buySymbol, setBuySymbol] = useState('');

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSellSymbol('');
            setBuySymbol('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // --- DERIVED DATA ---
    const sellAsset = portfolio.find(p => p.symbol === sellSymbol);
    const buySignal = marketSignals.find(s => s.symbol === buySymbol);
    const buyAssetPrice = buySignal?.price || portfolio.find(p => p.symbol === buySymbol)?.currentPrice || 0;

    // Calculations
    const sellAmount = sellAsset ? (sellAsset.quantity * sellAsset.currentPrice * (sellPercent / 100)) : 0;
    const estFee = sellAmount * 0.0015; // 0.15% fee
    const netCashBack = sellAmount - estFee;
    const estNewShares = (netCashBack > 0 && buyAssetPrice > 0) ? Math.floor(netCashBack / buyAssetPrice) : 0;

    // Smart Suggestions
    const suggestSell = portfolio.filter(p => p.type === AssetType.Stock && (p.pnlPercent || 0) > 10); // Profit > 10%
    const suggestBuy = marketSignals.filter(s => s.rsi < 45 || s.volume_state === 'PUMPING').slice(0, 4); // RSI Low or Pumping

    // --- STEPS RENDER ---

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">

                {/* HEAD */}
                <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 relative z-10">
                    <div>
                        <h3 className="font-black text-xl text-zinc-900 dark:text-white flex items-center gap-2 tracking-tight">
                            <span className="text-2xl">🌾</span> Gặt lúa (Harvest)
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={`h-1.5 w-8 rounded-full transition-all ${step >= 1 ? 'bg-primary' : 'bg-zinc-200 dark:bg-zinc-800'}`}></div>
                            <div className={`h-1.5 w-8 rounded-full transition-all ${step >= 2 ? 'bg-primary' : 'bg-zinc-200 dark:bg-zinc-800'}`}></div>
                            <div className={`h-1.5 w-8 rounded-full transition-all ${step >= 3 ? 'bg-primary' : 'bg-zinc-200 dark:bg-zinc-800'}`}></div>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase ml-2">Bước {step}/3</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-rose-500">
                        <X size={24} />
                    </button>
                </div>

                {/* BODY (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/50 dark:bg-black/20">

                    {/* STEP 1: CHỐT LỜI */}
                    {step === 1 && (
                        <div className="space-y-6 animate-slide-in-right">
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex gap-3 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                                <TrendingUp size={20} className="shrink-0" />
                                <div>
                                    <span className="font-bold block mb-0.5">Thời điểm vàng để chốt lời?</span>
                                    Hệ thống lọc ra các mã đang có lãi tốt ({'>'}10%) hoặc đang ở vùng quá mua.
                                </div>
                            </div>

                            {/* Suggestions List */}
                            {suggestSell.length > 0 && (
                                <div>
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 block">Gợi ý chốt lời</label>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestSell.map(p => (
                                            <button
                                                key={p.symbol}
                                                onClick={() => setSellSymbol(p.symbol)}
                                                className={`px-3 py-2 rounded-xl border text-sm font-bold transition-all flex items-center gap-2 ${sellSymbol === p.symbol ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'}`}
                                            >
                                                {p.symbol} <span className="text-emerald-500">+{p.pnlPercent?.toFixed(1)}%</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Manual Selection */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Hoặc chọn thủ công</label>
                                <select
                                    value={sellSymbol}
                                    onChange={e => setSellSymbol(e.target.value)}
                                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="">-- Chọn mã trong danh mục --</option>
                                    {portfolio.filter(p => p.type === AssetType.Stock && p.quantity > 0).map(p => (
                                        <option key={p.symbol} value={p.symbol}>{p.symbol} - Lãi: {p.pnlPercent?.toFixed(2)}%</option>
                                    ))}
                                </select>
                            </div>

                            {/* Percentage Slider */}
                            {sellSymbol && (
                                <div className="p-5 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-zinc-500">Khối lượng bán</span>
                                        <span className="text-2xl font-black text-zinc-900 dark:text-white">{sellPercent}%</span>
                                    </div>
                                    <input
                                        type="range" min="10" max="100" step="10"
                                        value={sellPercent} onChange={e => setSellPercent(Number(e.target.value))}
                                        className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-700 flex justify-between items-center">
                                        <span className="text-xs font-bold text-zinc-400">Thu về dự kiến</span>
                                        <span className="text-lg font-bold text-emerald-500">{formatCurrency(sellAmount)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: GIEO HẠT */}
                    {step === 2 && (
                        <div className="space-y-6 animate-slide-in-right">
                            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex gap-3 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                                <Wallet size={20} className="shrink-0" />
                                <div>
                                    <span className="font-bold block mb-0.5">Tái đầu tư (Lãi kép)</span>
                                    Dùng số tiền <b>{formatCurrency(sellAmount)}</b> vừa chốt để mua các mã tiềm năng mới.
                                </div>
                            </div>

                            {/* Shark Suggestions */}
                            {suggestBuy.length > 0 && (
                                <div>
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 block">Cơ hội từ Shark Tracker</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {suggestBuy.map(s => (
                                            <button
                                                key={s.symbol}
                                                onClick={() => setBuySymbol(s.symbol)}
                                                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${buySymbol === s.symbol ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-primary'}`}
                                            >
                                                <div className="font-black text-lg">{s.symbol}</div>
                                                <div className="text-xs opacity-70 mb-1">{formatCurrency(s.price)}</div>
                                                <div className="flex gap-1">
                                                    {s.rsi < 45 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500">RSI Thấp</span>}
                                                    {s.volume_state === 'PUMPING' && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-500">Dòng tiền</span>}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Manual Buy Selection */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Hoặc chọn mã khác</label>
                                <select
                                    value={buySymbol}
                                    onChange={e => setBuySymbol(e.target.value)}
                                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="">-- Chọn mã cần mua --</option>
                                    {marketSignals.map(s => (
                                        <option key={s.symbol} value={s.symbol}>{s.symbol} - {formatCurrency(s.price)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}


                    {/* STEP 3: PREVIEW */}
                    {step === 3 && (
                        <div className="space-y-6 animate-slide-in-right">
                            {/* Summary Card */}
                            <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-5 shadow-sm space-y-4">
                                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs">{sellSymbol}</div>
                                        <ArrowRight size={16} className="text-zinc-300" />
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs">{buySymbol}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-zinc-400 uppercase">Chuyển đổi</div>
                                        <div className="font-black text-zinc-900 dark:text-white">Thành công</div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Số lượng bán ({sellPercent}%)</span>
                                        <span className="font-bold text-rose-500">-{Math.floor((sellAsset?.quantity || 0) * sellPercent / 100)} cp</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Giá trị thực bán</span>
                                        <span className="font-bold dark:text-zinc-200">{formatCurrency(sellAmount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Phí giao dịch (0.15%)</span>
                                        <span className="font-bold text-zinc-900 dark:text-white">-{formatCurrency(estFee)}</span>
                                    </div>
                                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-700 flex justify-between text-base">
                                        <span className="font-bold text-zinc-500">Mua được</span>
                                        <span className="font-black text-emerald-500">+{estNewShares} cổ phiếu {buySymbol}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 text-sm flex gap-3">
                                <AlertTriangle size={20} className="shrink-0" />
                                <div className="leading-relaxed">
                                    <span className="font-bold block mb-1">Cảnh báo rủi ro</span>
                                    Giao dịch sẽ được thực hiện ngay lập tức với giá thị trường hiện tại. Bạn có chắc chắn muốn tiếp tục?
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* FOOTER ACTIONS */}
                <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-between items-center z-10">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(prev => (prev - 1) as any)}
                            className="px-5 py-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold text-zinc-500 transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft size={18} /> Quay lại
                        </button>
                    ) : (
                        <div></div> // Spacer
                    )}

                    {step < 3 ? (
                        <button
                            disabled={!sellSymbol || (step === 2 && !buySymbol)}
                            onClick={() => setStep(prev => (prev + 1) as any)}
                            className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            Tiếp tục <ArrowRight size={18} />
                        </button>
                    ) : (
                        <button
                            className="px-8 py-3 rounded-xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            onClick={() => {
                                alert("Tính năng đặt lệnh thật đang phát triển! 🚧");
                                onClose();
                            }}
                        >
                            <CheckCircle2 size={18} /> Xác nhận Giao dịch
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
