import React, { useState } from 'react';
import { StockData, AssetType } from '../../types';
import { formatCurrency } from '../../services/dataService';
import { TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';

interface HoldingsTableProps {
    assets: StockData[];
    onBuy: (asset: StockData) => void;
    onSell: (asset: StockData) => void;
    isLoading?: boolean;
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({ assets, onBuy, onSell, isLoading }) => {
    // Sort State: default -> asc (Low->High) -> desc (High->Low)
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | 'default'>('default');

    const toggleSort = () => {
        if (sortDirection === 'default') setSortDirection('asc');
        else if (sortDirection === 'asc') setSortDirection('desc');
        else setSortDirection('default');
    };

    const sortedAssets = assets
        .filter(asset => asset.quantity > 0)
        .sort((a, b) => {
            if (sortDirection === 'default') return 0;
            const pnlA = a.pnl || 0;
            const pnlB = b.pnl || 0;
            return sortDirection === 'asc' ? pnlA - pnlB : pnlB - pnlA;
        });

    return (
        <div className="w-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 shadow-sm backdrop-blur-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider border-b border-zinc-100 dark:border-white/5">
                        <tr>
                            <th className="px-6 py-4">Mã CP</th>
                            <th className="px-6 py-4 text-right">Thị giá</th>
                            <th className="px-6 py-4 text-right">Giá Mua TB</th>
                            <th className="px-6 py-4 text-right">Khối lượng</th>
                            <th className="px-6 py-4 text-right">Tổng giá trị</th>
                            <th
                                className="px-6 py-4 text-right cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors select-none"
                                onClick={toggleSort}
                                title="Sắp xếp theo Lãi/Lỗ"
                            >
                                <div className="flex items-center justify-end gap-1">
                                    Lãi / Lỗ
                                    <ArrowUpDown size={12} className={sortDirection !== 'default' ? 'text-primary' : 'opacity-40'} />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                        {sortedAssets.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-zinc-500 italic">
                                    Chưa có dữ liệu đầu tư. Hãy thực hiện giao dịch Mua đầu tiên.
                                </td>
                            </tr>
                        ) : (
                            sortedAssets.map((asset) => {
                                const isPnLPositive = (asset.pnl || 0) >= 0;
                                // Day change logic: Green if >= 0 (Reference or Up), Red if < 0.
                                const isDayPositive = (asset.dayChange || 0) >= 0;

                                return (
                                    <tr key={asset.symbol} className="group hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors">
                                        {/* Symbol & Name */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] text-white shadow-lg ${asset.type === AssetType.Fund ? 'bg-orange-500 shadow-orange-500/20' : 'bg-primary shadow-primary/20'
                                                    }`}>
                                                    {asset.symbol.substring(0, 3)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-zinc-900 dark:text-white">{asset.symbol}</div>
                                                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 max-w-[120px] truncate">{asset.name}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Market Price (Dynamic Color per Day Change) */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <div className={`font-bold flex items-center gap-1 ${isDayPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {formatCurrency(asset.currentPrice)}
                                                    {isLoading && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />}
                                                </div>
                                                {/* Only show change if it exists/is valid */}
                                                {asset.dayChange !== undefined && (
                                                    <div className={`text-[10px] font-medium opacity-90 ${isDayPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {isDayPositive ? '+' : ''}{formatCurrency(asset.dayChange)}
                                                        <span className="ml-1">({isDayPositive ? '+' : ''}{asset.dayChangePercent?.toFixed(2)}%)</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Avg Price (Neutral) */}
                                        <td className="px-6 py-4 text-right text-zinc-500 font-medium">
                                            {formatCurrency(asset.avgPrice)}
                                        </td>

                                        {/* Quantity */}
                                        <td className="px-6 py-4 text-right font-medium text-zinc-900 dark:text-zinc-200">
                                            {asset.quantity.toLocaleString()}
                                        </td>

                                        {/* Market Value */}
                                        <td className="px-6 py-4 text-right font-bold text-zinc-900 dark:text-white">
                                            {formatCurrency(asset.marketValue || 0)}
                                        </td>

                                        {/* PnL (Dynamic Color per Holding Performance) */}
                                        <td className="px-6 py-4 text-right">
                                            <div className={`flex flex-col items-end ${isPnLPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                <div className="flex items-center gap-1 font-bold">
                                                    {isPnLPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                    {formatCurrency(Math.abs(asset.pnl || 0))}
                                                </div>
                                                <div className="text-[10px] font-medium opacity-80 bg-current/10 px-1.5 py-0.5 rounded">
                                                    {isPnLPositive ? '+' : '-'}{Math.abs(asset.pnlPercent || 0).toFixed(2)}%
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
