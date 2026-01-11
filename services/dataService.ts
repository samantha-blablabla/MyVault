import { StockData } from "../types";
import { INITIAL_PORTFOLIO } from "../constants";

/**
 * n8n INTEGRATION GUIDE:
 * 
 * In a real scenario, this service would fetch data from your backend Next.js API route.
 * 
 * 1. n8n Workflow:
 *    - Trigger: Schedule (Every night at 20:00).
 *    - Action: Google Sheets Node (Read rows for TCB, MBB, etc.).
 *    - Action: HTTP Request (GET/Scrape) for VNDAF/DFIX NAV.
 *    - Action: HTTP Request (POST) to https://your-domain.com/api/webhooks/update-prices
 *      Headers: { "x-api-key": process.env.N8N_SECRET_KEY }
 *      Body: { "TCB": 34500, "VNDAF": 19200, ... }
 * 
 * 2. This frontend would then fetch from GET /api/portfolio
 */

export const getPortfolioData = async (): Promise<StockData[]> => {
  // Simulate API latency
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(INITIAL_PORTFOLIO);
    }, 800);
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};
