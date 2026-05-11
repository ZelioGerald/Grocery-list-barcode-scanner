import { create } from 'zustand';

export const useListStore = create((set, get) => ({
  lists: [],
  activeListId: null,
  categories: [],
  loading: false,

  setLists: (lists) => set({ lists }),

  setActiveListId: (listId) => set({ activeListId: listId }),

  setCategories: (categories) => set({ categories }),

  setLoading: (loading) => set({ loading }),

  addList: (list) =>
    set((state) => ({
      lists: [...state.lists, list],
    })),

  updateList: (listId, updates) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.listId === listId ? { ...list, ...updates } : list
      ),
    })),

  deleteList: (listId) =>
    set((state) => ({
      lists: state.lists.filter((list) => list.listId !== listId),
      activeListId: state.activeListId === listId ? null : state.activeListId,
    })),

  clearLists: () =>
    set({
      lists: [],
      activeListId: null,
      categories: [],
      loading: false,
    }),
}));
