import { memo } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { useColors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

interface ReadingProgressBarProps {
  progress: number;
  variant?: 'small' | 'large';
}

const clampProgress = (value: number) => {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
};

export const ReadingProgressBar = memo(({ progress, variant = 'small' }: ReadingProgressBarProps) => {
  const colors = useColors();
  const safeProgress = clampProgress(progress);

  const height = variant === 'large' ? 8 : 4;
  const borderRadius = height / 2;
  const progressPercent = Math.round(safeProgress * 100);

  if (variant === 'small' && safeProgress <= 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.track,
          { 
            height, 
            borderRadius, 
            backgroundColor: colors.backgroundTertiary,
          },
        ]}
      >
        <View
          style={{
            height,
            borderRadius,
            width: `${progressPercent}%` as `${number}%`,
            overflow: 'hidden',
          }}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </View>
      </View>
      {variant === 'large' && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Reading progress
          </Text>
          <Text style={[styles.percentage, { color: colors.primary }]}>
            {progressPercent}%
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: 6,
  },
  track: {
    overflow: 'hidden',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  percentage: {
    fontSize: 12,
    fontWeight: '700',
  },
});
