// Settings screen
import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  List,
  Switch,
  useTheme,
  Divider,
  Button,
  Portal,
  Dialog,
  Avatar,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';
import useListStore from '../../store/listStore';

export default function SettingsScreen() {
  const theme = useTheme();
  const { user, userProfile, logout } = useAuthStore();
  const { cleanup } = useListStore();

  const [darkMode, setDarkMode] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  const handleLogout = async () => {
    setLogoutDialogVisible(false);
    cleanup(); // Clean up subscriptions
    await logout();
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Avatar.Text
          size={80}
          label={getInitials(user?.displayName || userProfile?.displayName)}
          style={{ backgroundColor: theme.colors.primary }}
        />
        <Text variant="titleLarge" style={styles.profileName}>
          {user?.displayName || userProfile?.displayName || 'User'}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {user?.email}
        </Text>
      </View>

      <Divider style={styles.divider} />

      {/* Preferences Section */}
      <List.Section>
        <List.Subheader>Preferences</List.Subheader>

        <List.Item
          title="Dark Mode"
          description="Use dark theme"
          left={(props) => <List.Icon {...props} icon="brightness-6" />}
          right={() => (
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              color={theme.colors.primary}
            />
          )}
        />

        <List.Item
          title="Default Unit"
          description="Pieces (pcs)"
          left={(props) => <List.Icon {...props} icon="scale" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => Alert.alert('Coming Soon', 'This feature will be available in the next update.')}
        />

        <List.Item
          title="Sort by Category"
          description="Group items by category"
          left={(props) => <List.Icon {...props} icon="sort" />}
          right={() => (
            <Switch
              value={true}
              disabled
              color={theme.colors.primary}
            />
          )}
        />
      </List.Section>

      <Divider style={styles.divider} />

      {/* Categories Section */}
      <List.Section>
        <List.Subheader>Categories</List.Subheader>

        <List.Item
          title="Manage Categories"
          description="Add, edit, or remove categories"
          left={(props) => <List.Icon {...props} icon="tag-multiple" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => Alert.alert('Coming Soon', 'Category management will be available in the next update.')}
        />
      </List.Section>

      <Divider style={styles.divider} />

      {/* Data Section */}
      <List.Section>
        <List.Subheader>Data</List.Subheader>

        <List.Item
          title="Export Data"
          description="Download your lists and pantry"
          left={(props) => <List.Icon {...props} icon="download" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => Alert.alert('Coming Soon', 'Data export will be available in the next update.')}
        />

        <List.Item
          title="Clear All Data"
          description="Delete all lists and pantry items"
          left={(props) => <List.Icon {...props} icon="delete-sweep" color={theme.colors.error} />}
          onPress={() => {
            Alert.alert(
              'Clear All Data',
              'This will permanently delete all your lists and pantry items. This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Everything',
                  style: 'destructive',
                  onPress: () => Alert.alert('Coming Soon', 'This feature will be available in the next update.'),
                },
              ]
            );
          }}
        />
      </List.Section>

      <Divider style={styles.divider} />

      {/* About Section */}
      <List.Section>
        <List.Subheader>About</List.Subheader>

        <List.Item
          title="Version"
          description="1.0.0"
          left={(props) => <List.Icon {...props} icon="information" />}
        />

        <List.Item
          title="Privacy Policy"
          left={(props) => <List.Icon {...props} icon="shield-account" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => Alert.alert('Privacy Policy', 'Your data is stored securely in Firebase and is only accessible to you.')}
        />
      </List.Section>

      <Divider style={styles.divider} />

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <Button
          mode="outlined"
          onPress={() => setLogoutDialogVisible(true)}
          icon="logout"
          textColor={theme.colors.error}
          style={[styles.logoutButton, { borderColor: theme.colors.error }]}
        >
          Log Out
        </Button>
      </View>

      {/* Logout Confirmation Dialog */}
      <Portal>
        <Dialog visible={logoutDialogVisible} onDismiss={() => setLogoutDialogVisible(false)}>
          <Dialog.Title>Log Out</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to log out? Your data will still be saved.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleLogout} textColor={theme.colors.error}>
              Log Out
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  profileName: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 8,
  },
  logoutSection: {
    padding: 24,
    paddingBottom: 48,
  },
  logoutButton: {
    borderWidth: 1,
  },
});
