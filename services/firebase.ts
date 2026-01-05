import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Helper to get config safely
const getFirebaseConfig = () => {
  if (typeof window !== 'undefined' && window.__firebase_config && window.__firebase_config.apiKey) {
    return window.__firebase_config;
  }
  
  // Return a dummy config to allow app initialization without crashing.
  // Auth calls will fail gracefully in App.tsx and fallback to Demo mode.
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
