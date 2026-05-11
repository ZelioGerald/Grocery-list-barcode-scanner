import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  FAB,
  Card,
  IconButton,
  TextInput,
  Button,
  Portal,
  Dialog,
  ActivityIndicator,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useListStore } from '../../store/listStore';
import { createList, subscribeToLists, deleteList } from '../../lib/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ListsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { lists, setLists, setActiveListId, activeListId } = useListStore();
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Load active list ID from AsyncStorage
    AsyncStorage.getItem('activeListId').then((id) => {
      if (id) setActiveListId(id);
    });

    // Subscribe to lists in real-time
    const unsubscribe = subscribeToLists(user.uid, (fetchedLists) => {
      setLists(fetchedLists);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      Alert.alert('Error', 'Please enter a list name');
      return;
    }

    setCreating(true);
    try {
      const listId = await createList(user.uid, {
        name: newListName.trim(),
      });

      // Set as active list
      setActiveListId(listId);
      await AsyncStorage.setItem('activeListId', listId);

      setNewListName('');
      setDialogVisible(false);
      Alert.alert('Success', 'List created successfully!');
    } catch (error) {
      console.error('Error creating list:', error);
      Alert.alert('Error', 'Failed to create list. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleSetActiveList = async (listId) => {
    setActiveListId(listId);
    await AsyncStorage.setItem('activeListId', listId);
  };

  const handleDeleteList = (listId, listName) => {
    Alert.alert(
      'Delete List',
      `Are you sure you want to delete "${listName}"? This will also delete all items in this list.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteList(user.uid, listId);
              Alert.alert('Success', 'List deleted successfully');
            } catch (error) {
              console.error('Error deleting list:', error);
              Alert.alert('Error', 'Failed to delete list');
            }
          },
        },
      ]
    );
  };

  const handleOpenList = (listId) => {
    router.push(`/list/${listId}`);
  };

  const renderListItem = ({ item }) => {
    const isActive = item.listId === activeListId || item.id === activeListId;

    return (
      <Card style={styles.listCard} mode="elevated">
        <TouchableOpacity onPress={() => handleOpenList(item.listId || item.id)}>
          <Card.Content>
            <View style={styles.listHeader}>
              <View style={styles.listInfo}>
                <View style={styles.listTitleRow}>
                  <Text variant="titleLarge" style={styles.listTitle}>
                    {item.name}
                  </Text>
                  {isActive && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>Active</Text>
                    </View>
                  )}
                </View>
                <Text variant="bodyMedium" style={styles.listMeta}>
                  {item.itemCount || 0} items
                </Text>
                {item.updatedAt && (
                  <Text variant="bodySmall" style={styles.listDate}>
                    Updated:{' '}
                    {item.updatedAt?.toDate
                      ? item.updatedAt.toDate().toLocaleDateString()
                      : 'Recently'}
                  </Text>
                )}
              </View>
              <View style={styles.listActions}>
                {!isActive && (
                  <IconButton
                    icon="star-outline"
                    size={24}
                    onPress={() => handleSetActiveList(item.listId || item.id)}
                  />
                )}
                <IconButton
                  icon="delete-outline"
                  size={24}
                  iconColor="#F44336"
                  onPress={() =>
                    handleDeleteList(item.listId || item.id, item.name)
                  }
                />
              </View>
            </View>
          </Card.Content>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="list-outline" size={80} color="#CCC" />
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Lists Yet
      </Text>
      <Text variant="bodyLarge" style={styles.emptyText}>
        Create your first grocery list to get started
      </Text>
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
      <FlatList
        data={lists}
        keyExtractor={(item) => item.listId || item.id}
        renderItem={renderListItem}
        contentContainerStyle={
          lists.length === 0 ? styles.emptyContainer : styles.listContainer
        }
        ListEmptyComponent={renderEmptyState}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setDialogVisible(true)}
        label="New List"
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Create New List</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="List Name"
              value={newListName}
              onChangeText={setNewListName}
              mode="outlined"
              placeholder="e.g., Weekly Groceries"
              autoFocus
              disabled={creating}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)} disabled={creating}>
              Cancel
            </Button>
            <Button onPress={handleCreateList} loading={creating}>
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listCard: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listInfo: {
    flex: 1,
  },
  listTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  listTitle: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listMeta: {
    color: '#666',
    marginBottom: 2,
  },
  listDate: {
    color: '#999',
    fontSize: 12,
  },
  listActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
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
