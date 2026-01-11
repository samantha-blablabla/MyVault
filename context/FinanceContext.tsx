import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StockData, BudgetCategory, FixedBill, Transaction, UserState, TransactionType } from '../types';
import { INITIAL_BUDGET, MOCK_TRANSACTIONS, MARKET_PRICES, PRICE_HISTORY, FIXED_BILLS, TOTAL_INCOME } from '../constants';
import { processPortfolioFromTransactions, calculateDailySpendable, calculateSpendingStats, calculateBudgetProgress } from '../services/financeLogic';

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
  isPrivacyMode: boolean;
  monthlyIncome: number;
  transactions: Transaction[]; // EXPOSED NOW
  
  // Actions
  addTransaction: (tx: Transaction) => void;
  addDailyTransaction: (amount: number, note: string, type: TransactionType.EXPENSE | TransactionType.INCOME) => void;
  deleteTransaction: (id: string) => void;
  editTransaction: (id: string, updatedData: { amount: number, note: string, type: TransactionType }) => void;
  updateBillStatus: (id: string, isPaid: boolean) => void;
  updateBillAmount: (id: string, amount: number) => void;
  addBill: (name: string, amount: number, dueDay: number) => void;
  removeBill: (id: string) => void;
  updateTarget: (symbol: string, quantity: number) => void;
  updateIncome: (amount: number) => void;
  refreshPrices: () => void;
  togglePrivacyMode: () => void;
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
  
  // New State for Income
  const [monthlyIncome, setMonthlyIncome] = useState<number>(TOTAL_INCOME);
  const [isPrivacyMode, setIsPrivacyMode] = useState(true);

  // 1. Recalculate Budget Allocations whenever Monthly Income changes
  useEffect(() => {
    setBudget(prevBudget => {
        return prevBudget.map(cat => ({
            ...cat,
            // Recalculate allocated amount based on percentage (50/30/20)
            allocated: monthlyIncome * (cat.percentage / 100)
        }));
    });
  }, [monthlyIncome]);

  // 2. Recalculate Budget Spending whenever Transactions change
  // This ensures 'spent' is always in sync with the history, even after edits/deletes
  useEffect(() => {
      setBudget(prevBudget => calculateBudgetProgress(prevBudget, transactions));
  }, [transactions]);

  // 3. Recalculate Portfolio & Stats
  useEffect(() => {
    const calculatedPortfolio = processPortfolioFromTransactions(
        transactions, 
        MARKET_PRICES, 
        PRICE_HISTORY, 
        targets
    );
    
    Object.keys(targets).forEach(targetSym => {
        if (!calculatedPortfolio.find(s => s.symbol === targetSym)) {
             calculatedPortfolio.push({
                symbol: targetSym, 
                name: targetSym === 'CTR' ? 'Viettel Constr' : targetSym,
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
    const stats = calculateSpendingStats(transactions);
    setSpendingStats(stats);

  }, [transactions, targets]);

  // 4. Recalculate Daily Spendable
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

  const addDailyTransaction = (amount: number, note: string, type: TransactionType.EXPENSE | TransactionType.INCOME) => {
    const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        date: new Date().toISOString(),
        symbol: type === TransactionType.INCOME ? 'IN' : 'EXP', 
        type: type,
        quantity: 1,
        price: amount,
        notes: note
    };
    
    setTransactions(prev => [...prev, newTx]);
    // NOTE: We no longer manually update 'budget' state here. 
    // The useEffect [transactions] will handle the recalculation automatically.
  };

  const deleteTransaction = (id: string) => {
      setTransactions(prev => prev.filter(t => t.id !== id));
      // Budget recalculation is handled by useEffect
  };

  const editTransaction = (id: string, updatedData: { amount: number, note: string, type: TransactionType }) => {
      setTransactions(prev => prev.map(t => 
          t.id === id 
          ? { 
              ...t, 
              price: updatedData.amount, 
              notes: updatedData.note, 
              type: updatedData.type,
              symbol: updatedData.type === TransactionType.INCOME ? 'IN' : 'EXP'
            } 
          : t
      ));
      // Budget recalculation is handled by useEffect
  };

  const updateBillStatus = (id: string, isPaid: boolean) => {
    setFixedBills(prev => prev.map(bill => bill.id === id ? { ...bill, isPaid } : bill));
  };

  const updateBillAmount = (id: string, amount: number) => {
      setFixedBills(prev => prev.map(bill => bill.id === id ? { ...bill, amount } : bill));
  };

  const addBill = (name: string, amount: number, dueDay: number) => {
      const newBill: FixedBill = {
          id: `bill-${Date.now()}`,
          name,
          amount,
          dueDay,
          isPaid: false
      };
      setFixedBills(prev => [...prev, newBill]);
  };

  const removeBill = (id: string) => {
      setFixedBills(prev => prev.filter(bill => bill.id !== id));
  };

  const updateTarget = (symbol: string, quantity: number) => {
      setTargets(prev => ({
          ...prev,
          [symbol]: quantity
      }));
  };

  const updateIncome = (amount: number) => {
      setMonthlyIncome(amount);
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
      monthlyIncome,
      transactions, // Exposed
      addTransaction,
      addDailyTransaction, 
      deleteTransaction,
      editTransaction,
      updateBillStatus,
      updateBillAmount,
      addBill,
      removeBill,
      updateTarget,
      updateIncome,
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