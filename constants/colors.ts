import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export interface ColorTheme {
  background: string;
  card: string;
  cardHover: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  error: string;
  warning: string;
}

export const lightColors: ColorTheme = {
  background: '#FFFFFF',
  card: '#F4F4F5',
  cardHover: '#E4E4E7',
  primary: '#6366F1',
  secondary: '#8B5CF6',
  text: '#18181B',
  textSecondary: '#71717A',
  border: '#E4E4E7',
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
};

export const darkColors: ColorTheme = {
  background: '#0A0A0B',
  card: '#141417',
  cardHover: '#1C1C1F',
  primary: '#818CF8',
  secondary: '#A78BFA',
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  border: '#27272A',
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
};

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function useTheme() {
  const systemTheme = useColorScheme();
  const { theme } = useThemeStore();
  
  return theme === 'system' ? systemTheme || 'light' : theme;
}

export function useColors(): ColorTheme {
  const theme = useTheme();
  return theme === 'dark' ? darkColors : lightColors;
}

// Default colors for static StyleSheets
export const colors = lightColors;