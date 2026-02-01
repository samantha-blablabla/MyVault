import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { StockData } from '../../types';
import { formatCurrency } from '../../services/dataService';
import { TrendingUp, TrendingDown, MoreHorizontal, PieChart } from 'lucide-react';

interface FundsTableProps {
    assets: StockData[];
    isLoading?: boolean;
    onBuy: (asset?: StockData) => void;
    onSell: (asset: StockData) => void;
}

export const FundsTable: React.FC<FundsTableProps> = ({ assets, isLoading, onBuy, onSell }) => {
    // Filter for Funds only
    const funds = assets.filter(a => a.type === 'FUND');

    if (funds.length === 0) {
        return (
            <GlassCard className="overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                        <PieChart size={20} className="text-purple-500" />
                        Chứng chỉ Quỹ (Funds)
                    </h3>
                </div>
                <div className="text-center py-12 text-zinc-400 dark:text-zinc-500">
                    <p className="text-sm">Chưa có danh mục Chứng chỉ Quỹ.</p>
                    <p className="text-xs mt-1">Tích sản dài hạn với ETF hoặc Quỹ mở.</p>
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-200 dark:border-white/5">
                            <th className="text-left text-[10px] uppercase font-bold text-zinc-500 pb-3 pl-2">Mã Quỹ</th>
                            <th className="text-right text-[10px] uppercase font-bold text-zinc-500 pb-3">NAV/CCQ</th>
                            <th className="text-right text-[10px] uppercase font-bold text-zinc-500 pb-3">Giá Mua TB</th>
                            <th className="text-right text-[10px] uppercase font-bold text-zinc-500 pb-3">Khối lượng</th>
                            <th className="text-right text-[10px] uppercase font-bold text-zinc-500 pb-3">Tổng giá trị</th>
                            <th className="text-right text-[10px] uppercase font-bold text-zinc-500 pb-3 pr-2">Lãi / Lỗ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
                        {funds.map((asset) => {
                            const pnlColor = (asset.pnl || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500';
                            const pnlPercent = (asset.marketValue && asset.marketValue > 0)
                                ? ((asset.pnl || 0) / (asset.quantity * asset.avgPrice)) * 100
                                : 0;
                            const isDayPositive = (asset.dayChange || 0) >= 0;

                            return (
                                <tr key={asset.symbol} className="group hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="py-4 pl-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-[10px]">
                                                {asset.symbol.substring(0, 3)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-zinc-900 dark:text-white">{asset.symbol}</div>
                                                <div className="text-[10px] text-zinc-500">{asset.name}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* NAV/CCQ (Current Price) */}
                                    <td className="py-4 text-right">
                                        <div className="flex flex-col items-end">
                                            <div className={`font-bold text-sm ${isDayPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {formatCurrency(asset.currentPrice)}
                                            </div>
                                            {asset.dayChange !== undefined && (
                                                <div className={`text-[10px] font-medium opacity-80 ${isDayPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {isDayPositive ? '+' : ''}{formatCurrency(asset.dayChange)}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Avg Price (Gia Mua TB) */}
                                    <td className="py-4 text-right text-xs text-zinc-500 font-medium">
                                        {formatCurrency(asset.avgPrice)}
                                    </td>

                                    <td className="py-4 text-right">
                                        <div className="font-bold text-sm text-zinc-900 dark:text-white">
                                            {asset.quantity.toLocaleString()}
                                        </div>
                                    </td>

                                    <td className="py-4 text-right font-bold text-sm text-zinc-900 dark:text-white">
                                        {formatCurrency(asset.marketValue || 0)}
                                    </td>
                                    <td className="py-4 text-right pr-2">
                                        <div className={`font-bold text-sm ${pnlColor}`}>
                                            {(asset.pnl || 0) > 0 ? '+' : ''}{formatCurrency(asset.pnl || 0)}
                                        </div>
                                        <div className={`text-[10px] font-bold ${pnlColor}`}>
                                            {(asset.pnl || 0) > 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </GlassCard>
    );
};
