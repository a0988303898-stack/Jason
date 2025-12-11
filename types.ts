export interface User {
  id: string;
  username: string;
  passwordHash: string; // Simple simulation
  name: string;
}

export enum AccountType {
  BANK = 'Bank',
  CASH = 'Cash',
  INVESTMENT = 'Investment',
}

export interface BankAccount {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  bankName?: string;
}

export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
  TRANSFER = 'Transfer',
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO Date string
  note?: string;
}

export interface StockPosition {
  id: string;
  userId: string;
  symbol: string; // e.g., "2330.TW", "AAPL"
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number; // Last fetched price
  lastUpdated: string;
}

export interface StockTransaction {
  id: string;
  stockId: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  date: string;
  fees: number;
}

export interface StockSearchResult {
  symbol: string;
  price: number;
  currency: string;
  name?: string;
}

export type ViewState = 'DASHBOARD' | 'ACCOUNTS' | 'TRANSACTIONS' | 'STOCKS' | 'REPORTS';
