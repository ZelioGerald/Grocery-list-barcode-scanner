import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function PantryScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Pantry</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Track your home stock here
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
