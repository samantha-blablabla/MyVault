import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { UserState } from './types';
import { FinanceProvider } from './context/FinanceContext';

const App: React.FC = () => {
  // BYPASS LOGIN: Set default isAuthenticated to true
  const [user, setUser] = useState<UserState>({
    isAuthenticated: true, 
    name: 'Admin User',
    totalNetWorth: 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem('finvault_auth');
    if (storedAuth === 'true') {
      setUser((prev) => ({ ...prev, isAuthenticated: true, name: 'Admin User' }));
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    localStorage.setItem('finvault_auth', 'true');
    setUser({ isAuthenticated: true, name: 'Admin User', totalNetWorth: 0 });
  };

  const handleLogout = () => {
    localStorage.removeItem('finvault_auth');
    setUser({ isAuthenticated: false, name: '', totalNetWorth: 0 });
  };

  if (loading) return null;

  return (
    <FinanceProvider>
      {user.isAuthenticated ? (
        <Dashboard user={user} logout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </FinanceProvider>
  );
};

export default App;
