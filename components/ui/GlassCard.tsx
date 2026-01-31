import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  action?: ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', title, action }) => {
  const hasHeader = Boolean(title || action);

  return (
    <div className={`relative overflow-hidden flex flex-col 
        /* LIGHT MODE: Clean White, Soft Shadow */
        bg-white 
        shadow-glass-sm
        rounded-2xl
        text-zinc-900
        
        /* DARK MODE: Pitch Black Background + Violet Tinted Surface */
        dark:bg-zinc-900/40 
        dark:backdrop-blur-xl
        dark:border dark:border-white/5
        dark:shadow-none
        dark:text-zinc-100
        
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-glow/20
        ${className}`}
    >
      {hasHeader && (
        <div className="flex-none flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-white/5">
          <div className="text-sm font-bold tracking-wide text-zinc-900 dark:text-zinc-300 flex items-center gap-2">
            {/* Simple clean title */}
            <span className="relative z-10 px-1">
              {title}
            </span>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      {/* 
         Consistent Padding: Rule of 4px -> px-6 (24px)
      */}
      <div className={`flex-1 px-6 pb-6 min-h-0 flex flex-col ${hasHeader ? 'pt-6' : 'pt-6'}`}>
        {children}
      </div>
    </div>
  );
};