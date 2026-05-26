// Authentication store using Zustand
import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { createUserProfile, getUserProfile, seedDefaultCategories } from '../lib/firestore';

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  userProfile: null,
  isLoading: true,
  error: null,

  // Initialize auth listener
  initializeAuth: () => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const profile = await getUserProfile(firebaseUser.uid);
        set({
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          },
          userProfile: profile,
          isLoading: false,
          error: null,
        });
      } else {
        // User is signed out
        set({
          user: null,
          userProfile: null,
          isLoading: false,
          error: null,
        });
      }
    });
  },

  // Register new user
  register: async (email, password, displayName) => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user: firebaseUser } = userCredential;

      // Update display name
      await updateProfile(firebaseUser, { displayName });

      // Create user profile in Firestore
      await createUserProfile(firebaseUser.uid, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName,
        photoURL: null,
      });

      // Seed default categories
      await seedDefaultCategories(firebaseUser.uid);

      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Login existing user
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Logout
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await signOut(auth);
      set({ user: null, userProfile: null, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
