import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// ------------------------------------------------------------------
// CONFIGURATION
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

// Initialize Firebase
if (!firebase.apps.length) {
  try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
  } catch (err) {
    console.error("Firebase Initialization Error:", err);
    // Rethrow to ensure global error handler catches it and shows on screen
    throw new Error("Failed to initialize Firebase: " + (err instanceof Error ? err.message : String(err)));
  }
}

export const auth = firebase.auth();
export const db = firebase.firestore();