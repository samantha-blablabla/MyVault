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
        /* LIGHT MODE: Neo-Brutalism (White BG, Black Text, Hard Shadow) */
        bg-white 
        border-2 border-black 
        shadow-hard 
        rounded-2xl
        text-zinc-900
        
        /* DARK MODE: Solid Black (No transparency), White Text */
        dark:bg-zinc-950
        dark:border-zinc-800 dark:border
        dark:shadow-none
        dark:text-zinc-100
        
        transition-all duration-300 ease-out
        hover:-translate-y-1 
        ${className}`}
    >
      {hasHeader && (
        <div className="flex-none flex items-center justify-between px-6 py-5">
          <div className="text-sm font-bold tracking-wider text-zinc-900 dark:text-zinc-400 uppercase flex items-center gap-2">
             {/* Highlight Effect for Title in Light Mode */}
             <span className="relative z-10 px-1">
                <span className="absolute inset-0 bg-primary/60 dark:bg-transparent -skew-x-6 rounded-sm -z-10"></span>
                {title}
             </span>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      
      {/* 
         Consistent Padding: 
         - px-6 (24px) horizontal
         - pb-6 (24px) bottom
         - pt-6 (24px) top if no header, else pt-0 (0px) to leverage header spacing
      */}
      <div className={`flex-1 px-6 pb-6 min-h-0 flex flex-col ${hasHeader ? 'pt-0' : 'pt-6'}`}>
        {children}
      </div>
    </div>
  );
};