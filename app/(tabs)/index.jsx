import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  FAB,
  ActivityIndicator,
  Button,
  Card,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useListStore } from '../../store/listStore';
import { subscribeToItems, getCategories, subscribeToLists } from '../../lib/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ItemCard from '../../components/ItemCard';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { lists, setLists, activeListId, setActiveListId } = useListStore();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeList, setActiveList] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Load active list ID from AsyncStorage
    AsyncStorage.getItem('activeListId').then((id) => {
      if (id) setActiveListId(id);
    });

    // Subscribe to lists
    const unsubscribeLists = subscribeToLists(user.uid, (fetchedLists) => {
      setLists(fetchedLists);

      // If no active list is set, use the first one
      if (!activeListId && fetchedLists.length > 0) {
        const firstList = fetchedLists[0];
        const firstListId = firstList.listId || firstList.id;
        setActiveListId(firstListId);
        AsyncStorage.setItem('activeListId', firstListId);
      }
    });

    // Fetch categories
    getCategories(user.uid).then((cats) => {
      setCategories(cats);
    });

    return () => unsubscribeLists();
  }, [user]);

  useEffect(() => {
    if (!user || !activeListId) {
      setLoading(false);
      return;
    }

    // Find active list info
    const list = lists.find(
      (l) => l.listId === activeListId || l.id === activeListId
    );
    setActiveList(list);

    // Subscribe to items in active list
    const unsubscribeItems = subscribeToItems(
      user.uid,
      activeListId,
      (fetchedItems) => {
        setItems(fetchedItems);
        setLoading(false);
      }
    );

    return () => unsubscribeItems();
  }, [user, activeListId, lists]);

  const groupedItems = items.reduce((groups, item) => {
    const category = item.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

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
            <ItemCard key={item.id} item={item} listId={activeListId} />
          ))}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="cart-outline" size={80} color="#CCC" />
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        {lists.length === 0 ? 'No Lists Yet' : 'List is Empty'}
      </Text>
      <Text variant="bodyLarge" style={styles.emptyText}>
        {lists.length === 0
          ? 'Create your first grocery list to get started'
          : 'Add items to your list by tapping the + button'}
      </Text>
      {lists.length === 0 && (
        <Button
          mode="contained"
          onPress={() => router.push('/lists')}
          style={styles.emptyButton}
        >
          Create List
        </Button>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {activeList && (
        <Card style={styles.headerCard} mode="elevated">
          <Card.Content>
            <View style={styles.headerContent}>
              <View style={styles.headerInfo}>
                <Text variant="headlineSmall" style={styles.headerTitle}>
                  {activeList.name}
                </Text>
                <Text variant="bodyMedium" style={styles.headerMeta}>
                  {items.length} items • Active List
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  router.push(`/list/${activeList.listId || activeList.id}`)
                }
              >
                <Ionicons name="chevron-forward" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
      )}

      {items.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView style={styles.scrollView}>
          {Object.entries(groupedItems).map(([category, categoryItems]) =>
            renderCategoryGroup(category, categoryItems)
          )}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}

      {activeListId && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => router.push('/item/new?listId=' + activeListId)}
          label="Add Item"
        />
      )}
    </View>
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
  headerCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  headerMeta: {
    color: '#666',
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
    marginBottom: 24,
  },
  emptyButton: {
    marginTop: 8,
  },
  bottomPadding: {
    height: 80,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});
