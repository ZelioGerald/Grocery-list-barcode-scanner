import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Text,
  FAB,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { subscribeToItems, getCategories } from '../../lib/firestore';
import ItemCard from '../../components/ItemCard';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    if (!user || !id) return;

    // Fetch categories
    getCategories(user.uid).then((cats) => {
      setCategories(cats);
    });

    // Subscribe to items in real-time
    const unsubscribe = subscribeToItems(user.uid, id, (fetchedItems) => {
      setItems(fetchedItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, id]);

  const filteredItems =
    selectedCategory === 'All'
      ? items
      : items.filter((item) => item.category === selectedCategory);

  const groupedItems = filteredItems.reduce((groups, item) => {
    const category = item.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      <Chip
        selected={selectedCategory === 'All'}
        onPress={() => setSelectedCategory('All')}
        style={styles.filterChip}
      >
        All ({items.length})
      </Chip>
      {categories.map((cat) => {
        const count = items.filter((item) => item.category === cat.name).length;
        if (count === 0) return null;
        return (
          <Chip
            key={cat.id}
            selected={selectedCategory === cat.name}
            onPress={() => setSelectedCategory(cat.name)}
            style={styles.filterChip}
          >
            {cat.name} ({count})
          </Chip>
        );
      })}
    </ScrollView>
  );

  const renderCategoryGroup = (category, categoryItems) => {
    const categoryData = categories.find((cat) => cat.name === category);
    const iconName = categoryData?.icon || 'grid-outline';
    const color = categoryData?.color || '#607D8B';

    return (
      <View key={category} style={styles.categoryGroup}>
        <View style={styles.categoryHeader}>
          <Ionicons name={iconName} size={24} color={color} />
          <Text variant="titleMedium" style={[styles.categoryTitle, { color }]}>
            {category}
          </Text>
          <Text variant="bodySmall" style={styles.categoryCount}>
            {categoryItems.length} items
          </Text>
        </View>
        <View style={styles.categoryItems}>
          {categoryItems.map((item) => (
            <ItemCard key={item.id} item={item} listId={id} />
          ))}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="cart-outline" size={80} color="#CCC" />
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Items Yet
      </Text>
      <Text variant="bodyLarge" style={styles.emptyText}>
        Add items to your list by tapping the + button
      </Text>
    </View>
  );

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Grocery List' }} />
      <View style={styles.container}>
        {categories.length > 0 && items.length > 0 && renderCategoryFilter()}

        {items.length === 0 ? (
          renderEmptyState()
        ) : (
          <ScrollView style={styles.scrollView}>
            {Object.entries(groupedItems).map(([category, categoryItems]) =>
              renderCategoryGroup(category, categoryItems)
            )}
          </ScrollView>
        )}

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => router.push('/item/new?listId=' + id)}
          label="Add Item"
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterContent: {
    padding: 12,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  categoryGroup: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  categoryTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
    flex: 1,
  },
  categoryCount: {
    color: '#999',
  },
  categoryItems: {
    gap: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#666',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});
