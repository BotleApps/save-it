import { useEffect } from 'react';
import { StyleSheet, Text, Animated } from 'react-native';
import { useColors } from '@/constants/colors';
import { AlertCircle, CheckCircle } from 'lucide-react-native';

interface ToastProps {
  message: string;
  type?: 'error' | 'success';
  onHide?: () => void;
  duration?: number;
}

export function Toast({ message, type = 'error', onHide, duration = 3000 }: ToastProps) {
  const colors = useColors();
  const translateY = new Animated.Value(100);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide?.();
      });
    }, duration - 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: type === 'error' ? colors.error : colors.success,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      {type === 'error' ? (
        <AlertCircle size={20} color="white" />
      ) : (
        <CheckCircle size={20} color="white" />
      )}
      <Text style={styles.text} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 9999,
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
