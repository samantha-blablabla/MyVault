import React, { useState } from 'react';
import { Lock, ChevronRight, Zap } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (email === 'admin@finvault.com' && password === 'admin123') {
        onLogin();
      } else {
        setError('Thông tin đăng nhập không chính xác.');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark bg-grid-fixed relative overflow-hidden transition-colors duration-300 p-4">
      
      {/* Abstract Shapes (Neo-Brutalist Decor) */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-zinc-200 dark:bg-white rounded-full blur-3xl opacity-10 animate-float" style={{animationDelay: '1s'}}></div>
      
      {/* Main Card */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-8 rounded-3xl shadow-xl dark:shadow-2xl relative z-10">
        
        {/* Floating Icon */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-primary rounded-2xl rotate-12 flex items-center justify-center shadow-hard border-2 border-white dark:border-zinc-900">
            <Lock className="text-black" size={32} />
        </div>

        <div className="text-center mt-10 mb-8 animate-fade-in">
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter italic">FINVAULT</h1>
          <p className="text-zinc-500 dark:text-white/60 text-sm mt-1 font-bold uppercase tracking-widest">Access Control</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
          <div className="space-y-1">
            <label className="text-xs text-zinc-500 dark:text-white/60 font-black uppercase tracking-wider ml-1">Email Access</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-black/40 border-2 border-zinc-200 dark:border-white/10 rounded-xl px-4 py-4 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:outline-none focus:border-zinc-900 dark:focus:border-primary font-bold transition-all"
              placeholder="admin@finvault.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-500 dark:text-white/60 font-black uppercase tracking-wider ml-1">Passkey</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-black/40 border-2 border-zinc-200 dark:border-white/10 rounded-xl px-4 py-4 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:outline-none focus:border-zinc-900 dark:focus:border-primary font-bold transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-200 text-sm text-center font-bold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-zinc-900 dark:bg-primary text-white dark:text-black font-black text-lg py-4 rounded-xl shadow-lg hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-4 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin"></span>
            ) : (
              <>
                ENTER VAULT <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center opacity-50">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-300 dark:border-white/20">
                 <Zap size={12} fill="currentColor" className="text-zinc-400 dark:text-white" />
                 <span className="text-[10px] font-bold text-zinc-400 dark:text-white uppercase tracking-widest">Secured by E2E</span>
             </div>
        </div>
      </div>
    </div>
  );
};