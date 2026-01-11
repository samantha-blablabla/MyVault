import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as PieTooltip, BarChart, Bar, XAxis, YAxis, Tooltip as BarTooltip, Legend } from 'recharts';
import { BudgetCategory } from '../types';
import { formatCurrency } from '../services/dataService';
import { GlassCard } from './ui/GlassCard';
import { useFinance } from '../context/FinanceContext';
import { Pencil, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { IncomeModal } from './IncomeModal';
import { getMonthlyHistory } from '../services/financeLogic';

interface BudgetOverviewProps {
  budgets: BudgetCategory[];
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ budgets }) => {
  const { isPrivacyMode, transactions, monthlyIncome } = useFinance();
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'current' | 'history'>('current');
  
  const totalAllocated = budgets.reduce((acc, curr) => acc + curr.allocated, 0);
  const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
  const remaining = totalAllocated - totalSpent;

  // Calculate History Data
  const historyData = useMemo(() => {
      return getMonthlyHistory(transactions, monthlyIncome);
  }, [transactions, monthlyIncome]);

  const HeaderAction = (
    <div className="flex items-center gap-3">
        {/* Toggle Switch */}
        <div className="flex bg-black/30 rounded-lg p-1 border border-white/5">
            <button 
                onClick={() => setViewMode('current')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'current' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="Tháng này"
            >
                <PieIcon size={14} />
            </button>
            <button 
                onClick={() => setViewMode('history')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'history' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="Lịch sử"
            >
                <BarChart3 size={14} />
            </button>
        </div>

        <button 
        onClick={() => setIsIncomeModalOpen(true)}
        className="text-zinc-500 hover:text-white transition-colors"
        title="Điều chỉnh kế hoạch & Thu nhập"
        >
            <Pencil size={14} />
        </button>
    </div>
  );

  return (
    <>
    <IncomeModal isOpen={isIncomeModalOpen} onClose={() => setIsIncomeModalOpen(false)} />
    
    <GlassCard title={viewMode === 'current' ? "Kế hoạch Tháng này" : "Xu hướng Tài chính"} action={HeaderAction} className="h-full">
      
      {/* VIEW 1: CURRENT MONTH (PIE) */}
      {viewMode === 'current' && (
          <div className="flex flex-col md:flex-row items-center h-full gap-6 animate-fade-in">
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
                <PieTooltip 
                    formatter={(value: number) => isPrivacyMode ? '••••••' : formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff', fontFamily: 'Plus Jakarta Sans' }}
                />
                </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-zinc-500 text-xs uppercase tracking-wider">Tổng thu nhập</span>
                <span className="text-white font-bold">
                    {isPrivacyMode ? '••••••' : formatCurrency(totalAllocated)}
                </span>
            </div>
            </div>

            {/* Legend / Detail Section */}
            <div className="flex-1 w-full space-y-4">
                {budgets.map((cat) => {
                    const percentSpent = cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0;
                    return (
                        <div key={cat.id} className="group">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-zinc-300 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                    {cat.name}
                                </span>
                                <span className="font-bold text-zinc-400 text-xs">
                                    {isPrivacyMode 
                                        ? '••••••' 
                                        : `${formatCurrency(cat.spent)} / ${formatCurrency(cat.allocated)}`
                                    }
                                </span>
                            </div>
                            {/* Progress Bar for specific category */}
                            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{ 
                                        width: `${Math.min(percentSpent, 100)}%`,
                                        backgroundColor: cat.color 
                                    }}
                                />
                            </div>
                        </div>
                    )
                })}
                
                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-xs text-zinc-500 uppercase">Còn lại trong tháng</span>
                    <span className="text-emerald-400 font-bold text-lg">
                        {isPrivacyMode ? '••••••' : formatCurrency(remaining)}
                    </span>
                </div>
            </div>
        </div>
      )}

      {/* VIEW 2: HISTORY (STACKED BAR) */}
      {viewMode === 'history' && (
          <div className="h-full flex flex-col animate-fade-in">
              <div className="flex-1 min-h-[180px] w-full mt-2 -ml-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={historyData} barSize={20}>
                          <XAxis 
                            dataKey="month" 
                            stroke="#52525b" 
                            tick={{fontSize: 10, fill: '#71717a'}} 
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis hide />
                          <BarTooltip 
                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '12px' }}
                            formatter={(value: number) => isPrivacyMode ? '••••••' : formatCurrency(value)}
                          />
                          <Legend iconType="circle" wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />
                          <Bar name="Thiết yếu" dataKey="needs" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                          <Bar name="Đầu tư" dataKey="invest" stackId="a" fill="#10b981" />
                          <Bar name="Dư/Tiết kiệm" dataKey="savings" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-zinc-600 text-center mt-2 italic">
                  Dữ liệu 6 tháng gần nhất. Giúp bạn nhận ra xu hướng chi tiêu để điều chỉnh kế hoạch.
              </p>
          </div>
      )}

    </GlassCard>
    </>
  );
};