import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export interface ColorTheme {
  // Backgrounds
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Surfaces
  card: string;
  cardHover: string;
  cardPressed: string;
  cardElevated: string;
  
  // Brand
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryMuted: string;
  secondary: string;
  accent: string;
  
  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  textOnPrimary: string;
  
  // Borders & Dividers
  border: string;
  borderLight: string;
  borderFocused: string;
  divider: string;
  
  // Semantic
  success: string;
  successLight: string;
  error: string;
  errorLight: string;
  warning: string;
  warningLight: string;
  info: string;
  infoLight: string;
  
  // Interactive
  buttonPrimary: string;
  buttonSecondary: string;
  buttonDisabled: string;
  inputBackground: string;
  inputBorder: string;
  inputFocused: string;
  
  // Overlay
  overlay: string;
  overlayLight: string;
  
  // Tab Bar
  tabBar: string;
  tabBarBorder: string;
  tabActive: string;
  tabInactive: string;
  
  // Shadows (for iOS)
  shadow: string;
  
  // Status colors
  unread: string;
  reading: string;
  completed: string;
}

export const lightColors: ColorTheme = {
  // Backgrounds - Clean whites with subtle warmth
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  backgroundTertiary: '#F1F3F5',
  
  // Surfaces - Soft grays for cards
  card: '#FFFFFF',
  cardHover: '#F8F9FA',
  cardPressed: '#F1F3F5',
  cardElevated: '#FFFFFF',
  
  // Brand - Vibrant indigo with accessible contrast
  primary: '#5B5FC7',
  primaryLight: '#E8E9FC',
  primaryDark: '#4A4EB5',
  primaryMuted: '#B4B6E4',
  secondary: '#7C3AED',
  accent: '#06B6D4',
  
  // Text - High contrast with refined grays
  text: '#1A1D21',
  textSecondary: '#5E6369',
  textTertiary: '#8B9099',
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  
  // Borders - Subtle and refined
  border: '#E5E7EB',
  borderLight: '#F1F3F5',
  borderFocused: '#5B5FC7',
  divider: '#E5E7EB',
  
  // Semantic - Balanced and accessible
  success: '#059669',
  successLight: '#D1FAE5',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  info: '#0284C7',
  infoLight: '#E0F2FE',
  
  // Interactive
  buttonPrimary: '#5B5FC7',
  buttonSecondary: '#F1F3F5',
  buttonDisabled: '#E5E7EB',
  inputBackground: '#F8F9FA',
  inputBorder: '#E5E7EB',
  inputFocused: '#5B5FC7',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',
  
  // Tab Bar
  tabBar: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  tabActive: '#5B5FC7',
  tabInactive: '#8B9099',
  
  // Shadow
  shadow: '#000000',
  
  // Status
  unread: '#5B5FC7',
  reading: '#D97706',
  completed: '#059669',
};

export const darkColors: ColorTheme = {
  // Backgrounds - Deep, rich blacks
  background: '#0D0D0F',
  backgroundSecondary: '#141417',
  backgroundTertiary: '#1A1A1E',
  
  // Surfaces - Elevated dark surfaces
  card: '#1A1A1E',
  cardHover: '#222226',
  cardPressed: '#2A2A2F',
  cardElevated: '#222226',
  
  // Brand - Brighter for dark mode visibility
  primary: '#7B7FE0',
  primaryLight: '#2D2E4A',
  primaryDark: '#9599F5',
  primaryMuted: '#4A4B6E',
  secondary: '#A78BFA',
  accent: '#22D3EE',
  
  // Text - Crisp whites with refined grays
  text: '#F9FAFB',
  textSecondary: '#A1A5AC',
  textTertiary: '#6B7280',
  textInverse: '#1A1D21',
  textOnPrimary: '#FFFFFF',
  
  // Borders - Subtle dark borders
  border: '#2E2E33',
  borderLight: '#222226',
  borderFocused: '#7B7FE0',
  divider: '#2E2E33',
  
  // Semantic - Vibrant for dark mode
  success: '#10B981',
  successLight: '#064E3B',
  error: '#EF4444',
  errorLight: '#7F1D1D',
  warning: '#F59E0B',
  warningLight: '#78350F',
  info: '#0EA5E9',
  infoLight: '#0C4A6E',
  
  // Interactive
  buttonPrimary: '#7B7FE0',
  buttonSecondary: '#2A2A2F',
  buttonDisabled: '#2E2E33',
  inputBackground: '#1A1A1E',
  inputBorder: '#2E2E33',
  inputFocused: '#7B7FE0',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(255, 255, 255, 0.05)',
  
  // Tab Bar
  tabBar: '#141417',
  tabBarBorder: '#2E2E33',
  tabActive: '#7B7FE0',
  tabInactive: '#6B7280',
  
  // Shadow
  shadow: '#000000',
  
  // Status
  unread: '#7B7FE0',
  reading: '#F59E0B',
  completed: '#10B981',
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

export function useTheme(): 'light' | 'dark' {
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

// Utility for getting status color
export function getStatusColor(status: 'unread' | 'reading' | 'completed', colors: ColorTheme): string {
  switch (status) {
    case 'unread':
      return colors.unread;
    case 'reading':
      return colors.reading;
    case 'completed':
      return colors.completed;
    default:
      return colors.textSecondary;
  }
}