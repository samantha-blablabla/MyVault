import React from 'react';
import { StockData } from '../types';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
import { formatCurrency } from '../services/dataService';
import { GlassCard } from './ui/GlassCard';
import { useFinance } from '../context/FinanceContext';

interface StockCardProps {
  stock: StockData;
}

export const StockCard: React.FC<StockCardProps> = ({ stock }) => {
  const { isPrivacyMode } = useFinance(); // Removed theme
  
  // Logic: Profit if current price >= avg price
  const isProfit = stock.currentPrice >= stock.avgPrice;
  const percentageChange = stock.avgPrice > 0 ? ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100 : 0;
  const chartData = stock.history.map((val, idx) => ({ i: idx, val }));
  
  // Progress towards target
  const targetProgress = stock.targetQuantity 
    ? Math.min(100, (stock.quantity / stock.targetQuantity) * 100)
    : 0;

  // Chart Color: Lime for Profit (Dark Mode Fixed)
  const chartColor = isProfit 
    ? '#cafc01'
    : '#e11d48'; // Rose 600

  return (
    <GlassCard className="h-full group"> 
      <div className="flex justify-between items-start mb-4 shrink-0">
          <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                  <span className="font-extrabold text-2xl text-zinc-900 dark:text-white tracking-tight">{stock.symbol}</span>
                  {/* NEO-BRUTALISM BADGE: Lime for Profit */}
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-black border ${
                      isProfit 
                      ? 'bg-primary text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-none dark:border-transparent' 
                      : 'bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-transparent'
                  }`}>
                  {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(2)}%
                  </span>
              </div>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate max-w-[140px] uppercase tracking-wide">{stock.name}</span>
          </div>
          <div className="text-right">
              <div className="font-extrabold text-lg text-zinc-900 dark:text-white">
                  {isPrivacyMode ? '••••••' : formatCurrency(stock.currentPrice)}
              </div>
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Vốn: {isPrivacyMode ? '••••••' : formatCurrency(stock.avgPrice)}
              </div>
          </div>
      </div>

      {/* Sparkline */}
      <div className="h-20 -mx-5 mb-2 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
          <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
              <Line 
              type="monotone" 
              dataKey="val" 
              stroke={chartColor} 
              strokeWidth={3} 
              dot={false} 
              />
          </LineChart>
          </ResponsiveContainer>
      </div>

      <div className="flex-1"></div>

      {/* Footer Info */}
      <div className="flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400 mb-3 shrink-0">
          <span className="font-medium">Đang giữ: <span className="text-zinc-900 dark:text-white font-bold">{stock.quantity}</span> cp</span>
          <span className="font-bold text-zinc-900 dark:text-white">
              {isPrivacyMode ? '••••••' : formatCurrency(stock.quantity * stock.currentPrice)}
          </span>
      </div>

      {/* Target Progress */}
      {stock.targetQuantity && (
          <div className="space-y-1.5 shrink-0">
          <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-bold">
              <div className="flex items-center gap-1">
              <Target size={12} />
              <span>Mục tiêu: {stock.targetQuantity}</span>
              </div>
              <span>{Math.round(targetProgress)}%</span>
          </div>
          <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700">
              <div 
              className="h-full bg-primary border-r-2 border-black/20 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${targetProgress}%` }}
              />
          </div>
          </div>
      )}
    </GlassCard>
  );
};