import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from '@/types/link';
import { Clock, BookOpen, CheckCircle2, Globe, Tag } from 'lucide-react-native';
import { useColors, getStatusColor } from '@/constants/colors';
import { ReadingProgressBar } from '@/components/ReadingProgressBar';

interface LinkCardProps {
  link: Link;
  onPress: () => void;
}

const StatusBadge = ({ status, colors }: { status: Link['status']; colors: ReturnType<typeof useColors> }) => {
  const statusConfig = {
    unread: { icon: Clock, label: 'Unread' },
    reading: { icon: BookOpen, label: 'Reading' },
    completed: { icon: CheckCircle2, label: 'Done' },
  };
  
  const config = statusConfig[status];
  const Icon = config.icon;
  const color = getStatusColor(status, colors);
  
  return (
    <View style={[styles.statusBadge, { backgroundColor: `${color}20` }]}>
      <Icon size={12} color={color} strokeWidth={2.5} />
      <Text style={[styles.statusText, { color }]}>{config.label}</Text>
    </View>
  );
};

export function LinkCard({ link, onPress }: LinkCardProps) {
  const colors = useColors();
  const [imageError, setImageError] = useState(false);
  const hasImage = Boolean(link.imageUrl) && !imageError;
  
  const gradientPalette = useMemo(() => {
    const gradients: ReadonlyArray<[string, string]> = [
      ['#667eea', '#764ba2'],
      ['#f093fb', '#f5576c'],
      ['#4facfe', '#00f2fe'],
      ['#43e97b', '#38f9d7'],
      ['#fa709a', '#fee140'],
      ['#a18cd1', '#fbc2eb'],
      ['#ff9a9e', '#fecfef'],
    ];
    const key = link.id || link.url;
    const hash = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  }, [link.id, link.url]);

  const domain = useMemo(() => {
    try {
      return new URL(link.url).hostname.replace('www.', '');
    } catch {
      return null;
    }
  }, [link.url]);

  const primaryTag = link.tags.length > 0 ? link.tags[0] : null;

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        { 
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
        pressed && styles.pressed
      ]}
      onPress={onPress}
    >
      {/* Image Section */}
      <View style={styles.imageContainer}>
        {hasImage ? (
          <Image
            source={{ uri: link.imageUrl! }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            onError={() => setImageError(true)}
            transition={200}
          />
        ) : (
          <LinearGradient
            colors={gradientPalette}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.imageOverlay}
        />
        
        {/* Status Badge on Image */}
        <View style={styles.imageTopRow}>
          <StatusBadge status={link.status} colors={colors} />
        </View>
        
        {/* Domain on Image */}
        {domain && (
          <View style={styles.domainContainer}>
            <Globe size={10} color="rgba(255,255,255,0.9)" strokeWidth={2} />
            <Text style={styles.domainText} numberOfLines={1}>{domain}</Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {link.title}
        </Text>
        
        {link.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
            {link.description}
          </Text>
        )}

        {/* Footer Row */}
        <View style={styles.footer}>
          <View style={styles.metaRow}>
            {link.estimatedReadTime && (
              <View style={[styles.metaItem, { backgroundColor: colors.backgroundSecondary }]}>
                <Clock size={11} color={colors.textTertiary} />
                <Text style={[styles.metaText, { color: colors.textTertiary }]}>
                  {link.estimatedReadTime} min
                </Text>
              </View>
            )}
            {primaryTag && (
              <View style={[styles.metaItem, { backgroundColor: colors.primaryLight }]}>
                <Tag size={11} color={colors.primary} />
                <Text style={[styles.metaText, { color: colors.primary }]}>
                  {primaryTag}
                </Text>
              </View>
            )}
            {link.tags.length > 1 && (
              <Text style={[styles.moreTags, { color: colors.textTertiary }]}>
                +{link.tags.length - 1}
              </Text>
            )}
          </View>
        </View>

        {/* Progress Bar */}
        {(link.readingProgress ?? 0) > 0 && (
          <View style={styles.progressContainer}>
            <ReadingProgressBar progress={link.readingProgress ?? 0} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  imageContainer: {
    height: 140,
    position: 'relative',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  imageTopRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  domainContainer: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  domainText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '500',
    maxWidth: 150,
  },
  content: {
    padding: 14,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  moreTags: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 8,
  },
});
