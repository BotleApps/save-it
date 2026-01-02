import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Platform } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Trash2, CheckCircle, RotateCcw } from 'lucide-react-native';
import { Link } from '@/types/link';
import { LinkCard } from './LinkCard';
import { useColors } from '@/constants/colors';
import * as Haptics from 'expo-haptics';

interface SwipeableLinkCardProps {
  link: Link;
  onPress: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
}

export function SwipeableLinkCard({
  link,
  onPress,
  onDelete,
  onToggleComplete,
}: SwipeableLinkCardProps) {
  const colors = useColors();
  const swipeableRef = useRef<Swipeable>(null);

  const triggerHaptic = (type: 'success' | 'warning') => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(
        type === 'success' 
          ? Haptics.NotificationFeedbackType.Success 
          : Haptics.NotificationFeedbackType.Warning
      );
    }
  };

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0.5, 1],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [0, 60, 80],
      outputRange: [0, 0.5, 1],
      extrapolate: 'clamp',
    });

    const isCompleted = link.status === 'completed';

    return (
      <Pressable
        style={[styles.leftAction, { backgroundColor: colors.success }]}
        onPress={() => {
          triggerHaptic('success');
          onToggleComplete();
          swipeableRef.current?.close();
        }}
      >
        <Animated.View style={[styles.actionContent, { transform: [{ scale }], opacity }]}>
          {isCompleted ? (
            <RotateCcw size={22} color="#fff" strokeWidth={2.5} />
          ) : (
            <CheckCircle size={22} color="#fff" strokeWidth={2.5} />
          )}
          <Text style={styles.actionText}>
            {isCompleted ? 'Unmark' : 'Done'}
          </Text>
        </Animated.View>
      </Pressable>
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [-80, -60, 0],
      outputRange: [1, 0.5, 0],
      extrapolate: 'clamp',
    });

    return (
      <Pressable
        style={[styles.rightAction, { backgroundColor: colors.error }]}
        onPress={() => {
          triggerHaptic('warning');
          onDelete();
          swipeableRef.current?.close();
        }}
      >
        <Animated.View style={[styles.actionContent, { transform: [{ scale }], opacity }]}>
          <Trash2 size={22} color="#fff" strokeWidth={2.5} />
          <Text style={styles.actionText}>Delete</Text>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      leftThreshold={80}
      rightThreshold={80}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
      containerStyle={styles.swipeContainer}
    >
      <LinkCard link={link} onPress={onPress} />
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    marginBottom: 0,
  },
  leftAction: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 24,
    borderRadius: 16,
    marginBottom: 12,
    minWidth: 100,
  },
  rightAction: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 24,
    borderRadius: 16,
    marginBottom: 12,
    minWidth: 100,
  },
  actionContent: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
