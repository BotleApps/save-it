import { useEffect, useRef } from 'react';
import { StyleSheet, Text, Animated, Platform } from 'react-native';
import { useColors } from '@/constants/colors';
import { AlertCircle, CheckCircle } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/constants/colors';

interface ToastProps {
  message: string;
  type?: 'error' | 'success';
  onHide?: () => void;
  duration?: number;
}

export function Toast({ message, type = 'error', onHide, duration = 3000 }: ToastProps) {
  const colors = useColors();
  const theme = useTheme();
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide?.();
      });
    }, duration - 250);

    return () => clearTimeout(timer);
  }, []);

  const backgroundColor = type === 'error' ? colors.error : colors.success;
  const iconBgColor = type === 'error' ? colors.errorLight : colors.successLight;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }, { scale }],
          opacity,
          shadowColor: backgroundColor,
        },
      ]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={80}
          tint={theme === 'dark' ? 'dark' : 'light'}
          style={[styles.blurContainer, { borderColor: colors.border }]}
        >
          <ToastContent 
            type={type} 
            message={message} 
            backgroundColor={backgroundColor}
            iconBgColor={iconBgColor}
            colors={colors}
          />
        </BlurView>
      ) : (
        <Animated.View style={[styles.androidContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ToastContent 
            type={type} 
            message={message} 
            backgroundColor={backgroundColor}
            iconBgColor={iconBgColor}
            colors={colors}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
}

function ToastContent({ 
  type, 
  message, 
  backgroundColor, 
  iconBgColor,
  colors 
}: { 
  type: 'error' | 'success'; 
  message: string; 
  backgroundColor: string;
  iconBgColor: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <>
      <Animated.View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        {type === 'error' ? (
          <AlertCircle size={18} color={backgroundColor} strokeWidth={2.5} />
        ) : (
          <CheckCircle size={18} color={backgroundColor} strokeWidth={2.5} />
        )}
      </Animated.View>
      <Text style={[styles.text, { color: colors.text }]} numberOfLines={2}>
        {message}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 9999,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  blurContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  androidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
});
