import React, { useState, useEffect } from 'react';
import { User, Transaction, TransactionType, BankAccount } from '../types';
import { getTransactions, saveTransaction, removeTransaction, getAccounts, saveAccount } from '../services/storageService';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';
import Button from '../components/Button';
import Modal from '../components/Modal';

interface TransactionsProps {
  user: User;
}

const Transactions: React.FC<TransactionsProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const refreshData = async () => {
    setLoading(true);
    const [txs, accs] = await Promise.all([
      getTransactions(user.id),
      getAccounts(user.id)
    ]);
    setTransactions(txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setAccounts(accs);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [user.id]);

  const handleOpenModal = () => {
    if (accounts.length > 0) setAccountId(accounts[0].id);
    setAmount('');
    setType(TransactionType.EXPENSE);
    setCategory(EXPENSE_CATEGORIES[0]);
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    setSubmitting(true);

    const newTx: Transaction = {
      id: crypto.randomUUID(),
      userId: user.id,
      accountId,
      amount: val,
      type,
      category,
      date: new Date(date).toISOString(),
      note
    };

    await saveTransaction(newTx);

    // Update account balance logic
    const account = accounts.find(a => a.id === accountId);
    if (account) {
        if (type === TransactionType.INCOME) account.balance += val;
        else account.balance -= val;
        await saveAccount(account);
    }

    setSubmitting(false);
    setIsModalOpen(false);
    refreshData();
  };

  const handleDelete = async (tx: Transaction) => {
    if (confirm('Delete this transaction? This will revert the balance change.')) {
        await removeTransaction(tx.id);
        const account = accounts.find(a => a.id === tx.accountId);
        if (account) {
            if (tx.type === TransactionType.INCOME) account.balance -= tx.amount;
            else account.balance += tx.amount;
            await saveAccount(account);
        }
        refreshData();
    }
  };

  const categories = type === TransactionType.INCOME ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  if (loading && transactions.length === 0) {
      return <div className="text-center p-8 text-gray-500">Loading transactions...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Transactions</h2>
        <Button onClick={handleOpenModal}>
          <i className="fas fa-plus mr-2"></i> Record Transaction
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.type === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.note || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {accounts.find(a => a.id === tx.accountId)?.name || 'Unknown'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${tx.type === 'Income' ? 'text-green-600' : 'text-gray-900'}`}>
                    {tx.type === 'Expense' ? '-' : '+'}${tx.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button onClick={() => handleDelete(tx)} className="text-red-600 hover:text-red-900">
                        <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && !loading && (
                  <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No transactions recorded yet.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Transaction">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
                <button 
                    type="button" 
                    className={`flex-1 py-2 text-sm font-medium rounded-md ${type === TransactionType.EXPENSE ? 'bg-white shadow-sm text-red-600' : 'text-gray-500'}`}
                    onClick={() => { setType(TransactionType.EXPENSE); setCategory(EXPENSE_CATEGORIES[0]); }}
                >
                    Expense
                </button>
                <button 
                    type="button" 
                    className={`flex-1 py-2 text-sm font-medium rounded-md ${type === TransactionType.INCOME ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'}`}
                    onClick={() => { setType(TransactionType.INCOME); setCategory(INCOME_CATEGORIES[0]); }}
                >
                    Income
                </button>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="0.00" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Account</label>
                    <select required value={accountId} onChange={(e) => setAccountId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (${a.balance})</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Note (Optional)</label>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <div className="mt-5 sm:mt-6">
                <Button type="submit" className="w-full" isLoading={submitting}>Save Transaction</Button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default Transactions;