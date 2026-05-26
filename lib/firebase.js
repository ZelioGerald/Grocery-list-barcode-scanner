// Firebase configuration with your credentials
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCb9lRWqS9KxeS20AhwVNa-QTPbAohUzdI",
  authDomain: "smart-grocery-barcode-scanner.firebaseapp.com",
  projectId: "smart-grocery-barcode-scanner",
  storageBucket: "smart-grocery-barcode-scanner.firebasestorage.app",
  messagingSenderId: "703042969754",
  appId: "1:703042969754:web:47c69377ecc4979169ff23",
  measurementId: "G-CW120TZJ59"
};

// Firebase is now always configured since credentials are hardcoded
const isFirebaseConfigured = () => {
  return true;
};

// Lazy-loaded Firebase instances
let _app = null;
let _auth = null;
let _db = null;
let _initialized = false;
let _initError = null;

// Initialize Firebase lazily (only when actually needed)
const initializeFirebase = async () => {
  if (_initialized) {
    return { app: _app, auth: _auth, db: _db, error: _initError };
  }

  try {
    // Dynamically import Firebase modules only when needed
    const { initializeApp } = await import('firebase/app');
    const { initializeAuth, getReactNativePersistence } = await import('firebase/auth');
    const { getFirestore } = await import('firebase/firestore');

    _app = initializeApp(firebaseConfig);
    _auth = initializeAuth(_app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    _db = getFirestore(_app);
    _initialized = true;

    console.log('✅ Firebase initialized successfully');
    return { app: _app, auth: _auth, db: _db, error: null };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    _initialized = true;
    _initError = error;
    return { app: null, auth: null, db: null, error };
  }
};

// Getters that return null if not initialized (safe to use)
const getApp = () => _app;
const getAuth = () => _auth;
const getDb = () => _db;
const getInitError = () => _initError;
const isInitialized = () => _initialized;

export {
  firebaseConfig,
  isFirebaseConfigured,
  initializeFirebase,
  getApp,
  getAuth,
  getDb,
  getInitError,
  isInitialized,
};

// For backward compatibility - these will be null until initializeFirebase() is called
export const app = null;
export const auth = null;
export const db = null;
