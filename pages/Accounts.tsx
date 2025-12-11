import React, { useState, useEffect } from 'react';
import { User, BankAccount, AccountType } from '../types';
import { getAccounts, saveAccount, removeAccount } from '../services/storageService';
import Button from '../components/Button';
import Modal from '../components/Modal';

interface AccountsProps {
  user: User;
}

const Accounts: React.FC<AccountsProps> = ({ user }) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>(AccountType.BANK);
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState('TWD');
  const [bankName, setBankName] = useState('');

  const refreshAccounts = async () => {
    setLoading(true);
    const data = await getAccounts(user.id);
    setAccounts(data);
    setLoading(false);
  };

  useEffect(() => {
    refreshAccounts();
  }, [user.id]);

  const handleOpenModal = (account?: BankAccount) => {
    if (account) {
      setEditingId(account.id);
      setName(account.name);
      setType(account.type);
      setBalance(account.balance.toString());
      setCurrency(account.currency);
      setBankName(account.bankName || '');
    } else {
      setEditingId(null);
      setName('');
      setType(AccountType.BANK);
      setBalance('');
      setCurrency('TWD');
      setBankName('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const newAccount: BankAccount = {
      id: editingId || crypto.randomUUID(),
      userId: user.id,
      name,
      type,
      balance: parseFloat(balance),
      currency,
      bankName: type === AccountType.BANK ? bankName : undefined,
    };
    await saveAccount(newAccount);
    setSubmitting(false);
    setIsModalOpen(false);
    refreshAccounts();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      await removeAccount(id);
      refreshAccounts();
    }
  };

  if (loading && accounts.length === 0) {
      return <div className="text-center p-8 text-gray-500">Loading accounts...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Accounts</h2>
        <Button onClick={() => handleOpenModal()}>
          <i className="fas fa-plus mr-2"></i> Add Account
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className={`h-2 w-full ${acc.type === AccountType.BANK ? 'bg-blue-500' : acc.type === AccountType.INVESTMENT ? 'bg-purple-500' : 'bg-green-500'}`}></div>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{acc.type}</span>
                    <h3 className="text-lg font-bold text-gray-900 mt-1">{acc.name}</h3>
                    {acc.bankName && <p className="text-sm text-gray-500">{acc.bankName}</p>}
                </div>
                <button onClick={() => handleDelete(acc.id)} className="text-gray-400 hover:text-red-500">
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
              
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-1">Current Balance</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">{acc.currency}</span>
                  <span className="text-3xl font-bold text-gray-900">{acc.balance.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50 flex justify-end">
                 <button onClick={() => handleOpenModal(acc)} className="text-sm text-blue-600 font-medium hover:text-blue-800">
                    Edit Details
                 </button>
              </div>
            </div>
          </div>
        ))}

        {accounts.length === 0 && !loading && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                <p>No accounts found. Add one to get started!</p>
            </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Account' : 'New Account'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as AccountType)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                {Object.values(AccountType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {type === AccountType.BANK && (
            <div>
                <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
          )}
           <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Balance</label>
                <input type="number" step="0.01" required value={balance} onChange={(e) => setBalance(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Currency</label>
                <input type="text" required value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
           </div>
           <div className="mt-5 sm:mt-6">
             <Button type="submit" className="w-full" isLoading={submitting}>Save Account</Button>
           </div>
        </form>
      </Modal>
    </div>
  );
};

export default Accounts;