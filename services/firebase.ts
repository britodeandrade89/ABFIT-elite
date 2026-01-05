import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Initialize Firebase
// Using the global config injected in index.html for this demo environment
const configFromWindow = window.__firebase_config;

// Fallback config to prevent "auth/configuration-not-found" error.
// This ensures the app can initialize even if the global config is missing,
// allowing App.tsx to gracefully handle the auth failure and switch to demo mode.
const firebaseConfig = (configFromWindow && configFromWindow.apiKey) 
  ? configFromWindow 
  : {
      apiKey: "mock-api-key-fallback",
      authDomain: "mock.firebaseapp.com",
      projectId: "mock-project",
      storageBucket: "mock.appspot.com",
      messagingSenderId: "00000000000",
      appId: "1:00000000000:web:00000000000000"
    };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = window.__app_id || 'abfit-elite-production';