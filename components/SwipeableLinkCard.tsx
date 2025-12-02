import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
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

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0.5, 1],
      extrapolate: 'clamp',
    });

    const isCompleted = link.status === 'completed';

    return (
      <Pressable
        style={[styles.leftAction, { backgroundColor: colors.success }]}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onToggleComplete();
          swipeableRef.current?.close();
        }}
      >
        <Animated.View style={[styles.actionContent, { transform: [{ scale }] }]}>
          {isCompleted ? (
            <RotateCcw size={24} color="#fff" />
          ) : (
            <CheckCircle size={24} color="#fff" />
          )}
          <Text style={styles.actionText}>
            {isCompleted ? 'Unmark' : 'Complete'}
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

    return (
      <Pressable
        style={[styles.rightAction, { backgroundColor: colors.error }]}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          onDelete();
          swipeableRef.current?.close();
        }}
      >
        <Animated.View style={[styles.actionContent, { transform: [{ scale }] }]}>
          <Trash2 size={24} color="#fff" />
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
    >
      <LinkCard link={link} onPress={onPress} />
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  leftAction: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
    borderRadius: 20,
    marginBottom: 16,
    minWidth: 100,
  },
  rightAction: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
    borderRadius: 20,
    marginBottom: 16,
    minWidth: 100,
  },
  actionContent: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
