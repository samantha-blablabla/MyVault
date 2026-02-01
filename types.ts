
export enum AssetType {
  Stock = 'STOCK',
  Fund = 'FUND',
  Savings = 'SAVINGS'
}

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
  DIVIDEND = 'DIVIDEND',
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME' // New type for windfall income
}

export interface Transaction {
  id: string;
  date: string; // ISO Date
  symbol: string;
  type: TransactionType;
  quantity: number;
  price: number; // Price per share or Total Dividend amount or Expense Amount
  notes?: string;
}

export interface FixedBill {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // Day of month (e.g., 5, 10, 15)
  isPaid: boolean;
  category?: 'housing' | 'utilities' | 'internet' | 'subscription' | 'insurance' | 'debt' | 'other';
}

export interface StockData {
  symbol: string;
  name: string;
  quantity: number;
  targetQuantity?: number; // e.g., 100 for TCB/MBB
  avgPrice: number; // Calculated MAC
  currentPrice: number;
  dayChange?: number; // New: Value change vs Yesterday
  dayChangePercent?: number; // New: % change vs Yesterday
  history: number[]; // Array of prices for sparkline (7 days)
  type: AssetType;
  marketValue?: number;
  pnl?: number; // Profit and Loss
  pnlPercent?: number;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number; // The planned amount
  spent: number; // The actual spend
  color: string;
  percentage: number; // 50, 30, or 20
}

export interface UserState {
  isAuthenticated: boolean;
  name: string;
  totalNetWorth: number;
}

export interface ShoppingPlan {
  name: string;
  price: number;
  fundSource: 'savings' | 'invest'; // Which budget bucket to use
  monthlyContribution: number; // How much to set aside per month
}

export interface FinancialGoal {
  id: string;
  name: string;
  type: 'ASSET' | 'SAVINGS' | 'DEBT';
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO Date
  monthlyContribution: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ON_TRACK' | 'AT_RISK' | 'BEHIND';
  icon?: string;
  notes?: string;
}
