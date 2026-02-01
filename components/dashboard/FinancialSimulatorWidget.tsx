import React, { useState, useMemo } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Calculator, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../services/dataService';

export const FinancialSimulatorWidget: React.FC = () => {
    const [monthlyContribution, setMonthlyContribution] = useState(5000000);
    const [rate, setRate] = useState(10); // 10% annual
    const [years, setYears] = useState(10);
    const [initialAmount, setInitialAmount] = useState(0);

    const result = useMemo(() => {
        const r = rate / 100 / 12;
        const n = years * 12;

        // FV of Initial Amount: P * (1+r)^n
        const fvInitial = initialAmount * Math.pow(1 + r, n);

        // FV of Monthly Contributions: PMT * (((1 + r)^n - 1) / r)
        const fvSeries = monthlyContribution * ((Math.pow(1 + r, n) - 1) / r);

        return fvInitial + fvSeries;
    }, [monthlyContribution, rate, years, initialAmount]);

    const totalContributed = initialAmount + (monthlyContribution * years * 12);
    const profit = result - totalContributed;

    return (
        <GlassCard className="h-full bg-indigo-900 text-white border-indigo-700/50">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-indigo-800 border border-indigo-700">
                    <Calculator size={20} />
                </div>
                <h3 className="font-bold text-lg">Giả lập Lãi kép</h3>
            </div>

            <div className="space-y-5">
                {/* Inputs */}
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-indigo-300">Tiết kiệm / Tháng</label>
                    <input
                        type="range"
                        min="1000000"
                        max="50000000"
                        step="500000"
                        value={monthlyContribution}
                        onChange={e => setMonthlyContribution(Number(e.target.value))}
                        className="w-full h-2 bg-indigo-950 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                    <div className="flex justify-between items-center">
                        <span className="text-xl font-bold">{formatCurrency(monthlyContribution)}</span>
                        <button className="p-1 hover:bg-indigo-800 rounded" onClick={() => setMonthlyContribution(5000000)}><RefreshCw size={12} /></button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-indigo-300">Lãi suất (%)</label>
                        <input
                            type="number"
                            value={rate}
                            onChange={e => setRate(Number(e.target.value))}
                            className="w-full bg-indigo-950 border border-indigo-800 rounded-lg p-2 font-bold text-white text-center"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-indigo-300">Năm (N)</label>
                        <input
                            type="number"
                            value={years}
                            onChange={e => setYears(Number(e.target.value))}
                            className="w-full bg-indigo-950 border border-indigo-800 rounded-lg p-2 font-bold text-white text-center"
                        />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-950/50 border border-indigo-800/50 mt-4">
                    <div className="text-[10px] uppercase font-bold text-indigo-300 mb-1">Sau {years} năm, bạn có:</div>
                    <div className="text-2xl font-black tracking-tight text-white mb-2">
                        {formatCurrency(result)}
                    </div>

                    <div className="space-y-1 pt-2 border-t border-indigo-800/50">
                        <div className="flex justify-between text-xs">
                            <span className="text-indigo-400">Gốc:</span>
                            <span className="font-bold opacity-80">{formatCurrency(totalContributed)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-indigo-400">Lãi:</span>
                            <span className="font-bold text-emerald-400">+{formatCurrency(profit)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-2 text-[10px] text-indigo-300 bg-indigo-800/20 p-2 rounded-lg">
                    <TrendingUp size={14} className="shrink-0 mt-0.5" />
                    <span>Lãi kép là kỳ quan thứ 8 của thế giới. Hãy bắt đầu sớm!</span>
                </div>
            </div>
        </GlassCard>
    );
};
