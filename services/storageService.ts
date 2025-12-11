import { User, BankAccount, Transaction, StockPosition } from '../types';
import { auth, db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc 
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';

const COLLECTIONS = {
  USERS: 'users',
  ACCOUNTS: 'accounts',
  TRANSACTIONS: 'transactions',
  STOCKS: 'stocks',
};

// User Auth
// Removed try-catch to allow UI to handle and display specific error messages
export const registerUser = async (user: User): Promise<void> => {
  const userCredential = await createUserWithEmailAndPassword(auth, user.username, user.passwordHash); // treat username as email
  await updateProfile(userCredential.user, { displayName: user.name });
  // Create a user document for extra metadata if needed
  await setDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid), {
    name: user.name,
    email: user.username,
    createdAt: new Date().toISOString()
  });
};

export const loginUser = async (username: string, passwordHash: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, username, passwordHash);
  const u = userCredential.user;
  return {
    id: u.uid,
    username: u.email || '',
    name: u.displayName || 'User',
    passwordHash: '' // Don't store/return password
  };
};

export const logoutUser = async () => {
  await signOut(auth);
};

// Helper to transform Firestore doc to our type
const mapDoc = <T>(doc: any): T => ({ id: doc.id, ...doc.data() });

// Accounts
export const getAccounts = async (userId: string): Promise<BankAccount[]> => {
  const q = query(collection(db, COLLECTIONS.ACCOUNTS), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => mapDoc<BankAccount>(d));
};

export const saveAccount = async (account: BankAccount): Promise<void> => {
  const { id, ...data } = account;
  await setDoc(doc(db, COLLECTIONS.ACCOUNTS, id), data, { merge: true });
};

export const removeAccount = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.ACCOUNTS, id));
};

// Transactions
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  const q = query(collection(db, COLLECTIONS.TRANSACTIONS), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => mapDoc<Transaction>(d));
};

export const saveTransaction = async (tx: Transaction): Promise<void> => {
  const { id, ...data } = tx;
  await setDoc(doc(db, COLLECTIONS.TRANSACTIONS, id), data, { merge: true });
};

export const removeTransaction = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.TRANSACTIONS, id));
};

// Stocks
export const getStocks = async (userId: string): Promise<StockPosition[]> => {
  const q = query(collection(db, COLLECTIONS.STOCKS), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => mapDoc<StockPosition>(d));
};

export const saveStock = async (stock: StockPosition): Promise<void> => {
  const { id, ...data } = stock;
  await setDoc(doc(db, COLLECTIONS.STOCKS, id), data, { merge: true });
};

export const removeStock = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.STOCKS, id));
};