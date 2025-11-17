import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/constants/colors';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);
  const colors = useColors();

  useEffect(() => {
    // Initial status
    setIsOnline(navigator.onLine);

    // Listen for connection changes
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      // Hide after 3 seconds
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator && isOnline) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isOnline ? '#10b981' : '#ef4444',
        },
      ]}
    >
      <Text style={styles.text}>
        {isOnline ? '✓ Back Online' : '⚠ Offline - Data saved locally'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
