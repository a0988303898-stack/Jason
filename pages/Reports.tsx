import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { getTransactions } from '../services/storageService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ReportsProps {
  user: User;
}

const Reports: React.FC<ReportsProps> = ({ user }) => {
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const transactions = await getTransactions(user.id);
      
      // Process data for Monthly Income vs Expense
      const months = new Map<string, { income: number, expense: number }>();
      
      transactions.forEach(tx => {
          const date = new Date(tx.date);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
          
          const current = months.get(key) || { income: 0, expense: 0 };
          if (tx.type === 'Income') current.income += tx.amount;
          else if (tx.type === 'Expense') current.expense += tx.amount;
          
          months.set(key, current);
      });

      const data = Array.from(months.entries())
          .map(([month, val]) => ({ month, ...val }))
          .sort((a, b) => a.month.localeCompare(b.month));

      setMonthlyData(data);
      setLoading(false);
    };

    fetchData();
  }, [user.id]);

  if (loading) {
    return <div className="text-center p-8 text-gray-500">Generating reports...</div>;
  }

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-gray-800">Financial Reports</h2>

       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-gray-700 mb-6">Monthly Income vs Expenses</h3>
           <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={monthlyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
               </ResponsiveContainer>
           </div>
       </div>

       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-gray-700 mb-6">Net Savings Trend</h3>
           <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={monthlyData.map(d => ({ month: d.month, savings: d.income - d.expense }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                        <Legend />
                        <Line type="monotone" dataKey="savings" name="Net Savings" stroke="#3B82F6" strokeWidth={3} dot={{r: 4}} />
                    </LineChart>
               </ResponsiveContainer>
           </div>
       </div>
    </div>
  );
};

export default Reports;