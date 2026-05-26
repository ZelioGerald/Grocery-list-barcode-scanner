// Barcode Scanner screen
import { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, useTheme, Card, ActivityIndicator } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SCANS_KEY = '@smartcart_recent_scans';

export default function ScannerScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [torch, setTorch] = useState(false);
  const [productInfo, setProductInfo] = useState(null);
  const [recentScans, setRecentScans] = useState([]);

  useEffect(() => {
    loadRecentScans();
  }, []);

  const loadRecentScans = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SCANS_KEY);
      if (stored) {
        setRecentScans(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent scans:', error);
    }
  };

  const saveRecentScan = async (scan) => {
    try {
      const updated = [scan, ...recentScans.filter(s => s.barcode !== scan.barcode)].slice(0, 5);
      setRecentScans(updated);
      await AsyncStorage.setItem(RECENT_SCANS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent scan:', error);
    }
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || isLoading) return;

    setScanned(true);
    setIsLoading(true);

    try {
      // Fetch product info from Open Food Facts API
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${data}.json`
      );
      const result = await response.json();

      if (result.status === 1 && result.product) {
        const product = result.product;
        const info = {
          barcode: data,
          name: product.product_name || 'Unknown Product',
          brand: product.brands || null,
          category: mapCategory(product.categories_tags || []),
          imageURL: product.image_url || null,
        };

        setProductInfo(info);
        saveRecentScan(info);
      } else {
        // Product not found
        setProductInfo({
          barcode: data,
          name: null,
          brand: null,
          category: 'Other',
          imageURL: null,
          notFound: true,
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      Alert.alert('Error', 'Failed to look up product. Please try again.');
      setScanned(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Map Open Food Facts categories to our app categories
  const mapCategory = (tags) => {
    const categoryMap = {
      'en:beverages': 'Beverages',
      'en:drinks': 'Beverages',
      'en:dairy': 'Dairy',
      'en:milk': 'Dairy',
      'en:cheese': 'Dairy',
      'en:meats': 'Meat & Seafood',
      'en:seafood': 'Meat & Seafood',
      'en:fish': 'Meat & Seafood',
      'en:breads': 'Bakery',
      'en:bakery': 'Bakery',
      'en:frozen': 'Frozen',
      'en:snacks': 'Snacks',
      'en:fruits': 'Produce',
      'en:vegetables': 'Produce',
      'en:fresh': 'Produce',
    };

    for (const tag of tags) {
      const lowerTag = tag.toLowerCase();
      for (const [key, value] of Object.entries(categoryMap)) {
        if (lowerTag.includes(key.replace('en:', ''))) {
          return value;
        }
      }
    }
    return 'Other';
  };

  const handleAddProduct = () => {
    if (productInfo) {
      // Navigate to add item screen with pre-filled data
      const params = new URLSearchParams({
        barcode: productInfo.barcode || '',
        name: productInfo.name || '',
        brand: productInfo.brand || '',
        category: productInfo.category || 'Other',
        imageURL: productInfo.imageURL || '',
      });
      router.push(`/item/new?${params.toString()}`);
    }
    resetScanner();
  };

  const resetScanner = () => {
    setScanned(false);
    setProductInfo(null);
    setIsLoading(false);
  };

  // Permission not determined yet
  if (!permission) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="camera-outline" size={80} color={theme.colors.primary} />
        <Text variant="headlineSmall" style={styles.title}>
          Camera Access Needed
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          We need camera access to scan barcodes
        </Text>
        <Button mode="contained" onPress={requestPermission} style={{ marginTop: 24 }}>
          Grant Permission
        </Button>
        <Button
          mode="text"
          onPress={() => router.push('/item/new')}
          style={{ marginTop: 12 }}
        >
          Add Item Manually
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {/* Scanning Overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Looking up product...</Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Button
            mode="contained-tonal"
            onPress={() => setTorch(!torch)}
            icon={torch ? 'flashlight-off' : 'flashlight'}
            style={styles.controlButton}
          >
            {torch ? 'Light Off' : 'Light On'}
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push('/item/new')}
            icon="pencil"
            style={[styles.controlButton, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
          >
            Manual Entry
          </Button>
        </View>
      </CameraView>

      {/* Product Info Card (shown when product is scanned) */}
      {productInfo && (
        <Card style={styles.productCard} mode="elevated">
          <Card.Content>
            {productInfo.notFound ? (
              <>
                <Text variant="titleMedium">Product Not Found</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Barcode: {productInfo.barcode}
                </Text>
                <Text variant="bodyMedium" style={{ marginTop: 8 }}>
                  This product isn't in our database. You can add it manually.
                </Text>
              </>
            ) : (
              <>
                <Text variant="titleMedium">{productInfo.name}</Text>
                {productInfo.brand && (
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {productInfo.brand}
                  </Text>
                )}
                <Text variant="bodySmall" style={{ color: theme.colors.primary, marginTop: 4 }}>
                  {productInfo.category}
                </Text>
              </>
            )}
          </Card.Content>
          <Card.Actions>
            <Button onPress={resetScanner}>Scan Again</Button>
            <Button mode="contained" onPress={handleAddProduct}>
              Add to List
            </Button>
          </Card.Actions>
        </Card>
      )}
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
  title: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scanArea: {
    width: 280,
    height: 150,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#4CAF50',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  controlButton: {
    flex: 1,
  },
  productCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    margin: 16,
    marginBottom: 100,
  },
});
