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
    { id: 'add', icon: Zap, label: '' }, // Center
    { id: 'portfolio', icon: PieChart, label: 'Tài sản' },
    { id: 'menu', icon: Menu, label: 'Menu' },
  ];

  // Colors for SVG fill/stroke to match the theme (Zinc-900/90 for Light/Dark in this specific design)
  // Adjusting to match the previous component's bg-zinc-900/90 style
  const barClass = "bg-zinc-900/95 dark:bg-black/95 backdrop-blur-xl border-zinc-800";
  
  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 h-20 pointer-events-none">
      <div className="relative w-full h-full flex items-end drop-shadow-2xl pointer-events-auto">
        
        {/* 1. Left Section */}
        <div className={`flex-1 h-16 rounded-l-3xl border-l border-y ${barClass} flex items-center justify-evenly pr-2`}>
            <NavButton item={navItems[0]} activeTab={activeTab} onClick={onTabChange} />
            <NavButton item={navItems[1]} activeTab={activeTab} onClick={onTabChange} />
        </div>

        {/* 2. Middle Section (Liquid Curve SVG) */}
        <div className="relative w-[100px] h-[100px] -mb-[36px] flex-shrink-0 flex justify-center">
            {/* 
               SVG Curve Logic:
               Width: 100px, Height: 64px (matching bar height)
               We draw a path that starts top-left, curves down, curves up, goes top-right.
               Then closes the box at the bottom.
            */}
            <svg 
                width="100" 
                height="64" 
                viewBox="0 0 100 64" 
                className="absolute bottom-[36px] w-full h-16"
                preserveAspectRatio="none"
            >
                <path 
                    d="M0,0 L18,0 C18,0 28,0 28,20 C28,48 40,48 50,48 C60,48 72,48 72,20 C72,0 82,0 82,0 L100,0 L100,64 L0,64 Z" 
                    className="fill-zinc-900/95 dark:fill-black/95 stroke-zinc-800" 
                    strokeWidth="1"
                    // Hide the vertical side borders of the SVG to merge with divs
                    vectorEffect="non-scaling-stroke" 
                />
                {/* Overlay to hide the top border seam if any, using same path but fill only, no stroke */}
                <path 
                    d="M0,1 L18,1 C18,1 28,1 28,21 C28,49 40,49 50,49 C60,49 72,49 72,21 C72,1 82,1 82,1 L100,1 L100,64 L0,64 Z" 
                    className="fill-zinc-900/95 dark:fill-black/95" 
                />
            </svg>

            {/* Floating Action Button */}
            <div className="absolute top-[8px] z-10">
                <button
                    onClick={onAddClick}
                    className="w-16 h-16 bg-primary text-black rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(202,252,1,0.6)] active:scale-95 transition-transform group"
                >
                    <Zap size={32} strokeWidth={2.5} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                </button>
            </div>
        </div>

        {/* 3. Right Section */}
        <div className={`flex-1 h-16 rounded-r-3xl border-r border-y ${barClass} flex items-center justify-evenly pl-2`}>
            <NavButton item={navItems[3]} activeTab={activeTab} onClick={onTabChange} />
            <NavButton item={navItems[4]} activeTab={activeTab} onClick={onTabChange} />
        </div>

      </div>
    </div>
  );
};

// Sub-component for clean rendering
const NavButton = ({ item, activeTab, onClick }: { item: any, activeTab: string, onClick: (id: string) => void }) => {
    const isActive = activeTab === item.id;
    const Icon = item.icon;
    
    return (
        <button
            onClick={() => onClick(item.id)}
            className={`flex flex-col items-center justify-center w-12 gap-1 transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}
        >
            <Icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`transition-colors duration-300 ${isActive ? 'text-primary drop-shadow-[0_0_8px_rgba(202,252,1,0.5)]' : 'text-zinc-500'}`} 
            />
        </button>
    );
}