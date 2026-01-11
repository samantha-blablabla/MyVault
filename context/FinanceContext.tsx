import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StockData, BudgetCategory, FixedBill, Transaction, UserState } from '../types';
import { INITIAL_BUDGET, MOCK_TRANSACTIONS, MARKET_PRICES, PRICE_HISTORY, FIXED_BILLS } from '../constants';
import { processPortfolioFromTransactions, calculateDailySpendable } from '../services/financeLogic';

interface FinanceContextType {
  // State
  portfolio: StockData[];
  budget: BudgetCategory[];
  fixedBills: FixedBill[];
  dailySpendable: number;
  daysRemaining: number;
  
  // Actions
  addTransaction: (tx: Transaction) => void;
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
      addTransaction,
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
