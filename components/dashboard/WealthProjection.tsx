import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/dataService';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target } from 'lucide-react';

export const WealthProjection: React.FC = () => {
    const { user, goals, monthlyIncome, budget } = useFinance();

    // 1. Calculate Current Net Worth
    const currentNetWorth = user.totalNetWorth || 0;

    // 2. Calculate Total Goal Target
    const totalGoalValue = goals.reduce((sum, g) => sum + g.targetAmount, 0);

    // 3. Projections (Simple Linear for now)
    // Assume 20% savings rate if not defined, or derive from budget
    const savingsCategory = budget.find(b => b.id === 'savings');
    const investCategory = budget.find(b => b.id === 'invest');
    const monthlySavings = (savingsCategory?.allocated || 0) + (investCategory?.allocated || 0);

    // Generate data for next 12 months
    const data = Array.from({ length: 13 }).map((_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() + i);
        return {
            month: `T${date.getMonth() + 1}`,
            netWorth: currentNetWorth + (monthlySavings * i),
            goal: totalGoalValue > 0 ? totalGoalValue : (currentNetWorth * 1.5) // Placeholder target if no goals
        };
    });

    const completionRate = totalGoalValue > 0 ? (currentNetWorth / totalGoalValue) * 100 : 0;

    return (
        <GlassCard className="h-full min-h-[16rem] relative overflow-hidden bg-gradient-to-br from-indigo-900/10 to-purple-900/10 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-500/10">
            <div className="absolute top-0 right-0 p-6 opacity-5">
                <TrendingUp size={120} className="text-indigo-500" />
            </div>

            <div className="flex flex-col md:flex-row h-full">
                {/* Left: Stats */}
                <div className="p-6 flex flex-col justify-between w-full md:w-1/3 relative z-10">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="text-indigo-500" size={20} />
                            Dự phóng Tài sản
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">Tăng trưởng dự kiến dựa trên dòng tiền hiện tại.</p>
                    </div>

                    <div className="space-y-6 mt-6 md:mt-0">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Tổng Tài sản hiện tại</div>
                            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                                {formatCurrency(currentNetWorth)}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">
                                <span>Tiến độ Mục tiêu</span>
                                <span>{Math.round(completionRate)}%</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700/50 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, completionRate)}%` }}></div>
                            </div>
                            <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                                <Target size={10} />
                                Mục tiêu: {formatCurrency(totalGoalValue)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Chart */}
                <div className="flex-1 h-48 md:h-auto min-h-[12rem] w-full p-2 md:p-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#71717a' }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value: number) => [formatCurrency(value), 'Tài sản']}
                            />
                            <Area
                                type="monotone"
                                dataKey="netWorth"
                                stroke="#6366f1"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorPv)"
                            />
                            <Area
                                type="monotone"
                                dataKey="goal"
                                stroke="#e4e4e7"
                                strokeDasharray="5 5"
                                strokeWidth={2}
                                fill="transparent"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </GlassCard>
    );
};
