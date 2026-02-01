import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { HoldingsTable } from '../dashboard/HoldingsTable';
import { GlassCard } from '../ui/GlassCard';
import { Wallet, TrendingUp, PiggyBank, Plus, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../services/dataService';
import { fetchMarketPrices } from '../../services/marketData';
import { TransactionModal } from '../modals/TransactionModal';
import { StockData, TransactionType } from '../../types';
import { MarketTicker } from '../dashboard/MarketTicker';

export const AssetsView: React.FC = () => {
    const { portfolio, budget, addTransaction, fixedBills, dailySpendable, updatePrices } = useFinance();
    const [isLoading, setIsLoading] = useState(false);
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'BUY' | 'SELL'>('BUY');
    const [selectedSymbol, setSelectedSymbol] = useState('');

    // Derived Stats
    const totalAssetsValue = portfolio.reduce((sum, item) => sum + (item.marketValue || 0), 0);
    const totalPnL = portfolio.reduce((sum, item) => sum + (item.pnl || 0), 0);
    const totalPnLPercent = portfolio.reduce((sum, item) => sum + (item.quantity * item.avgPrice), 0) > 0
        ? (totalPnL / portfolio.reduce((sum, item) => sum + (item.quantity * item.avgPrice), 0)) * 100
        : 0;

    // Buying Power
    const investBudget = budget.find(b => b.id === 'invest');
    const buyingPower = (investBudget?.allocated || 0) - (investBudget?.spent || 0);

    // Initial Data Fetch & Auto Auto-Refresh
    useEffect(() => {
        const loadPrices = async () => {
            setIsLoading(true);
            const symbols = portfolio.map(p => p.symbol);
            if (symbols.length > 0) {
                const newPrices = await fetchMarketPrices(symbols);
                setPrices(newPrices);
                updatePrices(newPrices);
            }
            // Simulate a minimum spin time for visual feedback
            setTimeout(() => setIsLoading(false), 800);
        };

        loadPrices();

        // Auto-refresh every 60 seconds
        const interval = setInterval(loadPrices, 60000);
        return () => clearInterval(interval);
    }, [portfolio.length, refreshTrigger]);

    const handleOpenBuy = (asset?: StockData) => {
        setModalMode('BUY');
        setSelectedSymbol(asset?.symbol || '');
        setIsModalOpen(true);
    };

    const handleOpenSell = (asset: StockData) => {
        setModalMode('SELL');
        setSelectedSymbol(asset.symbol);
        setIsModalOpen(true);
    };

    const handleTransactionSubmit = (tx: any) => {
        addTransaction(tx);
        setIsModalOpen(false);
        // Trigger refresh after transaction to update values per new quantity
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* MARKET TICKER */}
            <div className="-mx-4 -mt-4 md:-mx-8 md:-mt-8 mb-6">
                <MarketTicker />
            </div>

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                        Danh mục Đầu tư
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                        Quản lý tài sản và hiệu quả sinh lời time-real.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setRefreshTrigger(t => t + 1)}
                        className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        title="Tự động cập nhật mỗi 1 phút"
                    >
                        <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>

                    <button
                        onClick={() => handleOpenBuy()}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={20} strokeWidth={3} />
                        <span>Giao dịch Mới</span>
                    </button>
                </div>
            </div>

            {/* 1. PORTFOLIO SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Net Asset Value */}
                <GlassCard className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border-indigo-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
                            <Wallet size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Tổng Tài sản (NAV)</p>
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                                {formatCurrency(totalAssetsValue)}
                            </h3>
                        </div>
                    </div>
                </GlassCard>

                {/* Unrealized PnL */}
                <GlassCard className={totalPnL >= 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl text-white shadow-lg ${totalPnL >= 0 ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-rose-500 shadow-rose-500/30'}`}>
                            <TrendingUp size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Lãi / Lỗ tạm tính</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className={`text-2xl font-black tracking-tight ${totalPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {totalPnL > 0 ? '+' : ''}{formatCurrency(totalPnL)}
                                </h3>
                                <span className={`text-xs font-bold ${totalPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    ({totalPnLPercent.toFixed(2)}%)
                                </span>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Buying Power */}
                <GlassCard className="bg-zinc-500/5 border-zinc-500/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-zinc-500 text-white shadow-lg shadow-zinc-500/30">
                            <PiggyBank size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Sức mua khả dụng</p>
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                                {formatCurrency(buyingPower)}
                            </h3>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* 2. HOLDINGS TABLE */}
            <div>
                <HoldingsTable
                    assets={portfolio}
                    onBuy={handleOpenBuy}
                    onSell={handleOpenSell}
                    isLoading={isLoading}
                />
            </div>

            {/* Transaction Modal */}
            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleTransactionSubmit}
                initialType={modalMode === 'BUY' ? TransactionType.BUY : TransactionType.SELL}
                initialSymbol={selectedSymbol}
            />
        </div>
    );
};
