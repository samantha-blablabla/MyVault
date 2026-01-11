import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  title?: ReactNode; // Changed from string to ReactNode
  action?: ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', title, action }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/60 backdrop-blur-md shadow-2xl transition-all duration-300 hover:border-white/10 flex flex-col ${className}`}>
      {/* Subtle Gradient Glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl"></div>
      
      {(title || action) && (
        <div className="flex-none flex items-center justify-between border-b border-white/5 px-6 py-4">
          {/* Allow title to be a string or a custom component */}
          <div className="text-sm font-medium tracking-wide text-zinc-400 uppercase flex items-center gap-2">
             {title}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="flex-1 p-6 min-h-0 flex flex-col">
        {children}
      </div>
    </div>
  );
};