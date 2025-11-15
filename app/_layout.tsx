import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/contexts/toast';
import { useColors } from '@/constants/colors';
import { Platform } from 'react-native';

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colors = useColors();
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

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
