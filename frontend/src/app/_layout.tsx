import { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../context/AuthContext';
import { BookingProvider } from '../context/BookingContext';
import { WishlistProvider } from '../context/WishlistContext';
import { GoldenWingTheme } from '../constants/theme';
import GoldenWingSplash from '../components/golden-wing-splah';

ExpoSplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    ExpoSplashScreen.hideAsync().catch(() => {});
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <BookingProvider>
          <WishlistProvider>
            <StatusBar style="light" />
            {showSplash ? (
              <GoldenWingSplash />
            ) : (
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: {
                    backgroundColor: GoldenWingTheme.colors.background,
                  },
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="flights/search-results" options={{ headerShown: false }} />
                <Stack.Screen name="flights/details" options={{ headerShown: false }} />
                <Stack.Screen name="flights/seat-selection" options={{ headerShown: false }} />
                <Stack.Screen name="flights/passenger-info" options={{ headerShown: false }} />
                <Stack.Screen name="booking/summary" options={{ headerShown: false }} />
                <Stack.Screen name="booking/payment" options={{ headerShown: false }} />
                <Stack.Screen name="booking/checkout" options={{ headerShown: false }} />
                <Stack.Screen name="booking/confirmation" options={{ headerShown: false }} />
                <Stack.Screen name="ticket/[id]" options={{ headerShown: false }} />
              </Stack>
            )}
          </WishlistProvider>
        </BookingProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
