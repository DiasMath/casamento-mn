import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { devLog } from "./devLog";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app;
let authInstance;
let dbInstance;

try {
  app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  dbInstance = getFirestore(app);
} catch (error) {
  devLog.error("Firebase initialization error:", error);
}

export const auth = authInstance;
export const db = dbInstance;
export const PIX_KEY = import.meta.env.VITE_PIX_KEY || "";

export const ADMIN_EMAIL =
  import.meta.env.VITE_ADMIN_EMAIL || "admin@casamento.com";
