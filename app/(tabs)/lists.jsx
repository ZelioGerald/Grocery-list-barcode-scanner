// Lists screen - manage all grocery lists
import { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import {
  Text,
  FAB,
  useTheme,
  Card,
  IconButton,
  Portal,
  Dialog,
  TextInput,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';
import useListStore from '../../store/listStore';

export default function ListsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    lists,
    activeListId,
    isLoading,
    addList,
    editList,
    removeList,
    setActiveList,
  } = useListStore();

  const [refreshing, setRefreshing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [listName, setListName] = useState('');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Lists auto-refresh via subscription
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const openCreateDialog = () => {
    setEditingList(null);
    setListName('');
    setDialogVisible(true);
  };

  const openEditDialog = (list) => {
    setEditingList(list);
    setListName(list.name);
    setDialogVisible(true);
  };

  const handleSaveList = async () => {
    if (!listName.trim()) return;

    if (editingList) {
      // Update existing list
      await editList(user.uid, editingList.id, { name: listName.trim() });
    } else {
      // Create new list
      await addList(user.uid, listName.trim());
    }

    setDialogVisible(false);
    setListName('');
    setEditingList(null);
  };

  const handleDeleteList = (list) => {
    Alert.alert(
      'Delete List',
      `Are you sure you want to delete "${list.name}"? This will also delete all items in the list.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeList(user.uid, list.id);
          },
        },
      ]
    );
  };

  const handleSelectList = async (list) => {
    await setActiveList(user.uid, list.id);
    router.push('/');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderListCard = ({ item: list }) => {
    const isActive = list.id === activeListId;

    return (
      <Card
        style={[
          styles.listCard,
          isActive && { borderColor: theme.colors.primary, borderWidth: 2 },
        ]}
        mode="elevated"
        onPress={() => handleSelectList(list)}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardMain}>
            <View style={styles.cardInfo}>
              <View style={styles.titleRow}>
                <Text variant="titleMedium" style={styles.listName}>
                  {list.name}
                </Text>
                {isActive && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={theme.colors.primary}
                  />
                )}
              </View>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {list.itemCount || 0} items • Updated {formatDate(list.updatedAt)}
              </Text>
            </View>
            <View style={styles.cardActions}>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => openEditDialog(list)}
              />
              <IconButton
                icon="delete"
                size={20}
                iconColor={theme.colors.error}
                onPress={() => handleDeleteList(list)}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (isLoading && lists.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16 }}>Loading lists...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {lists.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="list-outline" size={80} color={theme.colors.primary} />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            No Lists Yet
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Create your first grocery list
          </Text>
          <Button
            mode="contained"
            onPress={openCreateDialog}
            style={{ marginTop: 24 }}
            icon="plus"
          >
            Create List
          </Button>
        </View>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          renderItem={renderListCard}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* FAB to create new list */}
      {lists.length > 0 && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
          onPress={openCreateDialog}
        />
      )}

      {/* Create/Edit List Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>
            {editingList ? 'Edit List' : 'New List'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="List Name"
              value={listName}
              onChangeText={setListName}
              mode="outlined"
              placeholder="e.g., Weekly Groceries"
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleSaveList} disabled={!listName.trim()}>
              {editingList ? 'Save' : 'Create'}
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
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  listCard: {
    marginBottom: 12,
  },
  cardContent: {
    paddingVertical: 8,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listName: {
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
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
