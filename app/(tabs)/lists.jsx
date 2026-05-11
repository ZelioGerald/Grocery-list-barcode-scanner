import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function ListsScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">All Lists</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Manage all your grocery lists
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
