import { User, BankAccount, Transaction, StockPosition } from '../types';
import { auth, db } from './firebase';

const COLLECTIONS = {
  USERS: 'users',
  ACCOUNTS: 'accounts',
  TRANSACTIONS: 'transactions',
  STOCKS: 'stocks',
};

// User Auth
// Removed try-catch to allow UI to handle and display specific error messages
export const registerUser = async (user: User): Promise<void> => {
  const userCredential = await auth.createUserWithEmailAndPassword(user.username, user.passwordHash); // treat username as email
  if (userCredential.user) {
    await userCredential.user.updateProfile({ displayName: user.name });
    // Create a user document for extra metadata if needed
    await db.collection(COLLECTIONS.USERS).doc(userCredential.user.uid).set({
      name: user.name,
      email: user.username,
      createdAt: new Date().toISOString()
    });
  }
};

export const loginUser = async (username: string, passwordHash: string): Promise<User> => {
  const userCredential = await auth.signInWithEmailAndPassword(username, passwordHash);
  const u = userCredential.user;
  if (!u) throw new Error("User not found");
  return {
    id: u.uid,
    username: u.email || '',
    name: u.displayName || 'User',
    passwordHash: '' // Don't store/return password
  };
};

export const logoutUser = async () => {
  await auth.signOut();
};

// Helper to transform Firestore doc to our type
const mapDoc = <T>(doc: any): T => ({ id: doc.id, ...doc.data() });

// Accounts
export const getAccounts = async (userId: string): Promise<BankAccount[]> => {
  const snapshot = await db.collection(COLLECTIONS.ACCOUNTS).where("userId", "==", userId).get();
  return snapshot.docs.map(d => mapDoc<BankAccount>(d));
};

export const saveAccount = async (account: BankAccount): Promise<void> => {
  const { id, ...data } = account;
  await db.collection(COLLECTIONS.ACCOUNTS).doc(id).set(data, { merge: true });
};

export const removeAccount = async (id: string): Promise<void> => {
  await db.collection(COLLECTIONS.ACCOUNTS).doc(id).delete();
};

// Transactions
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  const snapshot = await db.collection(COLLECTIONS.TRANSACTIONS).where("userId", "==", userId).get();
  return snapshot.docs.map(d => mapDoc<Transaction>(d));
};

export const saveTransaction = async (tx: Transaction): Promise<void> => {
  const { id, ...data } = tx;
  await db.collection(COLLECTIONS.TRANSACTIONS).doc(id).set(data, { merge: true });
};

export const removeTransaction = async (id: string): Promise<void> => {
  await db.collection(COLLECTIONS.TRANSACTIONS).doc(id).delete();
};

// Stocks
export const getStocks = async (userId: string): Promise<StockPosition[]> => {
  const snapshot = await db.collection(COLLECTIONS.STOCKS).where("userId", "==", userId).get();
  return snapshot.docs.map(d => mapDoc<StockPosition>(d));
};

export const saveStock = async (stock: StockPosition): Promise<void> => {
  const { id, ...data } = stock;
  await db.collection(COLLECTIONS.STOCKS).doc(id).set(data, { merge: true });
};

export const removeStock = async (id: string): Promise<void> => {
  await db.collection(COLLECTIONS.STOCKS).doc(id).delete();
};