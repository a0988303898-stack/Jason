export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Housing',
  'Utilities',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Education',
  'Travel',
  'Other'
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Bonus',
  'Investment Dividends',
  'Freelance',
  'Gift',
  'Other'
];

export const STOCK_MARKETS = [
  { code: 'TW', name: 'Taiwan (TWSE)' },
  { code: 'US', name: 'USA (NASDAQ/NYSE)' },
];

export const MOCK_INITIAL_DATA = {
  accounts: [
    { id: '1', userId: 'demo', name: 'CTBC Primary', type: 'Bank', balance: 150000, currency: 'TWD', bankName: 'CTBC' },
    { id: '2', userId: 'demo', name: 'Wallet Cash', type: 'Cash', balance: 5000, currency: 'TWD' },
  ],
  transactions: [
    { id: 't1', userId: 'demo', accountId: '1', amount: 50000, type: 'Income', category: 'Salary', date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), note: 'Monthly Salary' },
    { id: 't2', userId: 'demo', accountId: '1', amount: 250, type: 'Expense', category: 'Food & Dining', date: new Date().toISOString(), note: 'Lunch' },
    { id: 't3', userId: 'demo', accountId: '2', amount: 1200, type: 'Expense', category: 'Transportation', date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), note: 'High Speed Rail' },
  ],
  stocks: [
    { id: 's1', userId: 'demo', symbol: '2330.TW', name: 'TSMC', shares: 1000, avgCost: 550, currentPrice: 980, lastUpdated: new Date().toISOString() },
    { id: 's2', userId: 'demo', symbol: 'AAPL', name: 'Apple Inc.', shares: 10, avgCost: 150, currentPrice: 220, lastUpdated: new Date().toISOString() },
  ]
};