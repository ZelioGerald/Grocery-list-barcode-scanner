// Item card component for grocery lists
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Checkbox, useTheme, IconButton, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';

const STATUS_CONFIG = {
  'out-of-stock': { label: 'Out', color: '#F44336', icon: 'close-circle' },
  'in-stock': { label: 'In Stock', color: '#4CAF50', icon: 'checkmark-circle' },
  'in-cart': { label: 'In Cart', color: '#2196F3', icon: 'cart' },
};

export default function ItemCard({ item, onToggle, onDelete, onPress }) {
  const theme = useTheme();
  const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG['out-of-stock'];
  const isInCart = item.status === 'in-cart';

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
      <Pressable
        style={[
          styles.container,
          { backgroundColor: theme.colors.surface },
          isInCart && styles.inCartContainer,
        ]}
        onPress={onPress}
      >
        {/* Checkbox */}
        <Checkbox
          status={isInCart ? 'checked' : 'unchecked'}
          onPress={onToggle}
          color={theme.colors.primary}
        />

        {/* Item Info */}
        <View style={styles.content}>
          <Text
            variant="bodyLarge"
            style={[
              styles.name,
              isInCart && styles.strikethrough,
              { color: isInCart ? theme.colors.onSurfaceVariant : theme.colors.onSurface },
            ]}
            numberOfLines={1}
          >
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

        {/* Status Badge */}
        <Chip
          compact
          style={[styles.statusChip, { backgroundColor: statusConfig.color + '20' }]}
          textStyle={{ color: statusConfig.color, fontSize: 10 }}
        >
          {statusConfig.label}
        </Chip>

        {/* Arrow */}
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.onSurfaceVariant}
        />
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    marginVertical: 2,
    borderRadius: 8,
  },
  inCartContainer: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
    marginLeft: 4,
  },
  name: {
    fontWeight: '500',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  details: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  statusChip: {
    marginRight: 8,
    height: 24,
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
