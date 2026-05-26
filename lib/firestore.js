// Firestore database utilities for SmartCart
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// ============ USER OPERATIONS ============

// Create or update user profile
export const createUserProfile = async (userId, userData) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    ...userData,
    createdAt: serverTimestamp(),
    settings: {
      theme: 'light',
      defaultUnit: 'pcs',
      sortByCategory: true,
    },
  }, { merge: true });
};

// Get user profile
export const getUserProfile = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

// Update user settings
export const updateUserSettings = async (userId, settings) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { settings });
};

// ============ LIST OPERATIONS ============

// Create a new list
export const createList = async (userId, listData) => {
  const listsRef = collection(db, 'users', userId, 'lists');
  const docRef = await addDoc(listsRef, {
    ...listData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    itemCount: 0,
    isActive: true,
  });
  return docRef.id;
};

// Get all lists for a user
export const getLists = async (userId) => {
  const listsRef = collection(db, 'users', userId, 'lists');
  const q = query(listsRef, orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get a single list
export const getList = async (userId, listId) => {
  const listRef = doc(db, 'users', userId, 'lists', listId);
  const snapshot = await getDoc(listRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

// Update a list
export const updateList = async (userId, listId, listData) => {
  const listRef = doc(db, 'users', userId, 'lists', listId);
  await updateDoc(listRef, {
    ...listData,
    updatedAt: serverTimestamp(),
  });
};

// Delete a list and all its items
export const deleteList = async (userId, listId) => {
  const batch = writeBatch(db);

  // Delete all items in the list
  const itemsRef = collection(db, 'users', userId, 'lists', listId, 'items');
  const itemsSnapshot = await getDocs(itemsRef);
  itemsSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Delete the list
  const listRef = doc(db, 'users', userId, 'lists', listId);
  batch.delete(listRef);

  await batch.commit();
};

// Subscribe to lists (real-time updates)
export const subscribeToLists = (userId, callback) => {
  const listsRef = collection(db, 'users', userId, 'lists');
  const q = query(listsRef, orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const lists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(lists);
  });
};

// ============ ITEM OPERATIONS ============

// Add item to a list
export const createItem = async (userId, listId, itemData) => {
  const itemsRef = collection(db, 'users', userId, 'lists', listId, 'items');
  const docRef = await addDoc(itemsRef, {
    ...itemData,
    addedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update item count on list
  const listRef = doc(db, 'users', userId, 'lists', listId);
  const listSnapshot = await getDoc(listRef);
  if (listSnapshot.exists()) {
    const currentCount = listSnapshot.data().itemCount || 0;
    await updateDoc(listRef, {
      itemCount: currentCount + 1,
      updatedAt: serverTimestamp(),
    });
  }

  return docRef.id;
};

// Get all items in a list
export const getItems = async (userId, listId) => {
  const itemsRef = collection(db, 'users', userId, 'lists', listId, 'items');
  const q = query(itemsRef, orderBy('addedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get a single item
export const getItem = async (userId, listId, itemId) => {
  const itemRef = doc(db, 'users', userId, 'lists', listId, 'items', itemId);
  const snapshot = await getDoc(itemRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

// Update an item
export const updateItem = async (userId, listId, itemId, itemData) => {
  const itemRef = doc(db, 'users', userId, 'lists', listId, 'items', itemId);
  await updateDoc(itemRef, {
    ...itemData,
    updatedAt: serverTimestamp(),
  });
};

// Delete an item
export const deleteItem = async (userId, listId, itemId) => {
  const itemRef = doc(db, 'users', userId, 'lists', listId, 'items', itemId);
  await deleteDoc(itemRef);

  // Update item count on list
  const listRef = doc(db, 'users', userId, 'lists', listId);
  const listSnapshot = await getDoc(listRef);
  if (listSnapshot.exists()) {
    const currentCount = listSnapshot.data().itemCount || 0;
    await updateDoc(listRef, {
      itemCount: Math.max(0, currentCount - 1),
      updatedAt: serverTimestamp(),
    });
  }
};

// Subscribe to items (real-time updates)
export const subscribeToItems = (userId, listId, callback) => {
  const itemsRef = collection(db, 'users', userId, 'lists', listId, 'items');
  const q = query(itemsRef, orderBy('addedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  });
};

// ============ PANTRY OPERATIONS ============

// Add item to pantry
export const createPantryItem = async (userId, itemData) => {
  const pantryRef = collection(db, 'users', userId, 'pantry');
  const docRef = await addDoc(pantryRef, {
    ...itemData,
    lastUpdated: serverTimestamp(),
  });
  return docRef.id;
};

// Get all pantry items
export const getPantryItems = async (userId) => {
  const pantryRef = collection(db, 'users', userId, 'pantry');
  const q = query(pantryRef, orderBy('lastUpdated', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Update pantry item
export const updatePantryItem = async (userId, itemId, itemData) => {
  const itemRef = doc(db, 'users', userId, 'pantry', itemId);
  await updateDoc(itemRef, {
    ...itemData,
    lastUpdated: serverTimestamp(),
  });
};

// Delete pantry item
export const deletePantryItem = async (userId, itemId) => {
  const itemRef = doc(db, 'users', userId, 'pantry', itemId);
  await deleteDoc(itemRef);
};

// Subscribe to pantry items (real-time updates)
export const subscribeToPantry = (userId, callback) => {
  const pantryRef = collection(db, 'users', userId, 'pantry');
  const q = query(pantryRef, orderBy('lastUpdated', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  });
};

// ============ CATEGORY OPERATIONS ============

// Default categories
export const DEFAULT_CATEGORIES = [
  { name: 'Produce', icon: 'leaf-outline', color: '#4CAF50', isDefault: true },
  { name: 'Dairy', icon: 'water-outline', color: '#2196F3', isDefault: true },
  { name: 'Meat & Seafood', icon: 'fish-outline', color: '#F44336', isDefault: true },
  { name: 'Bakery', icon: 'pizza-outline', color: '#FF9800', isDefault: true },
  { name: 'Frozen', icon: 'snow-outline', color: '#00BCD4', isDefault: true },
  { name: 'Beverages', icon: 'cafe-outline', color: '#795548', isDefault: true },
  { name: 'Snacks', icon: 'fast-food-outline', color: '#FF5722', isDefault: true },
  { name: 'Household', icon: 'home-outline', color: '#9E9E9E', isDefault: true },
  { name: 'Personal Care', icon: 'heart-outline', color: '#E91E63', isDefault: true },
  { name: 'Other', icon: 'grid-outline', color: '#607D8B', isDefault: true },
];

// Seed default categories for a new user
export const seedDefaultCategories = async (userId) => {
  const categoriesRef = collection(db, 'users', userId, 'categories');
  const batch = writeBatch(db);

  DEFAULT_CATEGORIES.forEach((category) => {
    const docRef = doc(categoriesRef);
    batch.set(docRef, category);
  });

  await batch.commit();
};

// Get user categories
export const getCategories = async (userId) => {
  const categoriesRef = collection(db, 'users', userId, 'categories');
  const snapshot = await getDocs(categoriesRef);

  if (snapshot.empty) {
    // If no categories, seed defaults
    await seedDefaultCategories(userId);
    return DEFAULT_CATEGORIES.map((cat, index) => ({ id: `default-${index}`, ...cat }));
  }

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Subscribe to categories (real-time updates)
export const subscribeToCategories = (userId, callback) => {
  const categoriesRef = collection(db, 'users', userId, 'categories');
  return onSnapshot(categoriesRef, (snapshot) => {
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(categories);
  });
};

// Add custom category
export const createCategory = async (userId, categoryData) => {
  const categoriesRef = collection(db, 'users', userId, 'categories');
  const docRef = await addDoc(categoriesRef, {
    ...categoryData,
    isDefault: false,
  });
  return docRef.id;
};

// Delete category
export const deleteCategory = async (userId, categoryId) => {
  const categoryRef = doc(db, 'users', userId, 'categories', categoryId);
  await deleteDoc(categoryRef);
};
