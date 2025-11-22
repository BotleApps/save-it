import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/constants/colors';

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

  const height = variant === 'large' ? 10 : 6;
  const borderRadius = height / 2;
  const progressPercent = `${Math.round(safeProgress * 100)}%` as `${number}%`;

  if (variant === 'small' && safeProgress <= 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.track,
          { height, borderRadius, backgroundColor: colors.border },
        ]}
      >
        <View
          style={{
            height,
            borderRadius,
            width: progressPercent,
            backgroundColor: colors.primary,
          }}
        />
      </View>
      {variant === 'large' && (
        <Text style={[styles.label, { color: colors.text }]}>Reading progress {Math.round(safeProgress * 100)}%</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  track: {
    overflow: 'hidden',
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
});
