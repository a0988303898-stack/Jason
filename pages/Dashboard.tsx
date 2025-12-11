import React, { useEffect, useState } from 'react';
import { User, ViewState } from '../types';
import { getAccounts, getTransactions, getStocks } from '../services/storageService';
import { getFinancialAdvice } from '../services/geminiService';
import Button from '../components/Button';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  user: User;
  onViewChange: (view: ViewState) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard: React.FC<DashboardProps> = ({ user, onViewChange }) => {
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalStockValue, setTotalStockValue] = useState(0);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const accounts = await getAccounts(user.id);
        const balance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
        setTotalBalance(balance);

        const stocks = await getStocks(user.id);
        const stockVal = stocks.reduce((sum, s) => sum + (Number(s.shares) * Number(s.currentPrice)), 0);
        setTotalStockValue(stockVal);

        const transactions = await getTransactions(user.id);
        const expenses = transactions.filter(t => t.type === 'Expense');
        
        // Group expenses by category
        const catMap = new Map<string, number>();
        expenses.forEach(t => {
          const current = catMap.get(t.category) || 0;
          catMap.set(t.category, current + Number(t.amount));
        });

        const chartData = Array.from(catMap).map(([name, value]) => ({ name, value }));
        setExpenseData(chartData);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user.id]);

  const generateAdvice = async () => {
    setLoadingAdvice(true);
    const transactions = await getTransactions(user.id);
    const topExpenses = transactions
      .filter(t => t.type === 'Expense')
      .slice(0, 5)
      .map(t => `${t.category}: $${t.amount}`)
      .join(', ');

    const stocks = await getStocks(user.id);
    const portfolio = stocks.map(s => `${s.symbol} (${s.shares} shares)`).join(', ');

    const advice = await getFinancialAdvice(totalBalance, topExpenses, portfolio);
    setAiAdvice(advice);
    setLoadingAdvice(false);
  };

  if (loadingData) {
    return <div className="p-12 text-center text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user.name}</h2>
        <Button onClick={() => onViewChange('TRANSACTIONS')} variant="secondary" className="text-sm">
          + Add Transaction
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Net Worth Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Net Worth</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            ${(totalBalance + totalStockValue).toLocaleString()}
          </p>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <i className="fas fa-arrow-up mr-1"></i>
            <span>Asset Overview</span>
          </div>
        </div>

         {/* Cash Card */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Cash Balance</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            ${totalBalance.toLocaleString()}
          </p>
          <button onClick={() => onViewChange('ACCOUNTS')} className="mt-4 text-sm text-blue-600 hover:text-blue-700">
            Manage Accounts &rarr;
          </button>
        </div>

        {/* Stock Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Stock Value</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            ${totalStockValue.toLocaleString()}
          </p>
          <button onClick={() => onViewChange('STOCKS')} className="mt-4 text-sm text-purple-600 hover:text-purple-700">
            View Portfolio &rarr;
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insight Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
              <i className="fas fa-robot text-blue-600"></i> AI Financial Insight
            </h3>
            <Button size="sm" onClick={generateAdvice} isLoading={loadingAdvice} variant="primary" className="text-xs px-2 py-1">
              Generate Analysis
            </Button>
          </div>
          <div className="prose prose-sm text-gray-700">
            {aiAdvice ? (
              <p className="whitespace-pre-line">{aiAdvice}</p>
            ) : (
              <p className="text-gray-500 italic">
                Click generate to ask Gemini AI for a quick health check of your finances based on your current holdings and expenses.
              </p>
            )}
          </div>
        </div>

        {/* Expense Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
          <h3 className="text-lg font-bold text-gray-800 self-start mb-4">Expense Breakdown</h3>
          {expenseData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {expenseData.slice(0, 5).map((entry, index) => (
                    <div key={index} className="flex items-center text-xs text-gray-600">
                        <span className="w-2 h-2 rounded-full mr-1" style={{backgroundColor: COLORS[index % COLORS.length]}}></span>
                        {entry.name}
                    </div>
                ))}
              </div>
            </div>
          ) : (
             <div className="h-48 flex items-center justify-center text-gray-400">No expense data yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;