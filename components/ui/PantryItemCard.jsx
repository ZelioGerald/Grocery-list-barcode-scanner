// Pantry item card component
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme, IconButton, Menu } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import Swipeable from 'react-native-gesture-handler/Swipeable';

const STATUS_CONFIG = {
  'in-stock': { label: 'In Stock', color: '#4CAF50', icon: 'checkmark-circle' },
  'low-stock': { label: 'Low Stock', color: '#FF9800', icon: 'alert-circle' },
  'out-of-stock': { label: 'Out', color: '#F44336', icon: 'close-circle' },
};

const STATUS_ORDER = ['in-stock', 'low-stock', 'out-of-stock'];

export default function PantryItemCard({ item, onStatusChange, onDelete }) {
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG['in-stock'];

  const cycleStatus = () => {
    const currentIndex = STATUS_ORDER.indexOf(item.status);
    const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
    onStatusChange(STATUS_ORDER[nextIndex]);
  };

  const renderRightActions = () => (
    <Pressable
      style={[styles.deleteAction, { backgroundColor: theme.colors.error }]}
      onPress={onDelete}
    >
      <Ionicons name="trash" size={24} color="#fff" />
    </Pressable>
  );

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        {/* Status Indicator */}
        <Pressable
          style={[styles.statusIndicator, { backgroundColor: statusConfig.color }]}
          onPress={cycleStatus}
        >
          <Ionicons name={statusConfig.icon} size={20} color="#fff" />
        </Pressable>

        {/* Item Info */}
        <View style={styles.content}>
          <Text variant="bodyLarge" style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.details}>
            {item.brand && (
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
                numberOfLines={1}
              >
                {item.brand}
              </Text>
            )}
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {item.quantity} {item.unit}
            </Text>
          </View>
        </View>

        {/* Status Menu */}
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Pressable
              style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}
              onPress={() => setMenuVisible(true)}
            >
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
              <Ionicons name="chevron-down" size={14} color={statusConfig.color} />
            </Pressable>
          }
        >
          {STATUS_ORDER.map((status) => (
            <Menu.Item
              key={status}
              title={STATUS_CONFIG[status].label}
              leadingIcon={() => (
                <Ionicons
                  name={STATUS_CONFIG[status].icon}
                  size={20}
                  color={STATUS_CONFIG[status].color}
                />
              )}
              onPress={() => {
                onStatusChange(status);
                setMenuVisible(false);
              }}
            />
          ))}
        </Menu>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 2,
    borderRadius: 8,
  },
  statusIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontWeight: '500',
  },
  details: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: 2,
    marginRight: 16,
    borderRadius: 8,
  },
});
