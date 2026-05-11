import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';

export default function SettingsScreen() {
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Settings</Text>
      {user && (
        <View style={styles.userInfo}>
          <Text variant="bodyLarge" style={styles.userName}>
            {user.displayName || 'User'}
          </Text>
          <Text variant="bodyMedium" style={styles.userEmail}>
            {user.email}
          </Text>
        </View>
      )}
      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor="#F44336"
      >
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  userInfo: {
    marginTop: 24,
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: '#666',
  },
  logoutButton: {
    marginTop: 16,
  },
});
