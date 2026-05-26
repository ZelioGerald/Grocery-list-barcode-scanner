import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { PaperProvider, Text } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';
import { View, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { isFirebaseConfigured, initializeFirebase, getAuth } from '../lib/firebase';

function ConfigurationScreen() {
  return (
    <ScrollView contentContainerStyle={styles.configContainer}>
      <View style={styles.configContent}>
        <Text variant="headlineMedium" style={styles.configTitle}>
          ⚠️ Firebase Not Configured
        </Text>
        <Text variant="bodyLarge" style={styles.configText}>
          Welcome to SmartCart! To get started, you need to configure Firebase.
        </Text>
        <View style={styles.configSteps}>
          <Text variant="titleMedium" style={styles.configStepTitle}>
            Setup Steps:
          </Text>
          <Text variant="bodyMedium" style={styles.configStep}>
            1. Create a Firebase project at firebase.google.com
          </Text>
          <Text variant="bodyMedium" style={styles.configStep}>
            2. Enable Firestore Database and Authentication
          </Text>
          <Text variant="bodyMedium" style={styles.configStep}>
            3. Copy your Firebase config values
          </Text>
          <Text variant="bodyMedium" style={styles.configStep}>
            4. Create a .env file in the project root
          </Text>
          <Text variant="bodyMedium" style={styles.configStep}>
            5. Add your Firebase credentials to .env
          </Text>
          <Text variant="bodyMedium" style={styles.configStep}>
            6. Restart the app (npm start -- --clear)
          </Text>
        </View>
        <View style={styles.configExample}>
          <Text variant="titleSmall" style={styles.configExampleTitle}>
            .env file format:
          </Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
              EXPO_PUBLIC_FIREBASE_API_KEY=AIza...{'\n'}
              EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com{'\n'}
              EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id{'\n'}
              EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com{'\n'}
              EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789{'\n'}
              EXPO_PUBLIC_FIREBASE_APP_ID=1:123:web:abc123
            </Text>
          </View>
        </View>
        <Text variant="bodySmall" style={styles.configHint}>
          See SETUP_GUIDE.md for detailed instructions
        </Text>
      </View>
    </ScrollView>
  );
}

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { user, loading, setUser, clearUser, setLoading } = useAuthStore();
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [configValid, setConfigValid] = useState(true);

  useEffect(() => {
    // Check if Firebase is configured
    if (!isFirebaseConfigured()) {
      setConfigValid(false);
      setLoading(false);
      return;
    }

    // Initialize Firebase lazily
    const init = async () => {
      try {
        const { auth, error } = await initializeFirebase();

        if (error || !auth) {
          console.error('Firebase init failed:', error);
          setConfigValid(false);
          setLoading(false);
          return;
        }

        // Import onAuthStateChanged dynamically
        const { onAuthStateChanged } = await import('firebase/auth');

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            setUser(firebaseUser);
          } else {
            clearUser();
          }
          setFirebaseReady(true);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Firebase setup error:', error);
        setConfigValid(false);
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (loading || !firebaseReady) return;

    // If Firebase is not configured, don't do routing
    if (!configValid) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (user && inAuthGroup) {
      // User is logged in but viewing auth screens, redirect to tabs
      router.replace('/(tabs)');
    } else if (!user && !inAuthGroup) {
      // User is not logged in but trying to access protected screens, redirect to login
      router.replace('/login');
    }
  }, [user, segments, loading, firebaseReady, configValid]);

  // Show configuration screen if Firebase is not set up
  if (!configValid) {
    return (
      <PaperProvider>
        <ConfigurationScreen />
      </PaperProvider>
    );
  }

  if (loading || !firebaseReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <Slot />
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  configContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  configContent: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  configTitle: {
    color: '#FF9800',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  configText: {
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  configSteps: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  configStepTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#4CAF50',
  },
  configStep: {
    marginBottom: 8,
    color: '#333',
  },
  configExample: {
    marginBottom: 24,
  },
  configExampleTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  codeBlock: {
    backgroundColor: '#263238',
    padding: 12,
    borderRadius: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#4CAF50',
  },
  configHint: {
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
