import { StockData } from "../types";

// Mock Data for fallback or if API fails
const MOCK_PRICES: Record<string, number> = {
    'TCB': 24500,
    'MBB': 22100,
    'HPG': 28900,
    'CTR': 95000,
    'FPT': 105000,
    'VNM': 68000,
    'VIC': 45000,
    'VNDAF': 25000,
    'DFIX': 11000
};

// Simplified public API proxy or direct fetch if available
// For now, we simulate a latency fetch or use a stable free endpoint if known.
// Real-time APIs often require CORS proxies or backend integration.
// We will implement a specialized fetcher for Vietnam stocks later or use a proxy.

export const fetchMarketPrices = async (symbols: string[]): Promise<Record<string, number>> => {
    // Simulator for "Real-time" latency
    await new Promise(resolve => setTimeout(resolve, 800));

    // In a real implementation, we would call:
    // const response = await fetch('https://api.vnstock.com/latest?symbols=' + symbols.join(','));
    // return response.json();

    // For now, return Mock prices with slight randomization to simulate "Live" market
    const livePrices: Record<string, number> = {};

    symbols.forEach(sym => {
        const basePrice = MOCK_PRICES[sym] || 10000;
        // Random fluctuation +/- 1%
        const fluctuation = 1 + (Math.random() * 0.02 - 0.01);
        livePrices[sym] = Math.round(basePrice * fluctuation);
    });

    return livePrices;
};

// --- MARKET INDICES ---
// Mock for VN-INDEX, VN30, Gold, USD
export const fetchMarketIndices = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));

    return [
        { symbol: 'VN-INDEX', value: 1254.23, change: 5.6, percentChange: 0.45 },
        { symbol: 'VN30', value: 1280.11, change: -2.3, percentChange: -0.18 },
        { symbol: 'Gold SJC', value: 84500000, change: 200000, percentChange: 0.24 },
        { symbol: 'USD/VND', value: 25450, change: 10, percentChange: 0.04 },
        { symbol: 'BTC/USD', value: 68500, change: 1200, percentChange: 1.75 },
    ];
};
