// Pantry screen - track stock at home
import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Text, FAB, useTheme, Card, Chip, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';
import {
  subscribeToPantry,
  updatePantryItem,
  deletePantryItem,
  getCategories,
} from '../../lib/firestore';
import PantryItemCard from '../../components/ui/PantryItemCard';

export default function PantryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();

  const [pantryItems, setPantryItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, low, out

  useEffect(() => {
    let unsubscribe;

    const loadData = async () => {
      if (user?.uid) {
        setIsLoading(true);

        // Load categories
        const cats = await getCategories(user.uid);
        setCategories(cats);

        // Subscribe to pantry items
        unsubscribe = subscribeToPantry(user.uid, (items) => {
          setPantryItems(items);
          setIsLoading(false);
        });
      }
    };

    loadData();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.uid]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Items auto-refresh via subscription
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleStatusChange = async (itemId, newStatus) => {
    if (user?.uid) {
      await updatePantryItem(user.uid, itemId, { status: newStatus });
    }
  };

  const handleDeleteItem = (item) => {
    Alert.alert(
      'Remove from Pantry',
      `Remove "${item.name}" from your pantry?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (user?.uid) {
              await deletePantryItem(user.uid, item.id);
            }
          },
        },
      ]
    );
  };

  const getCategoryInfo = (categoryName) => {
    return categories.find(c => c.name === categoryName) || {
      name: 'Other',
      icon: 'grid-outline',
      color: '#607D8B',
    };
  };

  // Filter and group items
  const filteredItems = pantryItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'low') return item.status === 'low-stock';
    if (filter === 'out') return item.status === 'out-of-stock';
    return true;
  });

  const groupedItems = filteredItems.reduce((groups, item) => {
    const category = item.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  const groupedData = Object.entries(groupedItems).map(([category, items]) => ({
    category,
    categoryInfo: getCategoryInfo(category),
    data: items,
  }));

  // Calculate stats
  const stats = {
    total: pantryItems.length,
    inStock: pantryItems.filter(i => i.status === 'in-stock').length,
    lowStock: pantryItems.filter(i => i.status === 'low-stock').length,
    outOfStock: pantryItems.filter(i => i.status === 'out-of-stock').length,
  };

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16 }}>Loading pantry...</Text>
      </View>
    );
  }

  if (pantryItems.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="cube-outline" size={80} color={theme.colors.primary} />
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          Pantry is Empty
        </Text>
        <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
          Move items from your shopping list to track stock at home
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Stats Card */}
      <Card style={styles.statsCard} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 12 }}>
            Pantry Overview
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
                {stats.total}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Total
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#4CAF50' }}>
                {stats.inStock}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                In Stock
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#FF9800' }}>
                {stats.lowStock}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Low Stock
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#F44336' }}>
                {stats.outOfStock}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Out
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Filter */}
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filter}
          onValueChange={setFilter}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'low', label: 'Low Stock' },
            { value: 'out', label: 'Out' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {/* Items List */}
      <FlatList
        data={groupedData}
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
              <PantryItemCard
                key={item.id}
                item={item}
                onStatusChange={(newStatus) => handleStatusChange(item.id, newStatus)}
                onDelete={() => handleDeleteItem(item)}
              />
            ))}
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyFilter}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              No items match this filter
            </Text>
          </View>
        }
      />
    </View>
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
  statsCard: {
    margin: 16,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  segmentedButtons: {
    width: '100%',
  },
  listContent: {
    paddingBottom: 24,
  },
  categorySection: {
    marginBottom: 8,
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
  emptyTitle: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  emptyFilter: {
    padding: 40,
    alignItems: 'center',
  },
});
