import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from '@/types/link';
import { Clock, BookOpen, CheckCircle2 } from 'lucide-react-native';
import { useColors } from '@/constants/colors';
import { ReadingProgressBar } from '@/components/ReadingProgressBar';

interface LinkCardProps {
  link: Link;
  onPress: () => void;
}

const StatusIcon = ({ status, color }: { status: Link['status']; color: string }) => {
  switch (status) {
    case 'unread':
      return <Clock size={16} color={color} />;
    case 'reading':
      return <BookOpen size={16} color={color} />;
    case 'completed':
      return <CheckCircle2 size={16} color={color} />;
  }
};

export function LinkCard({ link, onPress }: LinkCardProps) {
  const colors = useColors();
  const [imageError, setImageError] = useState(false);
  const hasImage = Boolean(link.imageUrl) && !imageError;
  const gradientPalette = useMemo(() => {
    const gradients: ReadonlyArray<[string, string]> = [
      ['#f472b6', '#c084fc'],
      ['#60a5fa', '#818cf8'],
      ['#f97316', '#facc15'],
      ['#34d399', '#10b981'],
      ['#f43f5e', '#ec4899'],
      ['#c084fc', '#a855f7'],
      ['#38bdf8', '#2563eb'],
    ];
    const key = link.id || link.url;
    const hash = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  }, [link.id, link.url]);

  const readableTag = useMemo(() => {
    if (link.tags.length > 0) return `#${link.tags[0]}`;
    return link.category || 'Collection';
  }, [link.tags, link.category]);

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        { borderColor: colors.cardHover },
        pressed && { transform: [{ scale: 0.98 }] }
      ]}
      onPress={onPress}
    >
      <View style={styles.mediaWrapper}>
        {hasImage ? (
          <Image
            source={{ uri: link.imageUrl! }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <LinearGradient
            colors={gradientPalette}
            style={StyleSheet.absoluteFill}
          />
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.cardTopRow}>
          <View style={[styles.badge, { backgroundColor: 'rgba(0,0,0,0.35)' }]}> 
            <Text style={styles.badgeText}>{readableTag}</Text>
          </View>
          <StatusIcon status={link.status} color="#fff" />
        </View>

        <View style={styles.mediaContent}>
          <Text style={styles.category} numberOfLines={1}>
            {link.category || 'Save It'}
          </Text>
          <Text style={styles.title} numberOfLines={3}>
            {link.title}
          </Text>
          <View style={styles.metaRow}>
            {link.estimatedReadTime ? (
              <Text style={styles.metaText}>{link.estimatedReadTime} min read</Text>
            ) : (
              <Text style={styles.metaText}>Tap to open</Text>
            )}
            {link.tags.length > 1 && (
              <Text style={styles.metaText}>+{link.tags.length - 1} tags</Text>
            )}
          </View>
          {(link.readingProgress ?? 0) > 0 && (
            <View style={styles.progressSection}>
              <ReadingProgressBar progress={link.readingProgress ?? 0} />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 16,
    flex: 1,
    minHeight: 240,
  },
  mediaWrapper: {
    flex: 1,
    position: 'relative',
    padding: 18,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  mediaContent: {
    marginTop: 'auto',
  },
  category: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    opacity: 0.85,
  },
  metaText: {
    color: '#fff',
    fontSize: 12,
  },
  progressSection: {
    marginTop: 12,
  },
});
