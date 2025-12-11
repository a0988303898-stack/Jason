import React, { useState, useEffect } from 'react';
import { User, ViewState } from './types';
import { logoutUser } from './services/storageService';
import { auth } from './services/firebase';
import Auth from './components/Auth';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Stocks from './pages/Stocks';
import Reports from './pages/Reports';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Firebase Auth Listener
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          username: firebaseUser.email || '',
          name: firebaseUser.displayName || 'User',
          passwordHash: ''
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setCurrentView('DASHBOARD');
  };

  const NavItem = ({ view, icon, label }: { view: ViewState; icon: string; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${
        currentView === view
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
      }`}
    >
      <i className={`fas ${icon} w-5 text-center`}></i>
      <span className="font-medium">{label}</span>
    </button>
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading WealthFlow...</div>;
  }

  if (!user) {
    return <Auth onLogin={() => {}} />; // onLogin is handled by auth state listener
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-20">
        <h1 className="text-xl font-bold text-blue-600">WealthFlow</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 focus:outline-none">
          <i className="fas fa-bars text-2xl"></i>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          isMobileMenuOpen ? 'block' : 'hidden'
        } md:block fixed md:sticky top-0 z-10 h-screen w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 transition-all`}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
             <span className="text-xl font-bold text-gray-800">WealthFlow</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500">
             <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-4 space-y-2">
          <NavItem view="DASHBOARD" icon="fa-chart-pie" label="Dashboard" />
          <NavItem view="ACCOUNTS" icon="fa-wallet" label="Accounts" />
          <NavItem view="TRANSACTIONS" icon="fa-list-ul" label="Transactions" />
          <NavItem view="STOCKS" icon="fa-chart-line" label="Portfolio" />
          <NavItem view="REPORTS" icon="fa-file-invoice-dollar" label="Reports" />
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user.name}</p>
              <p className="text-xs text-gray-500">Standard Plan</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-white hover:text-red-600 transition-colors"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-60px)] md:h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {currentView === 'DASHBOARD' && <Dashboard user={user} onViewChange={setCurrentView} />}
          {currentView === 'ACCOUNTS' && <Accounts user={user} />}
          {currentView === 'TRANSACTIONS' && <Transactions user={user} />}
          {currentView === 'STOCKS' && <Stocks user={user} />}
          {currentView === 'REPORTS' && <Reports user={user} />}
        </div>
      </main>
    </div>
  );
};

export default App;