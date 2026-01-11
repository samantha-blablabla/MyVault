import { FixedBill, Transaction, TransactionType, StockData, AssetType } from "../types";

// --- 1. Needs & Budget Logic ---

/**
 * Calculates how much you can spend per day for the rest of the month
 * Formula: (Total Budget - Fixed Bills - Already Spent) / Days Remaining
 */
export const calculateDailySpendable = (
  totalBudget: number,
  spentSoFar: number,
  fixedBills: FixedBill[]
): { dailyAmount: number, daysRemaining: number, remainingBudget: number } => {
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysRemaining = Math.max(1, lastDayOfMonth.getDate() - today.getDate());

  // Calculate unpaid bills
  const unpaidBillsAmount = fixedBills
    .filter(bill => !bill.isPaid)
    .reduce((sum, bill) => sum + bill.amount, 0);

  // Total "committed" money (spent + bills you MUST pay)
  const remainingBudget = totalBudget - spentSoFar - unpaidBillsAmount;
  
  // If negative, you overspent
  const dailyAmount = remainingBudget > 0 ? remainingBudget / daysRemaining : 0;

  return { dailyAmount, daysRemaining, remainingBudget };
};

/**
 * Suggests carry-over amount. 
 * If remaining > 0, suggest moving to Invest/Savings.
 */
export const calculateCarryOver = (budgetLimit: number, totalSpent: number): number => {
    return Math.max(0, budgetLimit - totalSpent);
};


// --- 2. Investment Logic ---

/**
 * Calculates MAC (Moving Average Cost) and Total Quantity from transaction history.
 * This is the "Time-by-time" engine.
 */
export const processPortfolioFromTransactions = (
  transactions: Transaction[],
  marketPrices: Record<string, number>,
  priceHistory: Record<string, number[]>
): StockData[] => {
  const portfolioMap = new Map<string, StockData>();

  // Initialize targets (Hardcoded for now based on objective, can be DB driven later)
  const targets: Record<string, number> = { 'TCB': 100, 'MBB': 100, 'CTR': 50, 'HPG': 1000 };
  const assetTypes: Record<string, AssetType> = {
      'TCB': AssetType.Stock, 'MBB': AssetType.Stock, 'HPG': AssetType.Stock, 'CTR': AssetType.Stock,
      'VNDAF': AssetType.Fund, 'DFIX': AssetType.Fund
  };
  const names: Record<string, string> = {
      'TCB': 'Techcombank', 'MBB': 'MB Bank', 'HPG': 'Hoa Phat Group', 'CTR': 'Viettel Constr',
      'VNDAF': 'VNDirect Active Fund', 'DFIX': 'Dragon Capital Bond'
  };

  // Process Transactions
  transactions.forEach(tx => {
    if (!portfolioMap.has(tx.symbol)) {
      portfolioMap.set(tx.symbol, {
        symbol: tx.symbol,
        name: names[tx.symbol] || tx.symbol,
        quantity: 0,
        avgPrice: 0,
        currentPrice: marketPrices[tx.symbol] || 0,
        history: priceHistory[tx.symbol] || [],
        type: assetTypes[tx.symbol] || AssetType.Stock,
        targetQuantity: targets[tx.symbol]
      });
    }

    const stock = portfolioMap.get(tx.symbol)!;

    if (tx.type === TransactionType.BUY) {
      // Logic: New Avg = ((Old Qty * Old Avg) + (New Qty * Buy Price)) / Total Qty
      const totalCost = (stock.quantity * stock.avgPrice) + (tx.quantity * tx.price);
      stock.quantity += tx.quantity;
      stock.avgPrice = totalCost / stock.quantity;
    } 
    // SELL logic can be added here (Realized PnL)
  });

  // Calculate PnL and convert to array
  return Array.from(portfolioMap.values()).map(stock => {
      stock.marketValue = stock.quantity * stock.currentPrice;
      stock.pnl = (stock.currentPrice - stock.avgPrice) * stock.quantity;
      stock.pnlPercent = ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100;
      return stock;
  });
};

/**
 * Calculates Net Dividend after 5% Tax
 */
export const calculateNetDividend = (grossAmount: number): number => {
  return grossAmount * 0.95; 
};
