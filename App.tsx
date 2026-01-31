import React, { useState, useEffect } from 'react';
import { OverviewView } from './components/views/OverviewView';
import { AssetsView } from './components/views/AssetsView';
import { PlanningView } from './components/views/PlanningView';
import { HistoryView } from './components/views/HistoryView';

import { Login } from './components/auth/Login';
import { UserState } from './types';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';
import { TransactionModal } from './components/modals/TransactionModal';
import { ExpenseModal } from './components/modals/ExpenseModal';

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState('overview');
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const { addTransaction, addDailyTransaction, logout } = useFinance();

  const renderView = () => {
    switch (activeView) {
      case 'overview': return <OverviewView />;
      case 'assets': return <AssetsView />;
      case 'planning': return <PlanningView />;
      case 'history': return <HistoryView />;
      default: return <OverviewView />;
    }
  };

  return (
    <AppLayout
      activeView={activeView}
      onViewChange={setActiveView}
      onAddClick={() => setIsExpenseModalOpen(true)}
      onLogout={logout}
    >
      {renderView()}

      {/* Global Modals */}
      <TransactionModal
        isOpen={isTransModalOpen}
        onClose={() => setIsTransModalOpen(false)}
        onSubmit={addTransaction}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSubmit={addDailyTransaction}
      />
    </AppLayout>
  );
};

// Router Logic to check Auth
const AppRouter: React.FC = () => {
  const { user, login } = useFinance();
  if (!user.isAuthenticated) {
    return <Login onLogin={() => login('Admin User')} />;
  }
  return <AppContent />;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <FinanceProvider>
        <AppRouter />
      </FinanceProvider>
    </ErrorBoundary>
  );
};

export default App;
