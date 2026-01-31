import React from 'react';
import { MobileNavigation } from '../layout/MobileNavigation';
import { ShieldCheck, LayoutGrid, PieChart, Radar, History, Plus, LogOut, Settings } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface AppLayoutProps {
    children: React.ReactNode;
    activeView: string;
    onViewChange: (view: string) => void;
    onAddClick: () => void;
    onLogout: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, activeView, onViewChange, onAddClick, onLogout }) => {
    const { isPrivacyMode, togglePrivacyMode } = useFinance();

    const navItems = [
        { id: 'overview', icon: LayoutGrid, label: 'Tổng quan' },
        { id: 'assets', icon: PieChart, label: 'Tài sản' },
        { id: 'planning', icon: Radar, label: 'Kế hoạch' },
        { id: 'history', icon: History, label: 'Lịch sử' },
    ];

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-black overflow-hidden selection:bg-primary selection:text-white">
            {/* --- DESKTOP SIDEBAR --- */}
            <aside className="hidden md:flex flex-col w-64 h-full border-r border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 backdrop-blur-xl">
                {/* Logo Area */}
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-glow">
                        <ShieldCheck size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">FINVAULT</h1>
                        <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Beta v2.2</p>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => {
                        const isActive = activeView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onViewChange(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-primary/10 text-primary font-bold'
                                        : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'
                                    }`}
                            >
                                <item.icon size={20} className={isActive ? 'text-primary' : 'group-hover:text-primary transition-colors'} />
                                <span>{item.label}</span>
                                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-glow" />}
                            </button>
                        );
                    })}

                    {/* Quick Add Button in Sidebar */}
                    <button
                        onClick={onAddClick}
                        className="w-full flex items-center gap-3 px-4 py-3 mt-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all text-sm"
                    >
                        <Plus size={20} strokeWidth={3} />
                        <span>Giao dịch Mới</span>
                    </button>
                </nav>

                {/* Footer / Settings */}
                <div className="p-4 border-t border-zinc-200 dark:border-white/10 space-y-1">
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 transition-colors text-sm font-medium">
                        <LogOut size={18} />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 relative h-full overflow-hidden flex flex-col">
                {/* Top Mobile Header (Optional, or just keep content scrollable) */}

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto scrollbar-hide p-4 md:p-8 pb-32 md:pb-8">
                    {children}
                </div>

                {/* --- MOBILE NAVIGATION --- */}
                <MobileNavigation
                    activeTab={activeView}
                    onTabChange={onViewChange}
                    onAddClick={onAddClick}
                />
            </main>
        </div>
    );
};
