import React from 'react';
import { Home, PieChart, Zap, Radar, Menu } from 'lucide-react';

interface MobileNavigationProps {
  onAddClick: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ onAddClick, activeTab, onTabChange }) => {
  const navItems = [
    { id: 'overview', icon: Home, label: 'Tổng quan' },
    { id: 'strategy', icon: Radar, label: 'Radar' },
    { id: 'add', icon: Zap, label: 'Add', isAction: true },
    { id: 'portfolio', icon: PieChart, label: 'Tài sản' },
    { id: 'menu', icon: Menu, label: 'Menu' },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
      {/* Floating Glass Bar */}
      <div className="h-16 bg-zinc-900/90 dark:bg-black/90 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl flex items-center justify-around px-2">
        {navItems.map((item) => {
           if (item.isAction) {
               // Center Action Button (Floating slightly or highlighted)
               return (
                   <button
                        key={item.id}
                        onClick={onAddClick}
                        className="relative -top-6 w-14 h-14 rounded-full bg-primary text-black shadow-[0_0_20px_rgba(202,252,1,0.6)] flex items-center justify-center transition-transform active:scale-95 hover:scale-110"
                   >
                       <Zap size={22} fill="currentColor" strokeWidth={2} />
                   </button>
               )
           }

           const isActive = activeTab === item.id;
           const Icon = item.icon;
           
           return (
                <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                    <Icon 
                        size={22} 
                        strokeWidth={isActive ? 2.5 : 2} 
                        className={`transition-colors ${isActive ? 'text-primary' : 'text-zinc-500'}`} 
                    />
                    {isActive && <div className="w-1 h-1 bg-primary rounded-full mt-1 shadow-[0_0_5px_currentColor]"></div>}
                </button>
           );
        })}
      </div>
    </div>
  );
};
