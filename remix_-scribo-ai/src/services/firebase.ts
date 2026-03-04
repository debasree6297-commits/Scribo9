import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getFirestore, Firestore, enableIndexedDbPersistence } from "firebase/firestore";
import {
  getAuth,
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD5IdgBRDh3QjJUpsOMUJXs24SLMjO_LyM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "scribo-ai-99eeb.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "scribo-ai-99eeb",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "scribo-ai-99eeb.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "69014787122",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:69014787122:web:7f712aa7b09c216f88182b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-S5SJ1D17W6"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize services
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// Enable offline persistence
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
      console.log('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
    } else if (err.code == 'unimplemented') {
      console.log('The current browser does not support all of the features required to enable persistence');
    }
  });
} catch(e) {
  console.log('Persistence not available');
}

let analytics: Analytics | null = null;

// Analytics is only supported in browser environments
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Set persistence
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting persistence:", error);
});

// Configure Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export {
  app,
  auth,
  db,
  analytics,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
};
