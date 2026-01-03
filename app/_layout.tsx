import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { initSentry } from '@/lib/sentry';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/contexts/toast';
import { useColors } from '@/constants/colors';
import { Platform, View } from 'react-native';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { useReadingReminders } from '@/hooks/use-reading-reminders';

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colors = useColors();
  useReadingReminders();
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    // Initialize Sentry only on native platforms and when configured
    if (Platform.OS !== 'web') {
      initSentry();
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // For web platform, don't use ErrorBoundary to avoid the ErrorHandler issue
  if (Platform.OS === 'web') {
    return (
      <ToastProvider>
        <View style={{ flex: 1 }}>
          <OfflineIndicator />
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: colors.background,
              },
              headerTintColor: colors.text,
              headerBackTitle: "Back",
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
            <Stack.Screen name="link/[id]" options={{ 
              headerShown: true,
              title: "Link Details"
            }} />
            <Stack.Screen 
              name="new-link" 
              options={{
                presentation: "fullScreenModal",
                headerShown: false,
                animation: "fade"
              }}
            />
          </Stack>
        </View>
      </ToastProvider>
    );
  }

  // For native platforms, use ErrorBoundary
  return (
    <ToastProvider>
      <ErrorBoundary>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
            headerBackTitle: "Back",
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          <Stack.Screen name="link/[id]" options={{ 
            headerShown: true,
            title: "Link Details"
          }} />
          <Stack.Screen 
            name="new-link" 
            options={{
              presentation: "fullScreenModal",
              headerShown: false,
              animation: "fade"
            }}
          />
        </Stack>
      </ErrorBoundary>
    </ToastProvider>
  );
}
