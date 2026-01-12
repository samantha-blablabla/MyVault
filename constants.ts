import { AssetType, BudgetCategory, FixedBill, Transaction, TransactionType, StockData } from './types';

export const TOTAL_INCOME = 0; // Set to 0, will be updated by user/backend

// Default Budget Structure
// Theme Update: Neo-Brutalism
// Invest -> Primary (Lime #cafc01)
// Needs -> Black (#18181b)
// Savings -> Zinc-400 (#a1a1aa) - Neutral Grey
export const INITIAL_BUDGET: BudgetCategory[] = [
  {
    id: 'needs',
    name: 'Thiết yếu (50%)',
    allocated: 0,
    spent: 0, 
    color: '#18181b', // Black
    percentage: 50
  },
  {
    id: 'invest',
    name: 'Đầu tư (30%)',
    allocated: 0,
    spent: 0, 
    color: '#cafc01', // Primary (Lime)
    percentage: 30
  },
  {
    id: 'savings',
    name: 'Dự phòng (20%)',
    allocated: 0,
    spent: 0, 
    color: '#a1a1aa', // Zinc 400 (Grey)
    percentage: 20
  }
];

// Clean Bills
export const FIXED_BILLS: FixedBill[] = [];

export const MOCK_TRANSACTIONS: Transaction[] = [];

// Clean Market Prices (Should be fetched from n8n/API)
export const MARKET_PRICES: Record<string, number> = {};

// Clean History (Should be fetched from n8n/API)
export const PRICE_HISTORY: Record<string, number[]> = {};

// Clean Portfolio (Calculated from transactions or fetched)
export const INITIAL_PORTFOLIO: StockData[] = [];