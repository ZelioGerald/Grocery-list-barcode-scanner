import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, IconButton, Checkbox } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { updateItem, deleteItem } from '../lib/firestore';
import { useAuthStore } from '../store/authStore';
import { STATUS_OPTIONS } from '../lib/constants';

export default function ItemCard({ item, listId, onDelete }) {
  const user = useAuthStore((state) => state.user);
  const [updating, setUpdating] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case STATUS_OPTIONS.OUT_OF_STOCK:
        return '#F44336';
      case STATUS_OPTIONS.IN_STOCK:
        return '#4CAF50';
      case STATUS_OPTIONS.IN_CART:
        return '#2196F3';
      default:
        return '#999';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case STATUS_OPTIONS.OUT_OF_STOCK:
        return 'Out of Stock';
      case STATUS_OPTIONS.IN_STOCK:
        return 'In Stock';
      case STATUS_OPTIONS.IN_CART:
        return 'In Cart';
      default:
        return status;
    }
  };

  const handleToggleInCart = async () => {
    if (updating) return;

    setUpdating(true);
    try {
      const newStatus =
        item.status === STATUS_OPTIONS.IN_CART
          ? STATUS_OPTIONS.OUT_OF_STOCK
          : STATUS_OPTIONS.IN_CART;

      await updateItem(user.uid, listId, item.itemId || item.id, {
        status: newStatus,
      });
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Failed to update item');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(user.uid, listId, item.itemId || item.id);
              if (onDelete) onDelete();
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemContent}>
        <Checkbox
          status={item.status === STATUS_OPTIONS.IN_CART ? 'checked' : 'unchecked'}
          onPress={handleToggleInCart}
          disabled={updating}
          color="#4CAF50"
        />

        <View style={styles.itemInfo}>
          <Text
            variant="titleMedium"
            style={[
              styles.itemName,
              item.status === STATUS_OPTIONS.IN_CART && styles.itemNameChecked,
            ]}
          >
            {item.name}
          </Text>
          {item.brand && (
            <Text variant="bodySmall" style={styles.itemBrand}>
              {item.brand}
            </Text>
          )}
          <View style={styles.itemMeta}>
            <Text variant="bodySmall" style={styles.itemQuantity}>
              {item.quantity} {item.unit}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
            </View>
          </View>
          {item.notes && (
            <Text variant="bodySmall" style={styles.itemNotes}>
              📝 {item.notes}
            </Text>
          )}
        </View>

        <IconButton
          icon="delete-outline"
          size={24}
          iconColor="#F44336"
          onPress={handleDelete}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 8,
  },
  itemName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  itemBrand: {
    color: '#666',
    marginBottom: 6,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  itemQuantity: {
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  itemNotes: {
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
