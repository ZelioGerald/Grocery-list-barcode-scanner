import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// List of placeholder values that indicate Firebase is not configured
const PLACEHOLDER_VALUES = [
  'your_api_key_here',
  'your_project_id',
  'your_project',
  'your_sender_id',
  'your_app_id',
  undefined,
  null,
  '',
];

// Check if a value is a valid Firebase config value (not a placeholder)
const isValidConfigValue = (value) => {
  if (!value) return false;
  const lowerValue = value.toLowerCase();
  return !PLACEHOLDER_VALUES.some(
    (placeholder) => placeholder && lowerValue.includes(placeholder.toLowerCase())
  );
};

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  const apiKey = firebaseConfig.apiKey;
  const projectId = firebaseConfig.projectId;

  // Check if API key looks like a real Firebase API key (starts with AIza)
  const hasValidApiKey = apiKey && apiKey.startsWith('AIza') && apiKey.length > 20;
  const hasValidProjectId = isValidConfigValue(projectId) && !projectId.includes('your');

  return hasValidApiKey && hasValidProjectId;
};

let app = null;
let auth = null;
let db = null;
let firebaseError = null;

// Only attempt to initialize if we have valid-looking credentials
if (isFirebaseConfigured()) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);

    // Initialize Auth with AsyncStorage persistence
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });

    // Initialize Firestore
    db = getFirestore(app);

    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
    firebaseError = error;
    app = null;
    auth = null;
    db = null;
  }
} else {
  console.warn(
    '\n⚠️ Firebase is not configured!\n\n' +
    'To use SmartCart, you need to:\n' +
    '1. Create a Firebase project at https://firebase.google.com\n' +
    '2. Add your credentials to the .env file\n' +
    '3. Restart the app with: npm start -- --clear\n\n' +
    'See SETUP_GUIDE.md for detailed instructions.\n'
  );
}

export { app, auth, db, isFirebaseConfigured, firebaseError };
