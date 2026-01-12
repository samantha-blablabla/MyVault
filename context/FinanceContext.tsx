import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StockData, BudgetCategory, FixedBill, Transaction, UserState, TransactionType, ShoppingPlan } from '../types';
import { INITIAL_BUDGET, MOCK_TRANSACTIONS, MARKET_PRICES, PRICE_HISTORY, FIXED_BILLS, TOTAL_INCOME } from '../constants';
import { processPortfolioFromTransactions, calculateDailySpendable, calculateSpendingStats, calculateBudgetProgress } from '../services/financeLogic';

interface SpendingStats {
    day: number;
    month: number;
    year: number;
}

interface BudgetRules {
    needs: number;
    invest: number;
    savings: number;
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
  transactions: Transaction[];
  shoppingPlan: ShoppingPlan; // NEW
  
  // Actions
  addTransaction: (tx: Transaction) => void;
  addDailyTransaction: (amount: number, note: string, type: TransactionType.EXPENSE | TransactionType.INCOME) => void;
  deleteTransaction: (id: string) => void;
  editTransaction: (id: string, updatedData: { amount: number, note: string, type: TransactionType }) => void;
  updateBillStatus: (id: string, isPaid: boolean) => void;
  updateBillAmount: (id: string, amount: number) => void;
  addBill: (name: string, amount: number, dueDay: number, category?: FixedBill['category']) => void;
  removeBill: (id: string) => void;
  updateTarget: (symbol: string, quantity: number) => void;
  updateBudgetPlan: (totalIncome: number, rules: BudgetRules) => void;
  refreshPrices: () => void;
  togglePrivacyMode: () => void;
  updateShoppingPlan: (plan: ShoppingPlan) => void; // NEW
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Initial default targets
const DEFAULT_TARGETS: Record<string, number> = { 
    'TCB': 100, 
    'MBB': 100, 
    'CTR': 50, 
    'HPG': 1000 
};

// Initial 50/30/20
const DEFAULT_BUDGET_RULES: BudgetRules = {
    needs: 50,
    invest: 30,
    savings: 20
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
  
  // New State for Income & Rules
  const [monthlyIncome, setMonthlyIncome] = useState<number>(TOTAL_INCOME);
  const [budgetRules, setBudgetRules] = useState<BudgetRules>(DEFAULT_BUDGET_RULES);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  
  // Shopping Plan State
  const [shoppingPlan, setShoppingPlan] = useState<ShoppingPlan>({ name: '', price: 0, fundSource: 'savings', monthlyContribution: 0 });

  // Enforce Dark Mode on Mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.removeItem('finvault_theme');
    
    // Load Shopping Plan
    const savedPlan = localStorage.getItem('finvault_shopping_plan');
    if (savedPlan) {
        try {
            setShoppingPlan(JSON.parse(savedPlan));
        } catch (e) { console.error("Error parsing shopping plan", e); }
    }
  }, []);

  // 1. Recalculate Budget Allocations whenever Monthly Income OR Rules changes
  useEffect(() => {
    setBudget(prevBudget => {
        return prevBudget.map(cat => {
            const pct = budgetRules[cat.id as keyof BudgetRules] || 0;
            return {
                ...cat,
                percentage: pct,
                name: cat.name.split('(')[0].trim() + ` (${pct}%)`, // Update name display
                allocated: monthlyIncome * (pct / 100)
            };
        });
    });
  }, [monthlyIncome, budgetRules]);

  // 2. Recalculate Budget Spending whenever Transactions change
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
  };

  const deleteTransaction = (id: string) => {
      setTransactions(prev => prev.filter(t => t.id !== id));
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
  };

  const updateBillStatus = (id: string, isPaid: boolean) => {
    setFixedBills(prev => prev.map(bill => bill.id === id ? { ...bill, isPaid } : bill));
  };

  const updateBillAmount = (id: string, amount: number) => {
      setFixedBills(prev => prev.map(bill => bill.id === id ? { ...bill, amount } : bill));
  };

  const addBill = (name: string, amount: number, dueDay: number, category: FixedBill['category'] = 'other') => {
      const newBill: FixedBill = {
          id: `bill-${Date.now()}`,
          name,
          amount,
          dueDay,
          isPaid: false,
          category
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

  const updateBudgetPlan = (totalIncome: number, rules: BudgetRules) => {
      setMonthlyIncome(totalIncome);
      setBudgetRules(rules);
  };

  const refreshPrices = () => {
    const calculatedPortfolio = processPortfolioFromTransactions(transactions, MARKET_PRICES, PRICE_HISTORY, targets);
    setPortfolio(calculatedPortfolio);
  };

  const togglePrivacyMode = () => {
      setIsPrivacyMode(prev => !prev);
  };
  
  const updateShoppingPlan = (plan: ShoppingPlan) => {
      setShoppingPlan(plan);
      localStorage.setItem('finvault_shopping_plan', JSON.stringify(plan));
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
      transactions, 
      shoppingPlan,
      addTransaction,
      addDailyTransaction, 
      deleteTransaction,
      editTransaction,
      updateBillStatus,
      updateBillAmount,
      addBill,
      removeBill,
      updateTarget,
      updateBudgetPlan, 
      refreshPrices,
      togglePrivacyMode,
      updateShoppingPlan
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