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
    let totalNeedsSpent = 0;

    transactions.forEach(tx => {
        const txDate = new Date(tx.date);
        const now = new Date();
        
        // Only count transactions in current month for the Budget Display
        if (txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()) {
             if (tx.type === TransactionType.EXPENSE) {
                totalNeedsSpent += tx.price;
            } 
            else if (tx.type === TransactionType.INCOME) {
                totalNeedsSpent -= tx.price;
            }
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
            const amount = tx.price;

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

/**
 * NEW: Generates 6-month history for Charts & Insights
 */
export const getMonthlyHistory = (transactions: Transaction[], income: number) => {
    const history: Record<string, { month: string, needs: number, invest: number, savings: number }> = {};
    const today = new Date();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
        // Short month name for chart
        const monthName = `T${d.getMonth() + 1}`; 
        history[key] = { month: monthName, needs: 0, invest: 0, savings: 0 };
    }

    transactions.forEach(tx => {
        const d = new Date(tx.date);
        const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
        
        if (history[key]) {
            if (tx.type === TransactionType.EXPENSE) {
                history[key].needs += tx.price;
            } else if (tx.type === TransactionType.INCOME) {
                history[key].needs -= tx.price; // Income reduces net spend
            } else if (tx.type === TransactionType.BUY) {
                history[key].invest += (tx.price * tx.quantity);
            }
        }
    });

    // Calculate Savings (Residual) & format for Recharts
    return Object.values(history).map(item => {
        // Simple assumption: Savings = Income - Needs - Invest. 
        // If negative, set to 0 (overspent).
        const calculatedSavings = income - item.needs - item.invest;
        return {
            ...item,
            savings: Math.max(0, calculatedSavings)
        };
    });
};

/**
 * NEW: Generates Smart Advice based on last month's performance
 */
export const getFinancialAdvice = (historyData: any[], currentBudgetRules: any) => {
    if (historyData.length < 2) return null; // Need at least last month

    const lastMonth = historyData[historyData.length - 2]; // The completed month before current
    // Calculate total actual outflow to determine percentages
    const totalOut = lastMonth.needs + lastMonth.invest + lastMonth.savings;
    if (totalOut === 0) return null;

    const needsPct = (lastMonth.needs / totalOut) * 100;
    const investPct = (lastMonth.invest / totalOut) * 100;

    // Compare with rules (Plan)
    const plannedNeeds = currentBudgetRules.needs || 50;
    const plannedInvest = currentBudgetRules.invest || 30;

    let status: 'good' | 'warning' | 'alert' = 'good';
    let message = "Tháng trước bạn đã quản lý tài chính rất tốt! Hãy duy trì phong độ này.";
    let action = "Tiếp tục tích sản vào các mã mục tiêu (MBB/CTR).";

    if (needsPct > plannedNeeds + 10) {
        status = 'alert';
        message = `Tháng trước chi tiêu Thiết yếu chiếm tới ${needsPct.toFixed(0)}% (Mục tiêu ${plannedNeeds}%).`;
        action = "Tháng này cần thắt chặt chi tiêu. Ưu tiên nấu ăn tại nhà và giảm mua sắm.";
    } else if (investPct < plannedInvest - 5) {
        status = 'warning';
        message = `Tỷ lệ Đầu tư tháng trước chỉ đạt ${investPct.toFixed(0)}% (Mục tiêu ${plannedInvest}%).`;
        action = "Hãy cố gắng dồn thêm tiền nhàn rỗi vào cổ phiếu ngay đầu tháng này.";
    } else if (needsPct < plannedNeeds - 10) {
        status = 'good';
        message = `Tuyệt vời! Bạn đã tiết kiệm chi tiêu rất tốt (${needsPct.toFixed(0)}%).`;
        action = "Bạn có dư tiền mặt. Cân nhắc thưởng cho bản thân hoặc mua thêm chứng chỉ quỹ.";
    }

    return { status, message, action, month: lastMonth.month };
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