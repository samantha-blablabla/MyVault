import { AssetType, BudgetCategory, FixedBill, Transaction, TransactionType, StockData } from './types';

export const TOTAL_INCOME = 13000000;

export const INITIAL_BUDGET: BudgetCategory[] = [
  {
    id: 'needs',
    name: 'Thiết yếu (50%)',
    allocated: TOTAL_INCOME * 0.5, // 6.500.000
    spent: 3200000, 
    color: '#52525b', // Zinc-600 (Dark Gray)
    percentage: 50
  },
  {
    id: 'invest',
    name: 'Đầu tư (30%)',
    allocated: TOTAL_INCOME * 0.3, // 3.900.000
    spent: 3900000, 
    color: '#e4e4e7', // Zinc-200 (White - Highlight)
    percentage: 30
  },
  {
    id: 'savings',
    name: 'Dự phòng (20%)',
    allocated: TOTAL_INCOME * 0.2, // 2.600.000
    spent: 2600000, 
    color: '#a1a1aa', // Zinc-400 (Light Gray)
    percentage: 20
  }
];

// Database of Fixed Monthly Bills
export const FIXED_BILLS: FixedBill[] = [
  { id: '1', name: 'Tiền nhà', amount: 2500000, dueDay: 5, isPaid: true, category: 'housing' },
  { id: '2', name: 'Điện & Nước', amount: 600000, dueDay: 10, isPaid: true, category: 'utilities' },
  { id: '3', name: 'Internet/4G', amount: 250000, dueDay: 15, isPaid: false, category: 'internet' },
];

/**
 * DATABASE STRUCTURE RECOMMENDATION (JSON/Supabase):
 * Table: transactions
 * Columns: id, date, symbol, type, quantity, price, notes
 * 
 * This mock data simulates the history that allows us to calculate MAC (Average Price)
 */
export const MOCK_TRANSACTIONS: Transaction[] = [
  // TCB History
  { id: 't1', date: '2023-11-01', symbol: 'TCB', type: TransactionType.BUY, quantity: 20, price: 31000 },
  { id: 't2', date: '2023-12-05', symbol: 'TCB', type: TransactionType.BUY, quantity: 25, price: 32800 },
  
  // MBB History
  { id: 't3', date: '2023-11-02', symbol: 'MBB', type: TransactionType.BUY, quantity: 30, price: 18500 },
  { id: 't4', date: '2023-12-07', symbol: 'MBB', type: TransactionType.BUY, quantity: 30, price: 19500 },
  
  // HPG Accumulation
  { id: 't5', date: '2023-10-15', symbol: 'HPG', type: TransactionType.BUY, quantity: 100, price: 25000 },
  { id: 't6', date: '2023-11-20', symbol: 'HPG', type: TransactionType.BUY, quantity: 100, price: 27000 },

  // Funds
  { id: 'f1', date: '2023-11-07', symbol: 'VNDAF', type: TransactionType.BUY, quantity: 60, price: 17500 },
  { id: 'f2', date: '2023-12-07', symbol: 'VNDAF', type: TransactionType.BUY, quantity: 60, price: 18500 },
];

// Current Market Prices (Simulating n8n feed)
export const MARKET_PRICES: Record<string, number> = {
  'TCB': 34500,
  'MBB': 21500,
  'HPG': 28200,
  'CTR': 95000,
  'VNDAF': 19200,
  'DFIX': 11200
};

export const PRICE_HISTORY: Record<string, number[]> = {
  'TCB': [31000, 31500, 32000, 31800, 32500, 33500, 34500],
  'MBB': [19500, 20000, 20200, 20100, 20800, 21000, 21500],
  'HPG': [26000, 26200, 26100, 27000, 27500, 27800, 28200],
  'CTR': [90000, 91000, 90500, 92000, 93500, 94000, 95000],
  'VNDAF': [18500, 18600, 18700, 18800, 19000, 19100, 19200],
  'DFIX': [11000, 11050, 11080, 11100, 11120, 11150, 11200]
};

export const INITIAL_PORTFOLIO: StockData[] = [
  {
    symbol: 'TCB',
    name: 'Techcombank',
    quantity: 45,
    avgPrice: 32000,
    currentPrice: 34500,
    history: PRICE_HISTORY['TCB'],
    type: AssetType.Stock,
    targetQuantity: 100
  },
  {
    symbol: 'MBB',
    name: 'MB Bank',
    quantity: 60,
    avgPrice: 19000,
    currentPrice: 21500,
    history: PRICE_HISTORY['MBB'],
    type: AssetType.Stock,
    targetQuantity: 100
  },
  {
    symbol: 'HPG',
    name: 'Hoa Phat Group',
    quantity: 200,
    avgPrice: 26000,
    currentPrice: 28200,
    history: PRICE_HISTORY['HPG'],
    type: AssetType.Stock,
    targetQuantity: 1000
  },
  {
    symbol: 'VNDAF',
    name: 'VNDirect Active Fund',
    quantity: 120,
    avgPrice: 18000,
    currentPrice: 19200,
    history: PRICE_HISTORY['VNDAF'],
    type: AssetType.Fund
  }
];