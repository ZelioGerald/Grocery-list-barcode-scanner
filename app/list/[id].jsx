// Individual list view screen
import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Text,
  FAB,
  useTheme,
  Chip,
  ActivityIndicator,
  Appbar,
  Menu,
} from 'react-native-paper';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';
import { getList, subscribeToItems, getCategories, deleteItem, updateItem } from '../../lib/firestore';
import ItemCard from '../../components/ui/ItemCard';

export default function ListDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();

  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    let unsubscribe;

    const loadData = async () => {
      if (!user?.uid || !id) return;

      setIsLoading(true);

      // Load list details
      const listData = await getList(user.uid, id);
      setList(listData);

      // Load categories
      const cats = await getCategories(user.uid);
      setCategories(cats);

      // Subscribe to items
      unsubscribe = subscribeToItems(user.uid, id, (itemsData) => {
        setItems(itemsData);
        setIsLoading(false);
      });
    };

    loadData();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [id, user?.uid]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleToggleItem = async (itemId, currentStatus) => {
    if (user?.uid && id) {
      const newStatus = currentStatus === 'in-cart' ? 'out-of-stock' : 'in-cart';
      await updateItem(user.uid, id, itemId, { status: newStatus });
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (user?.uid && id) {
      await deleteItem(user.uid, id, itemId);
    }
  };

  const getCategoryInfo = (categoryName) => {
    return categories.find(c => c.name === categoryName) || {
      name: 'Other',
      icon: 'grid-outline',
      color: '#607D8B',
    };
  };

  // Get unique categories from items
  const itemCategories = useMemo(() => {
    const cats = [...new Set(items.map(item => item.category || 'Other'))];
    return ['All', ...cats];
  }, [items]);

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return items;
    return items.filter(item => (item.category || 'Other') === selectedCategory);
  }, [items, selectedCategory]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups = {};
    filteredItems.forEach(item => {
      const category = item.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });
    return Object.entries(groups).map(([category, categoryItems]) => ({
      category,
      categoryInfo: getCategoryInfo(category),
      data: categoryItems,
    }));
  }, [filteredItems, categories]);

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </>
    );
  }

  if (!list) {
    return (
      <>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
          <Ionicons name="alert-circle-outline" size={60} color={theme.colors.error} />
          <Text variant="titleMedium" style={{ marginTop: 16 }}>
            List not found
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: list.name,
          headerRight: () => (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Appbar.Action
                  icon="dots-vertical"
                  onPress={() => setMenuVisible(true)}
                />
              }
            >
              <Menu.Item
                leadingIcon="pencil"
                title="Edit List"
                onPress={() => {
                  setMenuVisible(false);
                  // Handle edit
                }}
              />
              <Menu.Item
                leadingIcon="share"
                title="Share List"
                onPress={() => {
                  setMenuVisible(false);
                  // Handle share
                }}
              />
            </Menu>
          ),
        }}
      />

      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Category Filter */}
        {itemCategories.length > 1 && (
          <View style={styles.filterContainer}>
            <FlatList
              horizontal
              data={itemCategories}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item: cat }) => (
                <Chip
                  selected={selectedCategory === cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={styles.filterChip}
                  showSelectedCheck={false}
                >
                  {cat}
                </Chip>
              )}
              contentContainerStyle={styles.filterScroll}
            />
          </View>
        )}

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons name="cart-outline" size={60} color={theme.colors.primary} />
            <Text variant="titleMedium" style={{ marginTop: 16 }}>
              {selectedCategory === 'All' ? 'No items yet' : `No ${selectedCategory} items`}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
              Tap the + button to add items
            </Text>
          </View>
        ) : (
          <FlatList
            data={groupedItems}
            keyExtractor={(item) => item.category}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item: group }) => (
              <View style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <Ionicons
                    name={group.categoryInfo.icon}
                    size={20}
                    color={group.categoryInfo.color}
                  />
                  <Text
                    variant="titleSmall"
                    style={[styles.categoryTitle, { color: group.categoryInfo.color }]}
                  >
                    {group.category}
                  </Text>
                  <Chip compact style={styles.countChip}>
                    {group.data.length}
                  </Chip>
                </View>
                {group.data.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onToggle={() => handleToggleItem(item.id, item.status)}
                    onDelete={() => handleDeleteItem(item.id)}
                    onPress={() => router.push(`/item/${item.id}?listId=${id}`)}
                  />
                ))}
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />
        )}

        {/* Add Item FAB */}
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
          onPress={() => router.push('/item/new')}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterScroll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterChip: {
    marginHorizontal: 4,
  },
  listContent: {
    paddingBottom: 100,
  },
  categorySection: {
    marginTop: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryTitle: {
    fontWeight: '600',
    flex: 1,
  },
  countChip: {
    height: 24,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
