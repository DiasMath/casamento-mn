import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

console.log('Loading Firebase config...');
console.log('API Key:', import.meta.env.VITE_FIREBASE_API_KEY ? 'present' : 'missing');
console.log('Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'present' : 'missing');

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

console.log('Firebase config created');

let app;
let authInstance;
let dbInstance;

try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized');
  authInstance = getAuth(app);
  dbInstance = getFirestore(app);
  console.log('Auth and DB initialized');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Export the instances (may be undefined if initialization failed)
export const auth = authInstance;
export const db = dbInstance;
export const PIX_KEY = import.meta.env.VITE_PIX_KEY || '';

export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@casamento.com';
// ADMIN_PASSWORD is no longer needed - we validate against Firebase Auth