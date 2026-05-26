// Root layout for SmartCart app
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator, useColorScheme } from 'react-native';
import useAuthStore from '../store/authStore';

// Custom theme colors (green primary for grocery app)
const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4CAF50',
    primaryContainer: '#C8E6C9',
    secondary: '#2196F3',
    secondaryContainer: '#BBDEFB',
    error: '#F44336',
    errorContainer: '#FFCDD2',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
  },
};

const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#81C784',
    primaryContainer: '#388E3C',
    secondary: '#64B5F6',
    secondaryContainer: '#1976D2',
    error: '#EF5350',
    errorContainer: '#C62828',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? customDarkTheme : customLightTheme;

  const { initializeAuth, isLoading, user } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = initializeAuth();
    setIsInitialized(true);
    return () => unsubscribe();
  }, []);

  // Show loading screen while initializing
  if (!isInitialized || isLoading) {
    return (
      <PaperProvider theme={theme}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </PaperProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          {user ? (
            // User is logged in - show main app
            <>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="list/[id]"
                options={{
                  headerShown: true,
                  title: 'List',
                  presentation: 'card',
                }}
              />
              <Stack.Screen
                name="item/new"
                options={{
                  headerShown: true,
                  title: 'Add Item',
                  presentation: 'modal',
                }}
              />
              <Stack.Screen
                name="item/[id]"
                options={{
                  headerShown: true,
                  title: 'Item Details',
                  presentation: 'card',
                }}
              />
            </>
          ) : (
            // User is not logged in - show auth screens
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          )}
        </Stack>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
