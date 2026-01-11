import React, { useState } from 'react';
import { Lock, ChevronRight } from 'lucide-react';

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

    // Simulation of NextAuth backend validation
    // In production, this would POST to /api/auth/callback/credentials
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
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[128px]"></div>
      </div>

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="mx-auto w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 border border-white/10 backdrop-blur-md">
            <Lock className="text-emerald-500" size={20} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">FinVault Access</h1>
          <p className="text-zinc-500 text-sm mt-2">Bảo mật cấp độ tài chính</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
          <div className="space-y-1">
            <label className="text-xs text-zinc-400 font-medium uppercase tracking-wider ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              placeholder="admin@finvault.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400 font-medium uppercase tracking-wider ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium py-3 rounded-lg shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                Đăng nhập an toàn <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
                Protected by 256-bit AES Encryption
            </p>
        </div>
      </div>
    </div>
  );
};
