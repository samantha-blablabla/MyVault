import React, { useState, useRef } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { StockCard } from '../dashboard/StockCard';
import { GlassCard } from '../ui/GlassCard';
import { LayoutGrid, ServerOff, Wallet } from 'lucide-react';
import { formatCurrency } from '../../services/dataService';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { AssetType } from '../../types';

export const AssetsView: React.FC = () => {
    const { portfolio, isPrivacyMode, budget } = useFinance();
    const stockAssets = portfolio.filter(s => s.type === AssetType.Stock);
    const fundAssets = portfolio.filter(s => s.type === AssetType.Fund);

    // --- ALLOCATION CALCULATION ---
    const stockValue = stockAssets.reduce((sum, item) => sum + (item.quantity * item.currentPrice), 0);
    const fundValue = fundAssets.reduce((sum, item) => sum + (item.quantity * item.currentPrice), 0);

    // Calculate Cash (Available Budget + Savings)
    const needs = budget.find(b => b.id === 'needs');
    const savings = budget.find(b => b.id === 'savings');
    const cashValue = (Math.max(0, (needs?.allocated || 0) - (needs?.spent || 0))) + (savings?.allocated || 0);

    const totalAssets = stockValue + fundValue + cashValue;

    // Data for Chart - Dark Mode Colors Only
    const hasData = totalAssets > 0;
    const allocationData = hasData ? [
        { name: 'Cổ phiếu', value: stockValue, color: '#4f46e5' }, // Primary Violet
        { name: 'CC Quỹ', value: fundValue, color: '#ffffff' },    // White
        { name: 'Tiền mặt', value: cashValue, color: '#52525b' },  // Zinc 600
    ] : [
        { name: 'Cổ phiếu', value: 1, color: '#4f46e5' },
        { name: 'CC Quỹ', value: 1, color: '#ffffff' },
        { name: 'Tiền mặt', value: 1, color: '#52525b' },
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Tài sản & Đầu tư
            </h2>

            {/* 1. Allocation Chart */}
            <div className="h-[18rem]">
                <GlassCard title={<span className="font-bold text-lg text-zinc-900 dark:text-white">Cơ cấu Tài sản</span>} className="h-full">
                    <div className="flex flex-col h-full">
                        <div className="flex-1 min-h-[150px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={allocationData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        {allocationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={hasData ? entry.color : '#27272a'} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => hasData && !isPrivacyMode ? formatCurrency(value) : (isPrivacyMode ? '••••••' : `${value}%`)}
                                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff', fontSize: '12px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)', fontWeight: 600 }}
                                        itemStyle={{ color: 'inherit' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-80">
                                <Wallet size={32} className="text-zinc-300 dark:text-zinc-600 mb-1" strokeWidth={2} />
                            </div>
                        </div>
                        {/* Legend */}
                        <div className="flex justify-center gap-4 mt-2">
                            {hasData && allocationData.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-zinc-400">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </GlassCard>
            </div>


            {/* 2. STOCKS GRID */}
            <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                    Cổ phiếu đang nắm giữ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    {stockAssets.map((stock) => (
                        <div key={stock.symbol} className="h-[240px]">
                            <StockCard stock={stock} />
                        </div>
                    ))}
                    {stockAssets.length === 0 && (
                        <div className="col-span-full h-[200px] flex flex-col gap-3 items-center justify-center border-2 border-dashed border-zinc-800 rounded-3xl text-zinc-500">
                            <ServerOff size={24} />
                            <span className="text-sm font-semibold">Chưa có cổ phiếu</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. FUNDS LIST */}
            <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                    Chứng chỉ quỹ
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    {fundAssets.map((fund) => (
                        <div key={fund.symbol} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-white/5 group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-black dark:text-white font-bold text-xs border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                    {fund.symbol[0]}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-zinc-900 dark:text-white">{fund.symbol}</div>
                                    <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{fund.name}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-zinc-900 dark:text-white">
                                    {isPrivacyMode ? '••••••' : formatCurrency(fund.currentPrice * fund.quantity)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
