// List and Items store using Zustand
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createList,
  getLists,
  getList,
  updateList,
  deleteList,
  subscribeToLists,
  createItem,
  getItems,
  updateItem,
  deleteItem,
  subscribeToItems,
  getCategories,
} from '../lib/firestore';

const ACTIVE_LIST_KEY = '@smartcart_active_list';

const useListStore = create((set, get) => ({
  // State
  lists: [],
  activeListId: null,
  activeList: null,
  items: [],
  categories: [],
  isLoading: false,
  error: null,

  // Unsubscribe functions
  _unsubscribeLists: null,
  _unsubscribeItems: null,

  // Initialize store and load active list from storage
  initialize: async (userId) => {
    set({ isLoading: true });
    try {
      // Load active list ID from AsyncStorage
      const storedListId = await AsyncStorage.getItem(ACTIVE_LIST_KEY);

      // Load categories
      const categories = await getCategories(userId);

      // Subscribe to lists
      const unsubscribe = subscribeToLists(userId, (lists) => {
        set({ lists });

        // If we have a stored active list, verify it still exists
        const { activeListId } = get();
        if (activeListId) {
          const listExists = lists.find(l => l.id === activeListId);
          if (!listExists && lists.length > 0) {
            // Active list was deleted, switch to first list
            get().setActiveList(userId, lists[0].id);
          }
        } else if (storedListId) {
          // Set stored active list
          const listExists = lists.find(l => l.id === storedListId);
          if (listExists) {
            get().setActiveList(userId, storedListId);
          } else if (lists.length > 0) {
            get().setActiveList(userId, lists[0].id);
          }
        } else if (lists.length > 0) {
          // No active list, set first one
          get().setActiveList(userId, lists[0].id);
        }
      });

      set({
        _unsubscribeLists: unsubscribe,
        categories,
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Set active list
  setActiveList: async (userId, listId) => {
    const { _unsubscribeItems } = get();

    // Unsubscribe from previous items listener
    if (_unsubscribeItems) {
      _unsubscribeItems();
    }

    // Get list details
    const list = await getList(userId, listId);

    // Save to AsyncStorage
    await AsyncStorage.setItem(ACTIVE_LIST_KEY, listId);

    // Subscribe to items for this list
    const unsubscribe = subscribeToItems(userId, listId, (items) => {
      set({ items });
    });

    set({
      activeListId: listId,
      activeList: list,
      _unsubscribeItems: unsubscribe,
    });
  },

  // Create a new list
  addList: async (userId, name) => {
    set({ isLoading: true, error: null });
    try {
      const listId = await createList(userId, { name });
      await get().setActiveList(userId, listId);
      set({ isLoading: false });
      return { success: true, listId };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Update a list
  editList: async (userId, listId, data) => {
    set({ error: null });
    try {
      await updateList(userId, listId, data);
      return { success: true };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Delete a list
  removeList: async (userId, listId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteList(userId, listId);

      // If deleted list was active, clear it
      const { activeListId, lists } = get();
      if (activeListId === listId) {
        const remainingLists = lists.filter(l => l.id !== listId);
        if (remainingLists.length > 0) {
          await get().setActiveList(userId, remainingLists[0].id);
        } else {
          await AsyncStorage.removeItem(ACTIVE_LIST_KEY);
          set({ activeListId: null, activeList: null, items: [] });
        }
      }

      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Add item to active list
  addItem: async (userId, listId, itemData) => {
    set({ error: null });
    try {
      const itemId = await createItem(userId, listId, itemData);
      return { success: true, itemId };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Update an item
  editItem: async (userId, listId, itemId, itemData) => {
    set({ error: null });
    try {
      await updateItem(userId, listId, itemId, itemData);
      return { success: true };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Delete an item
  removeItem: async (userId, listId, itemId) => {
    set({ error: null });
    try {
      await deleteItem(userId, listId, itemId);
      return { success: true };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Toggle item status (for shopping mode)
  toggleItemStatus: async (userId, listId, itemId, currentStatus) => {
    const newStatus = currentStatus === 'in-cart' ? 'out-of-stock' : 'in-cart';
    return get().editItem(userId, listId, itemId, { status: newStatus });
  },

  // Cleanup subscriptions
  cleanup: () => {
    const { _unsubscribeLists, _unsubscribeItems } = get();
    if (_unsubscribeLists) _unsubscribeLists();
    if (_unsubscribeItems) _unsubscribeItems();
    set({
      lists: [],
      activeListId: null,
      activeList: null,
      items: [],
      _unsubscribeLists: null,
      _unsubscribeItems: null,
    });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useListStore;
