import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function ScannerScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Barcode Scanner</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Scan product barcodes here
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  subtitle: {
    marginTop: 8,
    color: '#666',
    textAlign: 'center',
  },
});
