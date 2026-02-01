import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { HoldingsTable } from '../dashboard/HoldingsTable';
import { FundsTable } from '../dashboard/FundsTable';
import { GlassCard } from '../ui/GlassCard';
import { RebalanceModal } from '../modals/RebalanceModal';
import { Wallet, TrendingUp, PiggyBank, Plus, RefreshCw, BarChart2, PieChart, ArrowRightLeft } from 'lucide-react';
import { formatCurrency } from '../../services/dataService';
import { fetchMarketPrices, fetchSharkData } from '../../services/marketData';
import { TransactionModal } from '../modals/TransactionModal';
import { StockData, TransactionType } from '../../types';
import { MarketTicker } from '../dashboard/MarketTicker';
import { SharkDashboard } from '../dashboard/SharkTracker/SharkDashboard';

export const AssetsView: React.FC = () => {
    const { portfolio, budget, addTransaction, fixedBills, dailySpendable, updatePrices } = useFinance();
    const [isLoading, setIsLoading] = useState(false);
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [activeTab, setActiveTab] = useState<'PORTFOLIO' | 'SHARK'>('PORTFOLIO');
    const [sharkSignal, setSharkSignal] = useState<string | null>(null);

    // Harvest Feature State
    const [isRebalanceModalOpen, setIsRebalanceModalOpen] = useState(false);
    const [marketSignals, setMarketSignals] = useState<any[]>([]);

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
            // Fetch Shark Signal for Notification Badge
            try {
                const sharkData = await fetchSharkData();
                setSharkSignal(sharkData.signal);
            } catch (e) {
                console.error("Failed to fetch shark signal", e);
            }
            setTimeout(() => setIsLoading(false), 800);
        };

        const fetchSignals = async () => {
            try {
                // In Dev: http://localhost:8788/api/signals
                // In Prod: /api/signals
                const res = await fetch('/api/signals');
                if (res.ok) {
                    const data = await res.json();
                    setMarketSignals(data);
                }
            } catch (e) {
                console.error("Failed to fetch signals", e);
            }
        };
        fetchSignals();

        loadPrices();

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
        setRefreshTrigger(prev => prev + 1);
    };

    // Filter Assets for Split Tables
    const stockAssets = portfolio.filter(p => !p.type || p.type === 'STOCK');
    const fundAssets = portfolio.filter(p => p.type === 'FUND');

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* MARKET TICKER */}
            <div className="-mx-4 -mt-4 md:-mx-8 md:-mt-8 mb-6">
                <MarketTicker />
            </div>

            {/* HEADER & TABS Container */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                            Danh mục Đầu tư
                        </h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                            Quản lý tài sản và Xu hướng dòng tiền thị trường.
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

                {/* TABS & ACTIONS */}
                <div className="flex items-center gap-3">
                    <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl w-fit border border-zinc-200 dark:border-white/5">
                        <button
                            onClick={() => setActiveTab('PORTFOLIO')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'PORTFOLIO'
                                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                                }`}
                        >
                            <PieChart size={16} />
                            Danh mục của tôi
                        </button>
                        <button
                            onClick={() => setActiveTab('SHARK')}
                            className={`relative flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'SHARK'
                                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                                }`}
                        >
                            <BarChart2 size={16} />
                            Shark Tracker
                            {/* Notification Badge Logic */}
                            {sharkSignal && sharkSignal !== 'NEUTRAL' && (
                                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${sharkSignal.includes('BUY') ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                                    <span className={`relative inline-flex rounded-full h-3 w-3 ${sharkSignal.includes('BUY') ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                </span>
                            )}
                        </button>
                    </div>

                    <button
                        onClick={() => setIsRebalanceModalOpen(true)}
                        className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-2 font-bold border border-zinc-200 dark:border-zinc-700/50"
                        title="Chiến thuật Gặt lúa"
                    >
                        <ArrowRightLeft size={18} />
                        <span className="hidden md:inline text-sm">Gặt lúa</span>
                    </button>
                </div>
            </div>

            {/* CONTENT AREA */}
            {activeTab === 'PORTFOLIO' ? (
                <div className="space-y-6 animate-fade-in">
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

                    {/* 2. STOCK HOLDINGS */}
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 pl-1 flex items-center gap-2">
                            <TrendingUp size={20} className="text-emerald-500" />
                            Cổ phiếu (Stocks)
                        </h3>
                        <HoldingsTable
                            assets={stockAssets}
                            onBuy={handleOpenBuy}
                            onSell={handleOpenSell}
                            isLoading={isLoading}
                        />
                    </div>

                    {/* 3. FUNDS HOLDINGS */}
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 pl-1 flex items-center gap-2">
                            <PieChart size={20} className="text-purple-500" />
                            Chứng chỉ Quỹ (Funds)
                        </h3>
                        <FundsTable
                            assets={fundAssets}
                            onBuy={handleOpenBuy}
                            onSell={handleOpenSell}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            ) : (
                <SharkDashboard />
            )}

            {/* Transaction Modal (Available Global) */}
            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleTransactionSubmit}
                initialType={modalMode === 'BUY' ? TransactionType.BUY : TransactionType.SELL}
                initialSymbol={selectedSymbol}
            />

            <RebalanceModal
                isOpen={isRebalanceModalOpen}
                onClose={() => setIsRebalanceModalOpen(false)}
                portfolio={portfolio}
                marketSignals={marketSignals}
            />
        </div>
    );
};
