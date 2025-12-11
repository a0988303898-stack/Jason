import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// CONFIGURATION REQUIRED
// ------------------------------------------------------------------
// Please replace the object below with your actual Firebase config.
// You can get this from Firebase Console -> Project Settings -> General
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyA4GlqxdU_Elmb91v6DS8qAMj1W73bt8V8",
  authDomain: "money-40aa4.firebaseapp.com",
  projectId: "money-40aa4",
  storageBucket: "money-40aa4.firebasestorage.app",
  messagingSenderId: "548808186578",
  appId: "1:548808186578:web:687cc13ff0316622cfeb0b",
  measurementId: "G-TDFM7TLXLK"
};

// Check if user has configured the app properly
// We check if apiKey is the placeholder text or empty
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("YOUR_API_KEY")) {
  console.error("Firebase config is missing!");
  alert("Login Error: Firebase Configuration is missing.\n\nPlease open 'services/firebase.ts' and replace the placeholder config with your actual Firebase project keys.");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);