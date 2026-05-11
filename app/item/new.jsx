import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  SegmentedButtons,
  ActivityIndicator,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useAuthStore } from '../../store/authStore';
import { createItem, getCategories } from '../../lib/firestore';
import { UNIT_OPTIONS, STATUS_OPTIONS } from '../../lib/constants';

export default function NewItemScreen() {
  const { listId, barcode } = useLocalSearchParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Other');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [status, setStatus] = useState(STATUS_OPTIONS.OUT_OF_STOCK);
  const [notes, setNotes] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch categories
    getCategories(user.uid)
      .then((cats) => {
        setCategories(cats);
        if (cats.length > 0 && !category) {
          setCategory(cats[0].name);
        }
      })
      .finally(() => setLoadingCategories(false));
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    if (!listId) {
      Alert.alert('Error', 'No list selected');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    setLoading(true);
    try {
      await createItem(user.uid, listId, {
        name: name.trim(),
        brand: brand.trim() || null,
        barcode: barcode || null,
        category,
        quantity: quantityNum,
        unit,
        status,
        imageURL: null,
        notes: notes.trim() || null,
      });

      Alert.alert('Success', 'Item added successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error creating item:', error);
      Alert.alert('Error', 'Failed to add item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategories) {
    return (
      <>
        <Stack.Screen options={{ title: 'Add Item' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Add Item' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Basic Information
            </Text>

            <TextInput
              label="Item Name *"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., Milk"
              disabled={loading}
            />

            <TextInput
              label="Brand (Optional)"
              value={brand}
              onChangeText={setBrand}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., Organic Valley"
              disabled={loading}
            />

            {barcode && (
              <TextInput
                label="Barcode"
                value={barcode}
                mode="outlined"
                style={styles.input}
                disabled
              />
            )}

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Category
            </Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={category}
                onValueChange={setCategory}
                enabled={!loading}
                style={styles.picker}
              >
                {categories.map((cat) => (
                  <Picker.Item key={cat.id} label={cat.name} value={cat.name} />
                ))}
              </Picker>
            </View>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Quantity
            </Text>

            <View style={styles.row}>
              <TextInput
                label="Quantity *"
                value={quantity}
                onChangeText={setQuantity}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.quantityInput]}
                disabled={loading}
              />

              <View style={styles.unitPickerContainer}>
                <Picker
                  selectedValue={unit}
                  onValueChange={setUnit}
                  enabled={!loading}
                  style={styles.picker}
                >
                  {UNIT_OPTIONS.map((unitOption) => (
                    <Picker.Item
                      key={unitOption}
                      label={unitOption}
                      value={unitOption}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Status
            </Text>

            <SegmentedButtons
              value={status}
              onValueChange={setStatus}
              buttons={[
                {
                  value: STATUS_OPTIONS.OUT_OF_STOCK,
                  label: 'Out',
                  style: { backgroundColor: status === STATUS_OPTIONS.OUT_OF_STOCK ? '#F44336' : undefined },
                },
                {
                  value: STATUS_OPTIONS.IN_STOCK,
                  label: 'In Stock',
                  style: { backgroundColor: status === STATUS_OPTIONS.IN_STOCK ? '#4CAF50' : undefined },
                },
                {
                  value: STATUS_OPTIONS.IN_CART,
                  label: 'In Cart',
                  style: { backgroundColor: status === STATUS_OPTIONS.IN_CART ? '#2196F3' : undefined },
                },
              ]}
              style={styles.segmentedButtons}
              disabled={loading}
            />

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Notes (Optional)
            </Text>

            <TextInput
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              placeholder="Any additional notes..."
              disabled={loading}
            />

            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.saveButton}
              loading={loading}
              disabled={loading}
            >
              Add to List
            </Button>

            <Button
              mode="outlined"
              onPress={() => router.back()}
              style={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  form: {
    paddingBottom: 32,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  quantityInput: {
    flex: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    marginBottom: 12,
  },
  unitPickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
  },
  picker: {
    height: 56,
  },
  segmentedButtons: {
    marginBottom: 12,
  },
  saveButton: {
    marginTop: 24,
    marginBottom: 12,
  },
  cancelButton: {
    marginBottom: 12,
  },
});
