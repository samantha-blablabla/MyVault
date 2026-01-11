import React from 'react';
import { StockData } from '../types';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
import { formatCurrency } from '../services/dataService';
import { GlassCard } from './ui/GlassCard';

interface StockCardProps {
  stock: StockData;
}

export const StockCard: React.FC<StockCardProps> = ({ stock }) => {
  const isProfit = stock.currentPrice >= stock.avgPrice;
  const percentageChange = ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100;
  const chartData = stock.history.map((val, idx) => ({ i: idx, val }));
  
  // Progress towards target (e.g., 100 shares)
  const targetProgress = stock.targetQuantity 
    ? Math.min(100, (stock.quantity / stock.targetQuantity) * 100)
    : 0;

  return (
    <GlassCard className="h-full group">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-4 shrink-0">
            <div className="flex flex-col">
            <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">{stock.symbol}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${isProfit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(2)}%
                </span>
            </div>
            <span className="text-xs text-zinc-500">{stock.name}</span>
            </div>
            <div className="text-right">
            <div className="font-mono text-lg font-medium text-white">
                {formatCurrency(stock.currentPrice)}
            </div>
            <div className="text-xs text-zinc-500">
                Vốn: {formatCurrency(stock.avgPrice)}
            </div>
            </div>
        </div>

        {/* Sparkline */}
        <div className="h-20 -mx-2 mb-4 opacity-70 group-hover:opacity-100 transition-opacity shrink-0">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
                <Line 
                type="monotone" 
                dataKey="val" 
                stroke={isProfit ? '#10b981' : '#f43f5e'} 
                strokeWidth={2} 
                dot={false} 
                />
            </LineChart>
            </ResponsiveContainer>
        </div>

        <div className="flex-1"></div>

        {/* Footer Info */}
        <div className="flex justify-between items-center text-xs text-zinc-400 mb-2 shrink-0">
            <span>Đang giữ: <span className="text-white font-mono">{stock.quantity}</span> cp</span>
            <span className="font-mono text-zinc-500">
                {formatCurrency(stock.quantity * stock.currentPrice)}
            </span>
        </div>

        {/* Target Progress */}
        {stock.targetQuantity && (
            <div className="space-y-1 shrink-0">
            <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                <Target size={10} />
                <span>Mục tiêu: {stock.targetQuantity}</span>
                </div>
                <span>{Math.round(targetProgress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full animate-[width_1s_ease-out]"
                style={{ width: `${targetProgress}%` }}
                />
            </div>
            </div>
        )}
      </div>
    </GlassCard>
  );
};