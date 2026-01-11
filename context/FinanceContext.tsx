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
  
  // Actions
  addTransaction: (tx: Transaction) => void;
  addExpense: (amount: number, note: string) => void;
  updateBillStatus: (id: string, isPaid: boolean) => void;
  refreshPrices: () => void; // Simulate n8n sync
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [budget, setBudget] = useState<BudgetCategory[]>(INITIAL_BUDGET);
  const [fixedBills, setFixedBills] = useState<FixedBill[]>(FIXED_BILLS);
  const [portfolio, setPortfolio] = useState<StockData[]>([]);
  const [dailySpendable, setDailySpendable] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [spendingStats, setSpendingStats] = useState<SpendingStats>({ day: 0, month: 0, year: 0 });

  // 1. Recalculate Portfolio whenever transactions change
  useEffect(() => {
    const calculatedPortfolio = processPortfolioFromTransactions(transactions, MARKET_PRICES, PRICE_HISTORY);
    // Add missing stocks that have 0 quantity but are in targets (like CTR)
    if (!calculatedPortfolio.find(s => s.symbol === 'CTR')) {
        calculatedPortfolio.push({
            symbol: 'CTR', name: 'Viettel Constr', quantity: 0, targetQuantity: 50, avgPrice: 0, 
            currentPrice: MARKET_PRICES['CTR'], history: PRICE_HISTORY['CTR'], type: 'STOCK' as any
        });
    }
    setPortfolio(calculatedPortfolio);

    // Calculate Spending Stats
    const stats = calculateSpendingStats(transactions);
    setSpendingStats(stats);

  }, [transactions]);

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
    // 1. Update the 'spent' amount for 'needs' category in Budget View
    setBudget(prev => prev.map(cat => 
        cat.id === 'needs' 
            ? { ...cat, spent: cat.spent + amount } 
            : cat
    ));

    // 2. Create a Transaction record for History & Stats
    const expenseTx: Transaction = {
        id: `exp-${Date.now()}`,
        date: new Date().toISOString(),
        symbol: 'EXP', // Dummy symbol
        type: TransactionType.EXPENSE,
        quantity: 1,
        price: amount,
        notes: note
    };
    
    setTransactions(prev => [...prev, expenseTx]);
    console.log(`Expense added: ${amount} for ${note}`);
  };

  const updateBillStatus = (id: string, isPaid: boolean) => {
    setFixedBills(prev => prev.map(bill => bill.id === id ? { ...bill, isPaid } : bill));
  };

  const refreshPrices = () => {
    // In real app, call API here. For now, we trigger a re-calc
    const calculatedPortfolio = processPortfolioFromTransactions(transactions, MARKET_PRICES, PRICE_HISTORY);
    setPortfolio(calculatedPortfolio);
  };

  return (
    <FinanceContext.Provider value={{
      portfolio,
      budget,
      fixedBills,
      dailySpendable,
      daysRemaining,
      spendingStats,
      addTransaction,
      addExpense,
      updateBillStatus,
      refreshPrices
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