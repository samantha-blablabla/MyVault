import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StockData, BudgetCategory, FixedBill, Transaction, UserState, TransactionType } from '../types';
import { INITIAL_BUDGET, MOCK_TRANSACTIONS, MARKET_PRICES, PRICE_HISTORY, FIXED_BILLS } from '../constants';
import { processPortfolioFromTransactions, calculateDailySpendable, calculateSpendingStats } from '../services/financeLogic';

interface SpendingStats {
    day: number;
    month: number;
    year: number;
}

interface FinanceContextType {
  // State
  portfolio: StockData[];
  budget: BudgetCategory[];
  fixedBills: FixedBill[];
  dailySpendable: number;
  daysRemaining: number;
  spendingStats: SpendingStats;
  targets: Record<string, number>;
  isPrivacyMode: boolean; // New State
  
  // Actions
  addTransaction: (tx: Transaction) => void;
  addExpense: (amount: number, note: string) => void;
  updateBillStatus: (id: string, isPaid: boolean) => void;
  updateTarget: (symbol: string, quantity: number) => void;
  refreshPrices: () => void; // Simulate n8n sync
  togglePrivacyMode: () => void; // New Action
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Initial default targets
const DEFAULT_TARGETS: Record<string, number> = { 
    'TCB': 100, 
    'MBB': 100, 
    'CTR': 50, 
    'HPG': 1000 
};

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [budget, setBudget] = useState<BudgetCategory[]>(INITIAL_BUDGET);
  const [fixedBills, setFixedBills] = useState<FixedBill[]>(FIXED_BILLS);
  const [portfolio, setPortfolio] = useState<StockData[]>([]);
  const [dailySpendable, setDailySpendable] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [spendingStats, setSpendingStats] = useState<SpendingStats>({ day: 0, month: 0, year: 0 });
  const [targets, setTargets] = useState<Record<string, number>>(DEFAULT_TARGETS);
  
  // Default to TRUE to hide money by default
  const [isPrivacyMode, setIsPrivacyMode] = useState(true);

  // 1. Recalculate Portfolio whenever transactions OR targets change
  useEffect(() => {
    const calculatedPortfolio = processPortfolioFromTransactions(
        transactions, 
        MARKET_PRICES, 
        PRICE_HISTORY, 
        targets // Pass dynamic targets
    );
    
    // Add missing stocks that have 0 quantity but are in targets (like CTR)
    Object.keys(targets).forEach(targetSym => {
        if (!calculatedPortfolio.find(s => s.symbol === targetSym)) {
             calculatedPortfolio.push({
                symbol: targetSym, 
                name: targetSym === 'CTR' ? 'Viettel Constr' : targetSym, // Simple fallback naming
                quantity: 0, 
                targetQuantity: targets[targetSym], 
                avgPrice: 0, 
                currentPrice: MARKET_PRICES[targetSym] || 0, 
                history: PRICE_HISTORY[targetSym] || [], 
                type: 'STOCK' as any
            });
        }
    });

    setPortfolio(calculatedPortfolio);

    // Calculate Spending Stats
    const stats = calculateSpendingStats(transactions);
    setSpendingStats(stats);

  }, [transactions, targets]);

  // 2. Recalculate Daily Spendable
  useEffect(() => {
    const needsBudget = budget.find(b => b.id === 'needs');
    if (needsBudget) {
      const { dailyAmount, daysRemaining } = calculateDailySpendable(needsBudget.allocated, needsBudget.spent, fixedBills);
      setDailySpendable(dailyAmount);
      setDaysRemaining(daysRemaining);
    }
  }, [budget, fixedBills]);

  // Actions
  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => [...prev, tx]);
  };

  const addExpense = (amount: number, note: string) => {
    setBudget(prev => prev.map(cat => 
        cat.id === 'needs' 
            ? { ...cat, spent: cat.spent + amount } 
            : cat
    ));

    const expenseTx: Transaction = {
        id: `exp-${Date.now()}`,
        date: new Date().toISOString(),
        symbol: 'EXP', 
        type: TransactionType.EXPENSE,
        quantity: 1,
        price: amount,
        notes: note
    };
    
    setTransactions(prev => [...prev, expenseTx]);
  };

  const updateBillStatus = (id: string, isPaid: boolean) => {
    setFixedBills(prev => prev.map(bill => bill.id === id ? { ...bill, isPaid } : bill));
  };

  const updateTarget = (symbol: string, quantity: number) => {
      setTargets(prev => ({
          ...prev,
          [symbol]: quantity
      }));
  };

  const refreshPrices = () => {
    const calculatedPortfolio = processPortfolioFromTransactions(transactions, MARKET_PRICES, PRICE_HISTORY, targets);
    setPortfolio(calculatedPortfolio);
  };

  const togglePrivacyMode = () => {
      setIsPrivacyMode(prev => !prev);
  };

  return (
    <FinanceContext.Provider value={{
      portfolio,
      budget,
      fixedBills,
      dailySpendable,
      daysRemaining,
      spendingStats,
      targets,
      isPrivacyMode,
      addTransaction,
      addExpense,
      updateBillStatus,
      updateTarget,
      refreshPrices,
      togglePrivacyMode
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};