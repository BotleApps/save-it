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
import { ExternalLink, ArrowLeft, Trash2, Copy, Pencil, AlignLeft, GalleryHorizontal, MoreHorizontal, Loader2 } from 'lucide-react-native';
import { useColors } from '@/constants/colors';
import { useLinksStore } from '@/stores/links';
import { ReadingProgressBar } from '@/components/ReadingProgressBar';
import { CardsReader } from '@/components/CardsReader';
import { useToast } from '@/contexts/toast';
import * as Haptics from 'expo-haptics';

export default function LinkDetailsScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const link = useLinksStore((state) => state.getLink(id as string));
  const removeLink = useLinksStore((state) => state.removeLink);
  const updateLink = useLinksStore((state) => state.updateLink);
  const progressRef = useRef(link?.readingProgress ?? 0);
  const [currentProgress, setCurrentProgress] = useState(progressRef.current);
  const [readingMode, setReadingMode] = useState<'normal' | 'cards'>('normal');
  const [isFetchingContent, setIsFetchingContent] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!link) {
      router.replace('/');
      return;
    }

    const fetchPageContent = async () => {
      if (link.content || isFetchingContent) return;
      
      setIsFetchingContent(true);
      try {
        const response = await fetch(link.url);
        const html = await response.text();
        
        // Naive HTML to text extraction
        let text = html
          .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
          .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
          .replace(/<\/?[^>]+(>|$)/g, " ") // Replace tags with space
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/\s+/g, " ")
          .trim();
        
        if (text.length > 50) {
          updateLink(link.id, { content: text });
        }
      } catch (error) {
        console.log('Failed to fetch content:', error);
      } finally {
        setIsFetchingContent(false);
      }
    };

    fetchPageContent();
  }, [link?.id, link?.url]);

  useEffect(() => {
    if (typeof link?.readingProgress === 'number') {
      progressRef.current = link.readingProgress;
      setCurrentProgress(link.readingProgress);
    }
  }, [link?.readingProgress]);

  if (!link) return null;

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    removeLink(link.id);
    showToast({ message: 'Link deleted', type: 'success' });
    router.replace('/');
  };

  const handleCopyLink = () => {
    Clipboard.setString(link.url);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast({ message: 'Link copied to clipboard!', type: 'success' });
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

  const handleCardsProgress = useCallback(
    (progress: number) => {
      if (progress <= progressRef.current + 0.01) return;
      
      progressRef.current = progress;
      setCurrentProgress(progress);
      
      const nextStatus = progress >= 0.98 ? 'completed' : progress > 0.05 ? 'reading' : 'unread';
      updateLink(link.id, {
        readingProgress: progress,
        status: nextStatus,
      });
    },
    [link.id, updateLink]
  );

  const toggleReadingMode = () => {
    setReadingMode((prev) => (prev === 'normal' ? 'cards' : 'normal'));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const combinedContent = link.content || [link.description, link.note].filter(Boolean).join(' ');

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
              {isFetchingContent && (
                <View style={styles.headerButton}>
                  <Loader2 size={20} color={colors.textSecondary} />
                </View>
              )}
              <Pressable
                onPress={toggleReadingMode}
                style={styles.headerButton}
              >
                {readingMode === 'normal' ? (
                  <GalleryHorizontal size={22} color={colors.text} />
                ) : (
                  <AlignLeft size={22} color={colors.text} />
                )}
              </Pressable>
              <Pressable onPress={handleOpenLink} style={styles.headerButton}>
                <ExternalLink size={22} color={colors.text} />
              </Pressable>
              <Pressable
                onPress={() => setShowMoreActions(!showMoreActions)}
                style={styles.headerButton}
              >
                <MoreHorizontal size={22} color={colors.text} />
              </Pressable>
            </View>
          ),
        }}
      />
      
      {readingMode === 'cards' ? (
        <CardsReader content={combinedContent} onProgressUpdate={handleCardsProgress} />
      ) : (
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
      )}

      {showMoreActions && (
        <Pressable 
          style={styles.overlay} 
          onPress={() => setShowMoreActions(false)}
        >
          <View style={[styles.actionMenu, { backgroundColor: colors.card }]}>
            <Pressable 
              style={styles.actionItem} 
              onPress={() => { handleCopyLink(); setShowMoreActions(false); }}
            >
              <Copy size={20} color={colors.text} />
              <Text style={[styles.actionText, { color: colors.text }]}>Copy Link</Text>
            </Pressable>
            <Pressable 
              style={styles.actionItem} 
              onPress={() => { handleEditLink(); setShowMoreActions(false); }}
            >
              <Pencil size={20} color={colors.text} />
              <Text style={[styles.actionText, { color: colors.text }]}>Edit</Text>
            </Pressable>
            <View style={[styles.actionDivider, { backgroundColor: colors.border }]} />
            <Pressable 
              style={styles.actionItem} 
              onPress={() => { handleDelete(); setShowMoreActions(false); }}
            >
              <Trash2 size={20} color={colors.error} />
              <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
            </Pressable>
          </View>
        </Pressable>
      )}
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  actionMenu: {
    borderRadius: 12,
    padding: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionDivider: {
    height: 1,
    marginVertical: 4,
  },
});
