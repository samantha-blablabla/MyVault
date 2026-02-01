import { AssetType, BudgetCategory, FixedBill, Transaction, TransactionType, StockData } from './types';

export const TOTAL_INCOME = 0; // Default 0

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

// Initial Portfolio Seeds (Synced from Customer Data)
export const MOCK_TRANSACTIONS: Transaction[] = [
  // STOCKS
  { id: 'real-1', date: new Date().toISOString(), symbol: 'TCB', type: TransactionType.BUY, quantity: 100, price: 35784, notes: 'Sync from Trading App' },
  { id: 'real-2', date: new Date().toISOString(), symbol: 'HPG', type: 'BUY' as TransactionType, quantity: 20, price: 26600, notes: 'Sync from Trading App' },
  { id: 'real-3', date: new Date().toISOString(), symbol: 'MBB', type: 'BUY' as TransactionType, quantity: 100, price: 27210, notes: 'Sync from Trading App' },

  // FUNDS
  { id: 'real-4', date: new Date().toISOString(), symbol: 'DFIX', type: 'BUY' as TransactionType, quantity: 167.52, price: 11968, notes: 'Dragon Capital Funds' },
  { id: 'real-5', date: new Date().toISOString(), symbol: 'VNDAF', type: 'BUY' as TransactionType, quantity: 202.82, price: 19910, notes: 'VNDirect Active Fund' },
];

// Clean Market Prices (Should be fetched from n8n/API)
export const MARKET_PRICES: Record<string, number> = {
  'TCB': 35900,
  'HPG': 26800,
  'MBB': 27200,
  'CTR': 112000,
  'FPT': 118000,
  'MWG': 48500,
  'VNM': 67500,
  'VIC': 43200,
  'VNDAF': 19910,
  'DFIX': 11968
};

// Clean History (Should be fetched from n8n/API)
export const PRICE_HISTORY: Record<string, number[]> = {};

// Clean Portfolio (Calculated from transactions or fetched)
export const INITIAL_PORTFOLIO: StockData[] = [];