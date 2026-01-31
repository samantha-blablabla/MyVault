import { StockData } from "../types";
import { INITIAL_PORTFOLIO } from "../constants";

const API_BASE_URL = '/api';

/**
 * FETCH TRANSACTIONS (READ)
 */
export const getTransactions = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions`);
    if (!response.ok) throw new Error('Failed to fetch');
    // D1 returns { results: [], ... } usually if raw, 
    // but our API returns Response.json(results), so it should be the array directly.
    // Wait, our API: `return Response.json(results);` which is `[{...}, {...}]`
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch from D1, falling back to local/mock", error);
    return [];
  }
};

/**
 * SYNC TRANSACTION (WRITE)
 */
export const saveTransaction = async (transaction: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    if (!response.ok) throw new Error('Failed to save');
    return await response.json();
  } catch (error) {
    console.error("Failed to save to D1", error);
    throw error;
  }
};


// --- UTILS ---

// --- MARKET SIGNALS (READ) ---
export const getMarketSignals = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/signals`);
    if (!response.ok) throw new Error('Failed to fetch signals');
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch market signals", error);
    return [];
  }
};

// --- UTILS ---

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getStockPrice = (symbol: string): number => {
  // This helper might be deprecated if we pass price maps logic directly
  return 0;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};
