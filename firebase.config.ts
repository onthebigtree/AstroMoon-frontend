import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0kT7nItxPMpM8YjixgPs52cuiDFBVjZI",
  authDomain: "astromoon-f8837.firebaseapp.com",
  projectId: "astromoon-f8837",
  storageBucket: "astromoon-f8837.firebasestorage.app",
  messagingSenderId: "5377744716",
  appId: "1:5377744716:web:a54c60fe4fac0cf0a879e9",
  measurementId: "G-9B5D4SEEQP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
