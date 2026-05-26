// Home screen - shows active list
import { useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, FAB, useTheme, Card, Chip, ActivityIndicator, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';
import useListStore from '../../store/listStore';
import ItemCard from '../../components/ui/ItemCard';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    activeList,
    items,
    categories,
    isLoading,
    initialize,
    toggleItemStatus,
    removeItem,
  } = useListStore();

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    if (user?.uid) {
      initialize(user.uid);
    }
  }, [user?.uid]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user?.uid) {
      await initialize(user.uid);
    }
    setRefreshing(false);
  }, [user?.uid]);

  const handleToggleItem = async (itemId, currentStatus) => {
    if (user?.uid && activeList?.id) {
      await toggleItemStatus(user.uid, activeList.id, itemId, currentStatus);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (user?.uid && activeList?.id) {
      await removeItem(user.uid, activeList.id, itemId);
    }
  };

  const getCategoryInfo = (categoryName) => {
    return categories.find(c => c.name === categoryName) || {
      name: 'Other',
      icon: 'grid-outline',
      color: '#607D8B',
    };
  };

  // Group items by category
  const groupedItems = React.useMemo(() => {
    const groups = {};
    items.forEach(item => {
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
  }, [items, categories]);

  if (isLoading && !activeList) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16 }}>Loading your list...</Text>
      </View>
    );
  }

  // Empty state - no active list
  if (!activeList) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="list-outline" size={80} color={theme.colors.primary} />
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          No Lists Yet
        </Text>
        <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
          Create your first grocery list to get started
        </Text>
        <Button
          mode="contained"
          onPress={() => router.push('/lists')}
          style={{ marginTop: 24 }}
          icon="plus"
        >
          Create List
        </Button>
      </View>
    );
  }

  // Empty state - no items in list
  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Card style={styles.headerCard} mode="elevated">
          <Card.Content>
            <Text variant="titleLarge">{activeList.name}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {activeList.itemCount || 0} items
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.centered}>
          <Ionicons name="cart-outline" size={80} color={theme.colors.primary} />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            Your List is Empty
          </Text>
          <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Scan a barcode or add items manually
          </Text>
        </View>

        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
          onPress={() => router.push('/item/new')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Card */}
      <Card style={styles.headerCard} mode="elevated">
        <Card.Content>
          <Text variant="titleLarge">{activeList.name}</Text>
          <View style={styles.statsRow}>
            <Chip icon="cart" compact style={styles.statChip}>
              {items.filter(i => i.status === 'in-cart').length} in cart
            </Chip>
            <Chip icon="checkbox-blank-outline" compact style={styles.statChip}>
              {items.filter(i => i.status !== 'in-cart').length} remaining
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Items List */}
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
            </View>
            {group.data.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onToggle={() => handleToggleItem(item.id, item.status)}
                onDelete={() => handleDeleteItem(item.id)}
                onPress={() => router.push(`/item/${item.id}?listId=${activeList.id}`)}
              />
            ))}
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />

      {/* Add Item FAB */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => router.push('/item/new')}
      />
    </View>
  );
}

// Need to import React for useMemo and useState
import React from 'react';

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
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  statChip: {
    height: 28,
  },
  listContent: {
    paddingBottom: 100,
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
  },
  emptyTitle: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
