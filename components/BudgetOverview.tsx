import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BudgetCategory } from '../types';
import { formatCurrency } from '../services/dataService';
import { GlassCard } from './ui/GlassCard';

interface BudgetOverviewProps {
  budgets: BudgetCategory[];
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ budgets }) => {
  const totalAllocated = budgets.reduce((acc, curr) => acc + curr.allocated, 0);
  const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
  const remaining = totalAllocated - totalSpent;

  return (
    <GlassCard title="Kế hoạch 50 / 30 / 20" className="h-full">
      <div className="flex flex-col md:flex-row items-center h-full gap-6">
        
        {/* Chart Section */}
        <div className="relative h-48 w-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={budgets}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="allocated"
                stroke="none"
              >
                {budgets.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                 formatter={(value: number) => formatCurrency(value)}
                 contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-zinc-500 text-xs uppercase tracking-wider">Tổng thu nhập</span>
            <span className="text-white font-mono font-bold">{formatCurrency(totalAllocated)}</span>
          </div>
        </div>

        {/* Legend / Detail Section */}
        <div className="flex-1 w-full space-y-4">
            {budgets.map((cat) => {
                const percentSpent = (cat.spent / cat.allocated) * 100;
                return (
                    <div key={cat.id} className="group">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-zinc-300 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                {cat.name}
                            </span>
                            <span className="font-mono text-zinc-400 text-xs">
                                {formatCurrency(cat.spent)} / {formatCurrency(cat.allocated)}
                            </span>
                        </div>
                        {/* Progress Bar for specific category */}
                        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ 
                                    width: `${percentSpent}%`,
                                    backgroundColor: cat.color 
                                }}
                            />
                        </div>
                    </div>
                )
            })}
            
            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-xs text-zinc-500 uppercase">Còn lại trong tháng</span>
                <span className="text-emerald-400 font-mono font-bold text-lg">{formatCurrency(remaining)}</span>
            </div>
        </div>
      </div>
    </GlassCard>
  );
};
