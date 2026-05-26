import { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { useRouter, Link } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../lib/firebase';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const router = useRouter();

  const handleLogin = async () => {
    if (!isFirebaseConfigured() || !auth) {
      Alert.alert(
        'Firebase Not Configured',
        'Please configure Firebase credentials in your .env file and restart the app.'
      );
      return;
    }

    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation handled by auth listener
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to login. Please try again.';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      }

      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // TODO: Implement Google Sign-In in future update
    // For now, we'll show a placeholder message
    Alert.alert(
      'Coming Soon',
      'Google Sign-In will be available in a future update. Please use email/password for now.'
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="auto" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text variant="displaySmall" style={styles.title}>
              SmartCart
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Your Smart Grocery Assistant
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
              disabled={loading}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={secureText}
              autoCapitalize="none"
              autoComplete="password"
              style={styles.input}
              disabled={loading}
              right={
                <TextInput.Icon
                  icon={secureText ? 'eye' : 'eye-off'}
                  onPress={() => setSecureText(!secureText)}
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : 'Login'}
            </Button>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              mode="outlined"
              onPress={handleGoogleSignIn}
              style={styles.button}
              icon="google"
              disabled={loading}
            >
              Continue with Google
            </Button>

            <View style={styles.footer}>
              <Text variant="bodyMedium">Don't have an account? </Text>
              <Link href="/register" asChild>
                <Text variant="bodyMedium" style={styles.link}>
                  Sign Up
                </Text>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  link: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});
