import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Clipboard,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ExternalLink, ArrowLeft, Trash2, Copy, Pencil } from 'lucide-react-native';
import { useColors } from '@/constants/colors';
import { useLinksStore } from '@/stores/links';
import { ReadingProgressBar } from '@/components/ReadingProgressBar';

export default function LinkDetailsScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const link = useLinksStore((state) => state.getLink(id as string));
  const removeLink = useLinksStore((state) => state.removeLink);
  const updateLink = useLinksStore((state) => state.updateLink);
  const progressRef = useRef(link?.readingProgress ?? 0);
  const [currentProgress, setCurrentProgress] = useState(progressRef.current);

  useEffect(() => {
    if (!link) {
      router.replace('/');
    }
  }, [link, router]);

  useEffect(() => {
    if (typeof link?.readingProgress === 'number') {
      progressRef.current = link.readingProgress;
      setCurrentProgress(link.readingProgress);
    }
  }, [link?.readingProgress]);

  if (!link) return null;

  const handleDelete = () => {
    removeLink(link.id);
    router.replace('/');
  };

  const handleCopyLink = () => {
    Clipboard.setString(link.url);
  };

  const handleOpenLink = () => {
    Linking.openURL(link.url);
  };

  const handleEditLink = () => {
    router.push({
      pathname: '/new-link',
      params: { id: link.id },
    });
  };

  const displayUrl = (() => {
    try {
      const parsed = new URL(link.url);
      const path = parsed.pathname === '/' ? '' : parsed.pathname;
      return `${parsed.hostname}${path}`;
    } catch {
      return link.url;
    }
  })();

  const statusLabel = useMemo(() => {
    switch (link.status) {
      case 'reading':
        return 'In progress';
      case 'completed':
        return 'Completed';
      default:
        return 'Queued';
    }
  }, [link.status]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      if (!contentSize || contentSize.height <= 0) {
        return;
      }
      const viewportBottom = contentOffset.y + layoutMeasurement.height;
      const rawProgress = viewportBottom / contentSize.height;
      const clamped = Math.min(1, Math.max(0, rawProgress));

      if (clamped <= progressRef.current + 0.015) {
        return;
      }

      progressRef.current = clamped;
      setCurrentProgress(clamped);

      const nextStatus = clamped >= 0.98 ? 'completed' : clamped > 0.05 ? 'reading' : 'unread';
      updateLink(link.id, {
        readingProgress: clamped,
        status: nextStatus,
      });
    },
    [link.id, updateLink]
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: '',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={colors.text} />
            </Pressable>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <Pressable onPress={handleOpenLink} style={styles.headerButton}>
                <ExternalLink size={22} color={colors.text} />
              </Pressable>
              <Pressable onPress={handleCopyLink} style={styles.headerButton}>
                <Copy size={22} color={colors.text} />
              </Pressable>
              <Pressable onPress={handleEditLink} style={styles.headerButton}>
                <Pencil size={22} color={colors.text} />
              </Pressable>
              <Pressable onPress={handleDelete} style={styles.headerButton}>
                <Trash2 size={22} color={colors.error} />
              </Pressable>
            </View>
          ),
        }}
      />
      
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        {link.imageUrl && (
          <Image
            source={{ uri: link.imageUrl }}
            style={styles.image}
            contentFit="cover"
          />
        )}

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>{link.title}</Text>
          <View style={styles.progressHeader}>
            <View style={[styles.statusBadge, { backgroundColor: colors.cardHover }]}> 
              <Text style={[styles.statusText, { color: colors.text }]}>{statusLabel}</Text>
            </View>
            <ReadingProgressBar progress={currentProgress} variant="large" />
          </View>
          
          {(link.description || link.note) && (
            <>
              {link.description && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
                  <Text style={[styles.description, { color: colors.textSecondary }]}>
                    {link.description}
                  </Text>
                </View>
              )}
              
              {link.note && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Note</Text>
                  <Text style={[styles.description, { color: colors.textSecondary }]}>
                    {link.note}
                  </Text>
                </View>
              )}
            </>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Link</Text>
            <Pressable onPress={handleOpenLink} style={[styles.urlPill, { borderColor: colors.border }]}> 
              <Text
                style={[styles.urlText, { color: colors.primary }]}
                numberOfLines={2}
              >
                {displayUrl}
              </Text>
            </Pressable>
          </View>

          {link.tags.length > 0 && (
            <View style={styles.tags}>
              {link.tags.map((tag) => (
                <View 
                  key={tag} 
                  style={[styles.tag, { backgroundColor: colors.cardHover }]}
                >
                  <Text style={[styles.tagText, { color: colors.text }]}>
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  headerButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  progressHeader: {
    marginBottom: 24,
    gap: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  urlPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  urlText: {
    fontSize: 15,
    fontWeight: '500',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
  },
});
