import React from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import { useColors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  icon: React.ReactNode;
  onPress: () => void;
}

export function FloatingButton({ icon, onPress }: Props) {
  const colors = useColors();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          shadowColor: colors.primary,
        },
        pressed && styles.pressed
      ]}
      onPress={onPress}
    >
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {icon}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 100 : 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.92 }],
    shadowOpacity: 0.2,
  },
});