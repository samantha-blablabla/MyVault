import { StockData } from "../types";
import { INITIAL_PORTFOLIO } from "../constants";

/**
 * CLOUDFLARE D1 INTEGRATION GUIDE:
 * 
 * Base API URL for your Cloudflare Worker/Pages Function.
 * In development, this might point to localhost:8787
 * In production, this points to your domain.
 */
// const API_BASE_URL = '/api'; 

/**
 * FETCH PORTFOLIO (READ)
 * Connects to D1: SELECT * FROM assets WHERE user_id = ?
 */
export const getPortfolioData = async (): Promise<StockData[]> => {
  // TODO: Uncomment when Cloudflare Backend is ready
  /*
  try {
      const response = await fetch(`${API_BASE_URL}/portfolio`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
  } catch (error) {
      console.error("Failed to fetch from D1, falling back to local data", error);
      return INITIAL_PORTFOLIO;
  }
  */

  // Fallback / Current State: Simulate API latency
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(INITIAL_PORTFOLIO);
    }, 800);
  });
};

/**
 * SYNC TRANSACTION (WRITE)
 * Connects to D1: INSERT INTO transactions (...) VALUES (...)
 */
export const syncTransactionToD1 = async (transaction: any) => {
    // TODO: Implement Sync Logic
    console.log("Syncing to Cloudflare D1:", transaction);
    /*
    await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
    });
    */
};

// --- UTILS ---

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};
