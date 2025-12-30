import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Initialize Firebase
// Using the global config injected in index.html for this demo environment
const firebaseConfig = window.__firebase_config || {};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = window.__app_id || 'abfit-elite-production';
