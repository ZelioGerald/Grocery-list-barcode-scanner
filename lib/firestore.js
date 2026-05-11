import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';

// ==================== LISTS ====================

export const createList = async (userId, listData) => {
  try {
    const listsRef = collection(db, 'users', userId, 'lists');
    const docRef = await addDoc(listsRef, {
      ...listData,
      listId: '', // Will be updated with actual ID
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      itemCount: 0,
      isActive: true,
    });

    // Update with the actual document ID
    await updateDoc(docRef, { listId: docRef.id });

    return docRef.id;
  } catch (error) {
    console.error('Error creating list:', error);
    throw error;
  }
};

export const getLists = async (userId) => {
  try {
    const listsRef = collection(db, 'users', userId, 'lists');
    const q = query(listsRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting lists:', error);
    throw error;
  }
};

export const updateList = async (userId, listId, updates) => {
  try {
    const listRef = doc(db, 'users', userId, 'lists', listId);
    await updateDoc(listRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating list:', error);
    throw error;
  }
};

export const deleteList = async (userId, listId) => {
  try {
    const listRef = doc(db, 'users', userId, 'lists', listId);
    await deleteDoc(listRef);
  } catch (error) {
    console.error('Error deleting list:', error);
    throw error;
  }
};

export const subscribeToLists = (userId, callback) => {
  const listsRef = collection(db, 'users', userId, 'lists');
  const q = query(listsRef, orderBy('updatedAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const lists = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(lists);
  });
};

// ==================== ITEMS ====================

export const createItem = async (userId, listId, itemData) => {
  try {
    const itemsRef = collection(db, 'users', userId, 'lists', listId, 'items');
    const docRef = await addDoc(itemsRef, {
      ...itemData,
      itemId: '', // Will be updated with actual ID
      addedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update with the actual document ID
    await updateDoc(docRef, { itemId: docRef.id });

    // Update list item count
    const listRef = doc(db, 'users', userId, 'lists', listId);
    const listDoc = await getDoc(listRef);
    if (listDoc.exists()) {
      const currentCount = listDoc.data().itemCount || 0;
      await updateDoc(listRef, {
        itemCount: currentCount + 1,
        updatedAt: serverTimestamp(),
      });
    }

    return docRef.id;
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
};

export const getItems = async (userId, listId) => {
  try {
    const itemsRef = collection(db, 'users', userId, 'lists', listId, 'items');
    const q = query(itemsRef, orderBy('addedAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting items:', error);
    throw error;
  }
};

export const updateItem = async (userId, listId, itemId, updates) => {
  try {
    const itemRef = doc(db, 'users', userId, 'lists', listId, 'items', itemId);
    await updateDoc(itemRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    // Update list's updatedAt timestamp
    const listRef = doc(db, 'users', userId, 'lists', listId);
    await updateDoc(listRef, {
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

export const deleteItem = async (userId, listId, itemId) => {
  try {
    const itemRef = doc(db, 'users', userId, 'lists', listId, 'items', itemId);
    await deleteDoc(itemRef);

    // Update list item count
    const listRef = doc(db, 'users', userId, 'lists', listId);
    const listDoc = await getDoc(listRef);
    if (listDoc.exists()) {
      const currentCount = listDoc.data().itemCount || 0;
      await updateDoc(listRef, {
        itemCount: Math.max(0, currentCount - 1),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

export const subscribeToItems = (userId, listId, callback) => {
  const itemsRef = collection(db, 'users', userId, 'lists', listId, 'items');
  const q = query(itemsRef, orderBy('addedAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(items);
  });
};

// ==================== CATEGORIES ====================

export const getCategories = async (userId) => {
  try {
    const categoriesRef = collection(db, 'users', userId, 'categories');
    const snapshot = await getDocs(categoriesRef);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

export const subscribeToCategories = (userId, callback) => {
  const categoriesRef = collection(db, 'users', userId, 'categories');

  return onSnapshot(categoriesRef, (snapshot) => {
    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(categories);
  });
};
