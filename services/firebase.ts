import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Helper to get config safely
const getFirebaseConfig = () => {
  // Fix TS error: cast import.meta to any to access env
  const env = (import.meta as any).env;

  // 1. Try Vite Env Vars (Render / .env)
  if (env && env.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID
    };
  }

  // 2. Fallback to Window Object (Legacy/index.html injection)
  if (typeof window !== 'undefined' && window.__firebase_config && window.__firebase_config.apiKey) {
    return window.__firebase_config;
  }
  
  // 3. Dummy Config (Prevents crash, allows Demo Mode)
  return {
      apiKey: "dummy-api-key",
      authDomain: "dummy.firebaseapp.com",
      projectId: "dummy-project",
      storageBucket: "dummy.appspot.com",
      messagingSenderId: "00000000000",
      appId: "1:00000000000:web:00000000000000"
  };
};

const app = initializeApp(getFirebaseConfig());

export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = (typeof window !== 'undefined' && window.__app_id) ? window.__app_id : 'abfit-elite-production';