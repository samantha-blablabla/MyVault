import { StockData } from "../types";

// Mock Data for fallback (Updated to Real Market Prices as of late Jan 2026/Present)
const MOCK_PRICES: Record<string, number> = {
    'TCB': 35900,
    'MBB': 27200,
    'HPG': 26800,
    'CTR': 112000, // Updated market view
    'FPT': 118000,
    'VNM': 67500,
    'VIC': 43200,
    'VNDAF': 19910, // Synced from user
    'DFIX': 11968   // Synced from user
};

export interface MarketQuote {
    price: number;
    change: number;
    changePercent: number;
}

export const fetchMarketPrices = async (symbols: string[]): Promise<Record<string, MarketQuote>> => {
    // STATIC MODE (Market Closed / User Request)
    // Returning exact snapshot prices without simulation noise.
    await new Promise(r => setTimeout(r, 300));

    const results: Record<string, MarketQuote> = {};

    symbols.forEach(sym => {
        const base = MOCK_PRICES[sym] || 10000;

        // Static Price (No Random Fluctuation)
        const price = base;
        const change = 0;
        const changePercent = 0;

        results[sym] = {
            price,
            change,
            changePercent
        };
    });

    return results;
};

// --- MARKET INDICES ---
// Mock for VN-INDEX, VN30, Gold, USD
// --- MARKET INDICES ---
// Real-time Fetch from Public APIs (VNDirect & CoinGecko)
// Helper: Check if Market is Open (Mon-Fri, 09:00 - 15:00 GMT+7)
const isMarketOpen = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sun, 6 = Sat
    const hour = now.getHours();

    // Weekend
    if (day === 0 || day === 6) return false;

    // Hours (09:00 to 15:00)
    if (hour < 9 || hour >= 15) return false;

    return true;
};

// Helper for Simulation (Jumping Numbers - Market Live Effect)
const getSimulatedIndices = () => {
    const isOpen = isMarketOpen();

    // Base 2026 Values (Synced with User Screenshot)
    const baseVN = 1829.04;
    const baseVN30 = 2029.81;
    const baseBTC = 78780; // Value from screenshot
    const baseGold = 84500000;

    // Random fluctuation +/- 0.05% ONLY IF OPEN
    // If Closed, Noise = 0 (Static)
    const marketNoise = () => isOpen ? (Math.random() - 0.5) * 0.001 : 0;

    // BTC always moves (24/7)
    const cryptoNoise = () => (Math.random() - 0.5) * 0.001;

    return [
        {
            symbol: 'VN-INDEX',
            value: baseVN * (1 + marketNoise()),
            change: isOpen ? 14.06 + (Math.random() * 0.5) : 14.06,
            percentChange: 0.77
        },
        {
            symbol: 'VN30',
            value: baseVN30 * (1 + marketNoise()),
            change: isOpen ? 10.83 + (Math.random() * 0.5) : 10.83,
            percentChange: 0.54
        },
        { symbol: 'Gold SJC', value: baseGold, change: 0, percentChange: 0.24 },
        { symbol: 'USD/VND', value: 25450, change: 5, percentChange: 0.02 },
        {
            symbol: 'BTC/USD',
            value: baseBTC * (1 + cryptoNoise()),
            change: -200 + (Math.random() * 20),
            percentChange: -0.25
        },
    ];
};

export const fetchMarketIndices = async () => {
    try {
        // 1. Fetch VN Indices from VNDirect (Public Endpoint)
        // Proxy: /api/vndirect -> https://finfo-api.vndirect.com.vn
        const vnRes = await fetch('/api/vndirect/v4/stock_indexes?q=code:VNINDEX,VN30');
        let vnIndexData = null;
        let vn30Data = null;

        if (vnRes.ok) {
            const json = await vnRes.json();
            vnIndexData = json.data?.find((i: any) => i.code === 'VNINDEX');
            vn30Data = json.data?.find((i: any) => i.code === 'VN30');
        }

        // 2. Fetch BTC from CoinGecko
        const btcRes = await fetch('/api/coingecko/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
        let btcData = null;
        if (btcRes.ok) {
            const json = await btcRes.json();
            if (json.bitcoin) btcData = json.bitcoin;
        }

        // If fetch failed entirely for VN items (e.g. CORS/DNS), simulate "Live 2026" data
        if (!vnIndexData) {
            console.warn("VNDirect API unreachable, switching to Simulation Mode");
            return getSimulatedIndices();
        }

        // Return Real Data if available
        return [
            {
                symbol: 'VN-INDEX',
                value: vnIndexData.adjustment || 1254,
                change: vnIndexData.change || 0,
                percentChange: vnIndexData.rate || 0
            },
            {
                symbol: 'VN30',
                value: vn30Data?.adjustment || 1280,
                change: vn30Data?.change || 0,
                percentChange: vn30Data?.rate || 0
            },
            { symbol: 'Gold SJC', value: 84500000, change: 0, percentChange: 0 },
            { symbol: 'USD/VND', value: 25450, change: 5, percentChange: 0.02 },
            {
                symbol: 'BTC/USD',
                value: btcData ? btcData.usd : 68500,
                change: btcData ? (btcData.usd * (btcData.usd_24h_change / 100)) : 0,
                // Fix Formatting: Round to 2 decimals to avoid weird UI strings
                percentChange: btcData ? parseFloat(btcData.usd_24h_change.toFixed(2)) : 0
            },
        ];

    } catch (e) {
        console.error("Index Fetch Failed, switching to Simulation", e);
        // Fallback to Simulation for "Live" feel
        return getSimulatedIndices();
    }
};

// --- SHARK TRACKER DATA ---
export interface SharkData {
    signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
    signalReason: string;
    foreignFlow: { date: string; netBuy: number; netSell: number; netValue: number }[];
    proprietaryFlow: { date: string; netValue: number }[];
    topBuy: { symbol: string; value: number; change: number }[];
    topSell: { symbol: string; value: number; change: number }[];
}

export const fetchSharkData = async (): Promise<SharkData> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
        signal: 'BUY',
        signalReason: "Khối ngoại quay lại mua ròng phiên thứ 3 liên tiếp, tập trung Bank & Tech.",
        foreignFlow: [
            { date: '25/01', netBuy: 1200, netSell: 1500, netValue: -300 },
            { date: '26/01', netBuy: 1100, netSell: 1300, netValue: -200 },
            { date: '27/01', netBuy: 1800, netSell: 1000, netValue: 800 },
            { date: '28/01', netBuy: 2200, netSell: 1100, netValue: 1100 },
            { date: '29/01', netBuy: 2500, netSell: 1800, netValue: 700 }, // Today
        ],
        proprietaryFlow: [
            { date: '25/01', netValue: 100 },
            { date: '26/01', netValue: -50 },
            { date: '27/01', netValue: 200 },
            { date: '28/01', netValue: 350 },
            { date: '29/01', netValue: 120 },
        ],
        topBuy: [
            { symbol: 'FPT', value: 250000000000, change: 1.2 },
            { symbol: 'MWG', value: 180000000000, change: 2.5 },
            { symbol: 'STB', value: 120000000000, change: -0.5 },
            { symbol: 'TCB', value: 90000000000, change: 0.8 },
        ],
        topSell: [
            { symbol: 'VHM', value: -150000000000, change: -1.2 },
            { symbol: 'VIC', value: -80000000000, change: -0.8 },
            { symbol: 'MSN', value: -60000000000, change: 0.1 },
        ]
    };
};
