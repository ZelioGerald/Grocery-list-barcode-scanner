// Firebase configuration for SmartCart
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCb9lRWqS9KxeS20AhwVNa-QTPbAohUzdI",
  authDomain: "smart-grocery-barcode-scanner.firebaseapp.com",
  projectId: "smart-grocery-barcode-scanner",
  storageBucket: "smart-grocery-barcode-scanner.firebasestorage.app",
  messagingSenderId: "703042969754",
  appId: "1:703042969754:web:47c69377ecc4979169ff23",
  measurementId: "G-CW120TZJ59"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore with offline persistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export { app, auth, db };
