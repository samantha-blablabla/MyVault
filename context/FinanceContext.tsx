import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StockData, BudgetCategory, FixedBill, Transaction, UserState, TransactionType, ShoppingPlan, FinancialGoal } from '../types';
import { INITIAL_BUDGET, MOCK_TRANSACTIONS, MARKET_PRICES, PRICE_HISTORY, FIXED_BILLS, TOTAL_INCOME } from '../constants';
import { processPortfolioFromTransactions, calculateDailySpendable, calculateSpendingStats, calculateBudgetProgress } from '../services/financeLogic';
import { getTransactions, saveTransaction, getMarketSignals, deleteTransaction as apiDeleteTransaction, updateTransaction as apiUpdateTransaction } from '../services/dataService';


interface SpendingStats {
  day: number;
  month: number;
  year: number;
  week: number;
  lastWeek: number;
}

interface BudgetRules {
  needs: number;
  invest: number;
  savings: number;
}

interface FinanceContextType {
  // State
  user: UserState; // New
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
  shoppingPlan: ShoppingPlan;
  goals: FinancialGoal[];

  // Actions
  login: (name: string) => void; // New
  logout: () => void; // New
  addTransaction: (tx: Transaction) => void;
  addDailyTransaction: (amount: number, note: string, type: TransactionType.EXPENSE | TransactionType.INCOME) => void;
  deleteTransaction: (id: string) => void;
  editBill: (id: string, data: { name: string, amount: number, dueDay: number }) => void;
  updateBillStatus: (id: string, isPaid: boolean) => void;
  updateBillAmount: (id: string, amount: number) => void;
  addBill: (name: string, amount: number, dueDay: number, category?: FixedBill['category']) => void;
  removeBill: (id: string) => void;
  updateTarget: (symbol: string, quantity: number) => void;
  updateBudgetPlan: (totalIncome: number, rules: BudgetRules) => void;
  refreshPrices: () => void;
  togglePrivacyMode: () => void;
  updateShoppingPlan: (plan: ShoppingPlan) => void;
  updatePrices: (prices: Record<string, number>) => void; // New method for Real-time updates
  addGoal: (goal: FinancialGoal) => void;
  updateGoal: (id: string, goal: FinancialGoal) => void;
  deleteGoal: (id: string) => void;
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

// HELPER: Safe JSON Parse with Fallback
const safeParse = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    console.warn(`Error parsing ${key}, resetting to default.`, e);
    localStorage.removeItem(key);
    return fallback;
  }
};

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- STATE ---
  const [dataLoaded, setDataLoaded] = useState(false);

  // Auth State
  const [user, setUser] = useState<UserState>(() =>
    safeParse('finvault_user', { isAuthenticated: false, name: '', totalNetWorth: 0 })
  );

  // Transaction State (Migrated to v4 to force sync real data - Fixed HPG Price)
  const [transactions, setTransactions] = useState<Transaction[]>(() => safeParse('finvault_transactions_v4', MOCK_TRANSACTIONS));
  const [fixedBills, setFixedBills] = useState<FixedBill[]>(() => safeParse('finvault_bills', FIXED_BILLS));
  const [targets, setTargets] = useState<Record<string, number>>(() => safeParse('finvault_targets', DEFAULT_TARGETS));

  const [monthlyIncome, setMonthlyIncome] = useState<number>(() => {
    return safeParse<number>('finvault_income_v2', TOTAL_INCOME);
  });

  const [budgetRules, setBudgetRules] = useState<BudgetRules>(() => safeParse('finvault_budget_rules', DEFAULT_BUDGET_RULES));
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => safeParse('finvault_privacy', false));
  const [shoppingPlan, setShoppingPlan] = useState<ShoppingPlan>(() =>
    safeParse('finvault_shopping_plan', { name: '', price: 0, fundSource: 'savings', monthlyContribution: 0 } as ShoppingPlan)
  );

  const [goals, setGoals] = useState<FinancialGoal[]>(() => safeParse('finvault_goals', []));

  // Derived State
  const [budget, setBudget] = useState<BudgetCategory[]>(INITIAL_BUDGET);
  const [portfolio, setPortfolio] = useState<StockData[]>([]);
  const [dailySpendable, setDailySpendable] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [spendingStats, setSpendingStats] = useState<SpendingStats>({ day: 0, month: 0, year: 0, week: 0, lastWeek: 0 });

  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});

  // --- PERSISTENCE ---
  useEffect(() => { localStorage.setItem('finvault_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('finvault_transactions_v4', JSON.stringify(transactions)); }, [transactions]); // v4
  useEffect(() => { localStorage.setItem('finvault_bills', JSON.stringify(fixedBills)); }, [fixedBills]);
  useEffect(() => { localStorage.setItem('finvault_targets', JSON.stringify(targets)); }, [targets]);
  useEffect(() => { localStorage.setItem('finvault_income_v2', JSON.stringify(monthlyIncome)); }, [monthlyIncome]);
  useEffect(() => { localStorage.setItem('finvault_budget_rules', JSON.stringify(budgetRules)); }, [budgetRules]);
  useEffect(() => { localStorage.setItem('finvault_privacy', JSON.stringify(isPrivacyMode)); }, [isPrivacyMode]);
  useEffect(() => { localStorage.setItem('finvault_shopping_plan', JSON.stringify(shoppingPlan)); }, [shoppingPlan]);
  useEffect(() => { localStorage.setItem('finvault_goals', JSON.stringify(goals)); }, [goals]);


  // Enforce Dark Mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.removeItem('finvault_theme');
  }, []);

  // --- API & DATA SYNC ---
  useEffect(() => {
    const fetchApiData = async () => {
      try {
        // 1. Fetch Remote Data (if any)
        const [remoteTransactions, marketSignals] = await Promise.all([
          getTransactions(),
          getMarketSignals()
        ]);

        if (remoteTransactions && remoteTransactions.length > 0) setTransactions(remoteTransactions);

        // Data Loaded
        if (marketSignals && marketSignals.length > 0) {
          const priceMap: Record<string, number> = {};
          marketSignals.forEach((s: any) => { priceMap[s.symbol] = s.price; });
          setCurrentPrices(priceMap);
        }
        setDataLoaded(true);
      } catch (e) {
        console.error("Initialization Failed", e);
      }
    };
    fetchApiData();
  }, []);

  // 1. Budget Allocations
  useEffect(() => {
    setBudget(prevBudget => {
      return prevBudget.map(cat => {
        const pct = budgetRules[cat.id as keyof BudgetRules] || 0;
        return {
          ...cat,
          percentage: pct,
          name: cat.name.split('(')[0].trim() + ` (${pct}%)`,
          allocated: monthlyIncome * (pct / 100)
        };
      });
    });
  }, [monthlyIncome, budgetRules]);

  // 2. Budget Spending
  useEffect(() => {
    setBudget(prevBudget => calculateBudgetProgress(prevBudget, transactions));
  }, [transactions]);

  // 3. Portfolio & Stats
  useEffect(() => {
    const effectivePrices = { ...MARKET_PRICES, ...currentPrices };
    const calculatedPortfolio = processPortfolioFromTransactions(transactions, effectivePrices, PRICE_HISTORY, targets);

    // Ensure targets exist
    Object.keys(targets).forEach(targetSym => {
      if (!calculatedPortfolio.find(s => s.symbol === targetSym)) {
        calculatedPortfolio.push({
          symbol: targetSym,
          name: targetSym === 'CTR' ? 'Viettel Constr' : targetSym,
          quantity: 0,
          targetQuantity: targets[targetSym],
          avgPrice: 0,
          currentPrice: effectivePrices[targetSym] || 0,
          history: PRICE_HISTORY[targetSym] || [],
          type: 'STOCK' as any
        });
      }
    });

    setPortfolio(calculatedPortfolio);
    setSpendingStats(calculateSpendingStats(transactions));
  }, [transactions, targets, currentPrices]);

  // 4. Daily Spendable
  useEffect(() => {
    const needsBudget = budget.find(b => b.id === 'needs');
    if (needsBudget) {
      const { dailyAmount, daysRemaining } = calculateDailySpendable(needsBudget.allocated, needsBudget.spent, fixedBills);
      setDailySpendable(dailyAmount);
      setDaysRemaining(daysRemaining);
    }
  }, [budget, fixedBills]);

  // --- ACTIONS ---

  const login = (name: string) => {
    setUser({ isAuthenticated: true, name, totalNetWorth: 0 });
  };

  const logout = () => {
    setUser({ isAuthenticated: false, name: '', totalNetWorth: 0 });
    localStorage.removeItem('finvault_auth'); // Clean up old legacy key if exists
  };

  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);
    saveTransaction(tx);
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
    setTransactions(prev => [newTx, ...prev]);
    saveTransaction(newTx);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    apiDeleteTransaction(id);
  };

  const editTransaction = (id: string, updatedData: { amount: number, note: string, type: TransactionType }) => {
    const updatedTx: Transaction | undefined = transactions.find(t => t.id === id);
    if (!updatedTx) return;

    const newTx = { ...updatedTx, price: updatedData.amount, notes: updatedData.note, type: updatedData.type, symbol: updatedData.type === TransactionType.INCOME ? 'IN' : 'EXP' };

    setTransactions(prev => prev.map(t =>
      t.id === id ? newTx : t
    ));
    apiUpdateTransaction(newTx);
  };

  const updateBillStatus = (id: string, isPaid: boolean) => {
    setFixedBills(prev => prev.map(bill => bill.id === id ? { ...bill, isPaid } : bill));
  };

  const updateBillAmount = (id: string, amount: number) => {
    setFixedBills(prev => prev.map(bill => bill.id === id ? { ...bill, amount } : bill));
  };

  const editBill = (id: string, data: { name: string, amount: number, dueDay: number }) => {
    setFixedBills(prev => prev.map(bill =>
      bill.id === id ? { ...bill, ...data } : bill
    ));
  };

  const addBill = (name: string, amount: number, dueDay: number, category: FixedBill['category'] = 'other') => {
    const newBill: FixedBill = { id: `bill-${Date.now()}`, name, amount, dueDay, isPaid: false, category };
    setFixedBills(prev => [...prev, newBill]);
  };

  const removeBill = (id: string) => {
    setFixedBills(prev => prev.filter(bill => bill.id !== id));
  };

  const updateTarget = (symbol: string, quantity: number) => {
    setTargets(prev => ({ ...prev, [symbol]: quantity }));
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
  };

  const updatePrices = (newPrices: Record<string, number>) => {
    setCurrentPrices(prev => ({ ...prev, ...newPrices }));
  };

  const addGoal = (goal: FinancialGoal) => {
    setGoals(prev => [...prev, goal]);
  };

  const updateGoal = (id: string, updatedGoal: FinancialGoal) => {
    setGoals(prev => prev.map(g => g.id === id ? updatedGoal : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  return (
    <FinanceContext.Provider value={{
      user,
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
      login, // New
      logout, // New
      addTransaction,
      addDailyTransaction,
      deleteTransaction,
      editTransaction,
      updateBillStatus,
      updateBillAmount,
      editBill,
      addBill,
      removeBill,
      updateTarget,
      updateBudgetPlan,
      refreshPrices,
      togglePrivacyMode,
      updateShoppingPlan,
      updatePrices,
      goals,
      addGoal,
      updateGoal,
      deleteGoal
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
