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
  const { isPrivacyMode, transactions, monthlyIncome } = useFinance(); // Removed theme
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'current' | 'history'>('current');
  
  const totalAllocated = budgets.reduce((acc, curr) => acc + curr.allocated, 0);
  const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
  const remaining = totalAllocated - totalSpent;

  // Calculate History Data
  const historyData = useMemo(() => {
      return getMonthlyHistory(transactions, monthlyIncome);
  }, [transactions, monthlyIncome]);

  // Adjust Budget Colors for Neo-Brutalism (Dark Mode Fixed)
  // Invest -> #cafc01 (Lime)
  // Needs -> #ffffff (White in Dark Mode)
  // Savings -> #52525b (Zinc 600)
  
  const displayBudgets = budgets.map(b => {
      if(b.id === 'invest') return { ...b, color: '#cafc01' };
      if(b.id === 'needs') return { ...b, color: '#ffffff' };
      if(b.id === 'savings') return { ...b, color: '#52525b' }; 
      return b;
  });

  const HeaderAction = (
    <div className="flex items-center gap-3">
        {/* Toggle Switch */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 border border-zinc-300 dark:border-zinc-700">
            <button 
                onClick={() => setViewMode('current')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'current' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-hard-sm dark:shadow-sm border border-black dark:border-zinc-600' : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200'}`}
                title="Tháng này"
            >
                <PieIcon size={14} />
            </button>
            <button 
                onClick={() => setViewMode('history')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'history' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-hard-sm dark:shadow-sm border border-black dark:border-zinc-600' : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200'}`}
                title="Lịch sử"
            >
                <BarChart3 size={14} />
            </button>
        </div>

        <button 
        onClick={() => setIsIncomeModalOpen(true)}
        className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
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
                    data={displayBudgets}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="allocated"
                    stroke="none"
                >
                    {displayBudgets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" strokeWidth={0} />
                    ))}
                </Pie>
                <PieTooltip 
                    formatter={(value: number) => isPrivacyMode ? '••••••' : formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#000', borderWidth: '2px', color: '#000', fontFamily: 'Plus Jakarta Sans', borderRadius: '8px', boxShadow: '4px 4px 0px 0px #000' }}
                />
                </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Tổng thu nhập</span>
                <span className="text-black dark:text-white font-black text-lg">
                    {isPrivacyMode ? '••••••' : formatCurrency(totalAllocated)}
                </span>
            </div>
            </div>

            {/* Legend / Detail Section */}
            <div className="flex-1 w-full space-y-4">
                {displayBudgets.map((cat) => {
                    const percentSpent = cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0;
                    return (
                        <div key={cat.id} className="group">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-2 font-bold uppercase text-xs">
                                    <div className="w-3 h-3 border border-black dark:border-transparent" style={{ backgroundColor: cat.color }}></div>
                                    {cat.name.split('(')[0]}
                                </span>
                                <span className="font-bold text-black dark:text-white text-xs">
                                    {isPrivacyMode 
                                        ? '••••••' 
                                        : `${formatCurrency(cat.spent)} / ${formatCurrency(cat.allocated)}`
                                    }
                                </span>
                            </div>
                            {/* Progress Bar for specific category */}
                            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                <div 
                                    className="h-full rounded-full transition-all duration-1000 ease-out border-r border-black/20"
                                    style={{ 
                                        width: `${Math.min(percentSpent, 100)}%`,
                                        backgroundColor: cat.color 
                                    }}
                                />
                            </div>
                        </div>
                    )
                })}
                
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <span className="text-xs text-zinc-500 uppercase font-bold">Còn lại trong tháng</span>
                    {/* Neo-Brutalism Lime Badge for Remaining Amount */}
                    <span className={`text-sm md:text-base px-2 py-0.5 rounded font-black border-2 border-black dark:border-transparent shadow-hard-sm dark:shadow-none ${
                        remaining >= 0 
                        ? 'bg-primary text-black' 
                        : 'bg-rose-500 text-white'
                    }`}>
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
                      <BarChart data={historyData} barSize={24}>
                          <XAxis 
                            dataKey="month" 
                            stroke="#71717a" 
                            tick={{fontSize: 10, fill: '#71717a', fontWeight: 700}} 
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis hide />
                          <BarTooltip 
                            cursor={{fill: 'rgba(0,0,0,0.05)'}}
                            contentStyle={{ backgroundColor: '#fff', borderColor: '#000', borderWidth: '2px', borderRadius: '8px', fontSize: '12px', boxShadow: '4px 4px 0px 0px #000', color: '#000', fontWeight: 'bold' }}
                            formatter={(value: number) => isPrivacyMode ? '••••••' : formatCurrency(value)}
                          />
                          <Legend iconType="square" wrapperStyle={{fontSize: '10px', paddingTop: '10px', fontWeight: 700}} />
                          {/* Needs: White */}
                          <Bar name="Thiết yếu" dataKey="needs" stackId="a" fill="#ffffff" stroke="#000" strokeWidth={0} />
                          {/* Invest: Lime */}
                          <Bar name="Đầu tư" dataKey="invest" stackId="a" fill="#cafc01" stroke="#000" strokeWidth={0} />
                          {/* Savings: Zinc 600 */}
                          <Bar name="Dư/Tiết kiệm" dataKey="savings" stackId="a" fill="#52525b" stroke="#000" strokeWidth={0} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-zinc-500 text-center mt-2 italic font-medium">
                  Dữ liệu 6 tháng gần nhất.
              </p>
          </div>
      )}

    </GlassCard>
    </>
  );
};