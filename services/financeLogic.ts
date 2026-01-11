import { FixedBill, Transaction, TransactionType, StockData, AssetType, BudgetCategory } from "../types";

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
 * Recalculates the 'spent' amount for budget categories based on transaction history.
 * Ensures data consistency when transactions are edited or deleted.
 */
export const calculateBudgetProgress = (
    currentBudget: BudgetCategory[],
    transactions: Transaction[]
): BudgetCategory[] => {
    // 1. Calculate total spent for 'needs' (Expenses - Income Windfalls)
    // Note: In this system, 'needs' acts as the main bucket for daily cashflow.
    let totalNeedsSpent = 0;

    transactions.forEach(tx => {
        // Only count Daily Transactions (those with special symbols or specific logic)
        // Usually daily expenses have type EXPENSE/INCOME. 
        // Investment transactions (BUY/SELL) are handled in Portfolio logic, not Budget logic.
        
        if (tx.type === TransactionType.EXPENSE) {
            totalNeedsSpent += tx.price;
        } 
        else if (tx.type === TransactionType.INCOME) {
            // If it's a daily income (like a gift/bonus), it reduces the 'spent' amount,
            // effectively increasing the available budget.
            totalNeedsSpent -= tx.price;
        }
    });

    // 2. Return new budget array with updated 'spent' values
    return currentBudget.map(cat => {
        if (cat.id === 'needs') {
            return { ...cat, spent: totalNeedsSpent };
        }
        return cat;
    });
};

/**
 * Calculates detailed spending stats (Day, Month, Year) from transaction history
 */
export const calculateSpendingStats = (transactions: Transaction[]) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed
    const currentDate = today.getDate();

    let day = 0;
    let month = 0;
    let year = 0;

    transactions.forEach(tx => {
        if (tx.type === TransactionType.EXPENSE) {
            const txDate = new Date(tx.date);
            const amount = tx.price; // For expenses, price is the amount

            if (txDate.getFullYear() === currentYear) {
                year += amount;
                if (txDate.getMonth() === currentMonth) {
                    month += amount;
                    if (txDate.getDate() === currentDate) {
                        day += amount;
                    }
                }
            }
        }
    });

    return { day, month, year };
};


// --- 2. Investment Logic ---

/**
 * Calculates MAC (Moving Average Cost) and Total Quantity from transaction history.
 * Now accepts 'targets' as a parameter to allow dynamic updates from UI.
 */
export const processPortfolioFromTransactions = (
  transactions: Transaction[],
  marketPrices: Record<string, number>,
  priceHistory: Record<string, number[]>,
  targets: Record<string, number> // ADDED: Dynamic Targets
): StockData[] => {
  const portfolioMap = new Map<string, StockData>();

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
    // IGNORE EXPENSES and INCOME in Portfolio Calculation
    if (tx.type === TransactionType.EXPENSE || tx.type === TransactionType.INCOME) return;

    if (!portfolioMap.has(tx.symbol)) {
      portfolioMap.set(tx.symbol, {
        symbol: tx.symbol,
        name: names[tx.symbol] || tx.symbol,
        quantity: 0,
        avgPrice: 0,
        currentPrice: marketPrices[tx.symbol] || 0,
        history: priceHistory[tx.symbol] || [],
        type: assetTypes[tx.symbol] || AssetType.Stock,
        targetQuantity: targets[tx.symbol] || 0 // Use dynamic target
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
      // Ensure target is set even if not in map initially (for updates)
      stock.targetQuantity = targets[stock.symbol] || 0;
      return stock;
  });
};

/**
 * Calculates Net Dividend after 5% Tax
 */
export const calculateNetDividend = (grossAmount: number): number => {
  return grossAmount * 0.95; 
};