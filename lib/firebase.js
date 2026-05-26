// Firebase configuration with lazy initialization
// This file will NOT crash if Firebase credentials are missing or invalid

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get config from expo-constants (populated from app.config.js extra field)
// Fall back to process.env for development
const getConfig = () => {
  const extra = Constants.expoConfig?.extra || {};

  return {
    apiKey: extra.firebaseApiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: extra.firebaseAuthDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: extra.firebaseProjectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: extra.firebaseStorageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: extra.firebaseMessagingSenderId || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: extra.firebaseAppId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  };
};

const firebaseConfig = getConfig();

// Debug log to help diagnose issues
console.log('Firebase config check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  apiKeyPrefix: firebaseConfig.apiKey?.substring(0, 4) || 'none',
  hasProjectId: !!firebaseConfig.projectId,
  projectId: firebaseConfig.projectId || 'none',
});

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  const config = getConfig(); // Get fresh config
  const apiKey = config.apiKey || '';
  const projectId = config.projectId || '';

  // Check if API key looks like a real Firebase API key (starts with AIza)
  const hasValidApiKey = apiKey.startsWith('AIza') && apiKey.length > 20;

  // Check if projectId is not a placeholder
  const hasValidProjectId = projectId &&
    projectId.length > 0 &&
    !projectId.includes('your_') &&
    !projectId.includes('your-') &&
    projectId !== 'your_project_id';

  console.log('isFirebaseConfigured check:', { hasValidApiKey, hasValidProjectId, apiKey: apiKey.substring(0, 8), projectId });

  return hasValidApiKey && hasValidProjectId;
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

  if (!isFirebaseConfigured()) {
    _initialized = true;
    _initError = new Error('Firebase not configured');
    console.warn(
      '\n⚠️ Firebase is not configured!\n\n' +
      'To use SmartCart, you need to:\n' +
      '1. Create a Firebase project at https://firebase.google.com\n' +
      '2. Add your credentials to the .env file\n' +
      '3. Restart the app with: npm start -- --clear\n\n' +
      'See SETUP_GUIDE.md for detailed instructions.\n'
    );
    return { app: null, auth: null, db: null, error: _initError };
  }

  try {
    const config = getConfig(); // Get fresh config for initialization

    // Dynamically import Firebase modules only when needed
    const { initializeApp } = await import('firebase/app');
    const { initializeAuth, getReactNativePersistence } = await import('firebase/auth');
    const { getFirestore } = await import('firebase/firestore');

    _app = initializeApp(config);
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
