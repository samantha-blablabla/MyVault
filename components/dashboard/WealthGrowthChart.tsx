import React, { useMemo } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/dataService';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Flame, Lock } from 'lucide-react';

export const WealthGrowthChart: React.FC = () => {
    const { user, monthlyIncome, budget } = useFinance();

    // 1. Current Net Worth (Already includes Stocks + Goals)
    const currentNetWorth = user.totalNetWorth || 0;

    // 2. FIRE Logic (Financial Independence, Retire Early)
    // Formula: Annual Expenses * 25
    // Derive Expenses from Budget (Needs + Spending) or simple Income - Savings
    const savingsCategory = budget.find(b => b.id === 'savings');
    const investCategory = budget.find(b => b.id === 'invest');
    const monthlySavingsSurplus = (savingsCategory?.allocated || 0) + (investCategory?.allocated || 0);

    // Estimate Expenses = Income - Savings
    const monthlyExpenses = Math.max(0, monthlyIncome - monthlySavingsSurplus);
    const annualExpenses = monthlyExpenses * 12;

    // FIRE Number (Goal)
    const fireNumber = annualExpenses * 25; // Rule of 25

    // 3. Projections for Chart
    // Generate data for next 5 years (60 months) to show the path
    const data = useMemo(() => {
        return Array.from({ length: 13 }).map((_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() + i);
            const predictedValue = currentNetWorth + (monthlySavingsSurplus * i);

            // Simple Compound Interest for future (visual appeal)
            // predictedValue = predictedValue * Math.pow(1.008, i); 

            return {
                month: `T${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`,
                netWorth: predictedValue,
                fire: fireNumber
            };
        });
    }, [currentNetWorth, monthlySavingsSurplus, fireNumber]);

    const progressToFire = fireNumber > 0 ? (currentNetWorth / fireNumber) * 100 : 0;
    const yearsToFire = monthlySavingsSurplus > 0
        ? ((fireNumber - currentNetWorth) / monthlySavingsSurplus) / 12
        : Infinity;

    return (
        <GlassCard className="h-full min-h-[18rem] relative overflow-hidden bg-gradient-to-br from-indigo-900/10 to-purple-900/10 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-500/10">
            <div className="absolute top-0 right-0 p-6 opacity-5">
                <Flame size={120} className="text-orange-500" />
            </div>

            <div className="flex flex-col md:flex-row h-full">
                {/* Left: Stats */}
                <div className="p-6 flex flex-col justify-between w-full md:w-1/3 relative z-10">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <Flame className="text-orange-500" size={20} />
                            Hành trình Tự do (FIRE)
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">Con đường đến tự do tài chính (25x Chi tiêu).</p>
                    </div>

                    <div className="space-y-6 mt-6 md:mt-0">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Tổng Tài sản Ròng (Net Worth)</div>
                            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                                {formatCurrency(currentNetWorth)}
                            </div>
                            <div className="text-[10px] text-zinc-400 mt-1">
                                Bao gồm: Cổ phiếu, Coin, Tiết kiệm & Tài sản khác
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">
                                <span>Tiến độ FIRE</span>
                                <span>{Math.round(progressToFire)}%</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700/50 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(100, progressToFire)}%` }}></div>
                            </div>
                            <div className="text-[10px] text-zinc-400 mt-2 flex items-center gap-1 justify-between">
                                <span className="flex items-center gap-1"><Lock size={10} /> Đích đến: {formatCurrency(fireNumber)}</span>
                                {yearsToFire !== Infinity && (
                                    <span className="text-emerald-500 font-bold">~{yearsToFire.toFixed(1)} năm nữa</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Chart */}
                <div className="flex-1 h-56 md:h-auto min-h-[14rem] w-full p-2 md:p-6 opacity-90">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#71717a' }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', background: 'rgba(24, 24, 27, 0.9)' }}
                                formatter={(value: number, name: string) => [
                                    formatCurrency(value),
                                    name === 'fire' ? 'Mục tiêu FIRE' : 'Tài sản dự kiến'
                                ]}
                            />
                            <ReferenceLine y={fireNumber} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Freedom', fill: '#ef4444', fontSize: 10 }} />
                            <Area
                                type="monotone"
                                dataKey="netWorth"
                                stroke="#f97316"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorNetWorth)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </GlassCard>
    );
};
