// Item detail/edit screen
import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import {
  TextInput,
  Button,
  useTheme,
  SegmentedButtons,
  Text,
  HelperText,
  Menu,
  ActivityIndicator,
  Card,
  Chip,
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';
import useListStore from '../../store/listStore';
import { getItem } from '../../lib/firestore';

const UNITS = [
  { value: 'pcs', label: 'pcs' },
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'liters', label: 'L' },
  { value: 'ml', label: 'ml' },
];

const STATUSES = [
  { value: 'out-of-stock', label: 'Out of Stock', color: '#F44336' },
  { value: 'in-stock', label: 'In Stock', color: '#4CAF50' },
  { value: 'in-cart', label: 'In Cart', color: '#2196F3' },
];

export default function ItemDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id, listId } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { activeListId, categories, editItem, removeItem } = useListStore();

  const effectiveListId = listId || activeListId;

  const [item, setItem] = useState(null);
  const [isLoadingItem, setIsLoadingItem] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Other');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('out-of-stock');

  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadItem();
  }, [id, effectiveListId, user?.uid]);

  const loadItem = async () => {
    if (!user?.uid || !effectiveListId || !id) return;

    setIsLoadingItem(true);
    try {
      const itemData = await getItem(user.uid, effectiveListId, id);
      if (itemData) {
        setItem(itemData);
        setName(itemData.name || '');
        setBrand(itemData.brand || '');
        setCategory(itemData.category || 'Other');
        setQuantity(String(itemData.quantity || 1));
        setUnit(itemData.unit || 'pcs');
        setNotes(itemData.notes || '');
        setStatus(itemData.status || 'out-of-stock');
      }
    } catch (err) {
      setError('Failed to load item');
    } finally {
      setIsLoadingItem(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Item name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const itemData = {
        name: name.trim(),
        brand: brand.trim() || null,
        category,
        quantity: parseInt(quantity) || 1,
        unit,
        notes: notes.trim() || null,
        status,
      };

      const result = await editItem(user.uid, effectiveListId, id, itemData);

      if (result.success) {
        router.back();
      } else {
        setError(result.error || 'Failed to update item');
      }
    } catch (err) {
      setError('Failed to update item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeItem(user.uid, effectiveListId, id);
            router.back();
          },
        },
      ]
    );
  };

  if (isLoadingItem) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="alert-circle-outline" size={60} color={theme.colors.error} />
        <Text variant="titleMedium" style={{ marginTop: 16 }}>
          Item not found
        </Text>
        <Button mode="contained" onPress={() => router.back()} style={{ marginTop: 16 }}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Status */}
        <Card style={styles.statusCard} mode="outlined">
          <Card.Content>
            <Text variant="labelMedium" style={{ marginBottom: 8 }}>
              Status
            </Text>
            <View style={styles.statusButtons}>
              {STATUSES.map((s) => (
                <Chip
                  key={s.value}
                  selected={status === s.value}
                  onPress={() => setStatus(s.value)}
                  style={[
                    styles.statusChip,
                    status === s.value && { backgroundColor: s.color + '20' },
                  ]}
                  textStyle={status === s.value ? { color: s.color } : {}}
                >
                  {s.label}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Item Name */}
        <TextInput
          label="Item Name *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />

        {/* Brand */}
        <TextInput
          label="Brand (optional)"
          value={brand}
          onChangeText={setBrand}
          mode="outlined"
          style={styles.input}
        />

        {/* Category */}
        <Menu
          visible={categoryMenuVisible}
          onDismiss={() => setCategoryMenuVisible(false)}
          anchor={
            <TextInput
              label="Category"
              value={category}
              mode="outlined"
              right={<TextInput.Icon icon="menu-down" onPress={() => setCategoryMenuVisible(true)} />}
              onPressIn={() => setCategoryMenuVisible(true)}
              editable={false}
              style={styles.input}
            />
          }
          anchorPosition="bottom"
          style={styles.menu}
        >
          <ScrollView style={styles.menuScroll}>
            {categories.map((cat) => (
              <Menu.Item
                key={cat.id || cat.name}
                title={cat.name}
                leadingIcon={cat.icon}
                onPress={() => {
                  setCategory(cat.name);
                  setCategoryMenuVisible(false);
                }}
              />
            ))}
          </ScrollView>
        </Menu>

        {/* Quantity and Unit */}
        <View style={styles.row}>
          <TextInput
            label="Quantity"
            value={quantity}
            onChangeText={setQuantity}
            mode="outlined"
            keyboardType="numeric"
            style={[styles.input, { flex: 1 }]}
          />
          <View style={styles.unitContainer}>
            <Text variant="bodySmall" style={styles.unitLabel}>Unit</Text>
            <SegmentedButtons
              value={unit}
              onValueChange={setUnit}
              buttons={UNITS}
              density="small"
            />
          </View>
        </View>

        {/* Notes */}
        <TextInput
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        {/* Barcode info */}
        {item.barcode && (
          <TextInput
            label="Barcode"
            value={item.barcode}
            mode="outlined"
            editable={false}
            style={styles.input}
          />
        )}

        {/* Error Message */}
        {error && (
          <HelperText type="error" visible={true} style={styles.error}>
            {error}
          </HelperText>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={styles.actionButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={isLoading}
            disabled={isLoading}
            style={styles.actionButton}
          >
            Save Changes
          </Button>
        </View>

        {/* Delete Button */}
        <Button
          mode="text"
          onPress={handleDelete}
          textColor={theme.colors.error}
          icon="delete"
          style={styles.deleteButton}
        >
          Delete Item
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statusCard: {
    marginBottom: 16,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    borderRadius: 8,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  unitContainer: {
    flex: 2,
  },
  unitLabel: {
    marginBottom: 8,
    marginLeft: 4,
  },
  menu: {
    width: '90%',
  },
  menuScroll: {
    maxHeight: 300,
  },
  error: {
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    marginTop: 24,
  },
});
