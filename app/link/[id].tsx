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
  Platform,
  Animated,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  ExternalLink, 
  ArrowLeft, 
  Trash2, 
  Copy, 
  Pencil, 
  AlignLeft, 
  GalleryHorizontal, 
  MoreHorizontal, 
  Loader2,
  Globe,
  Clock,
  BookOpen,
  CheckCircle,
  Tag,
  FileText,
  Share2
} from 'lucide-react-native';
import { useColors, getStatusColor } from '@/constants/colors';
import { useLinksStore } from '@/stores/links';
import { ReadingProgressBar } from '@/components/ReadingProgressBar';
import { CardsReader } from '@/components/CardsReader';
import { useToast } from '@/contexts/toast';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export default function LinkDetailsScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const link = useLinksStore((state) => state.getLink(id as string));
  const removeLink = useLinksStore((state) => state.removeLink);
  const updateLink = useLinksStore((state) => state.updateLink);
  const progressRef = useRef(link?.readingProgress ?? 0);
  const [currentProgress, setCurrentProgress] = useState(progressRef.current);
  const [readingMode, setReadingMode] = useState<'details' | 'text' | 'cards'>('details');
  const [isFetchingContent, setIsFetchingContent] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const { showToast } = useToast();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  useEffect(() => {
    if (!link) {
      router.replace('/');
      return;
    }

    const fetchPageContent = async () => {
      if (link.content || isFetchingContent) return;
      
      setIsFetchingContent(true);
      try {
        // Use Microlink.io API for better content extraction
        const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(link.url)}&data.content=true`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error('Failed to fetch from Microlink API');
        }
        
        const data = await response.json();
        
        if (data?.data?.content) {
          // Microlink returns clean article content
          const content = data.data.content;
          
          // Clean up the content
          const cleanedContent = content
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, '\n\n')
            .trim();
          
          if (cleanedContent.length > 100) {
            updateLink(link.id, { content: cleanedContent });
          }
        } else {
          // Fallback: try extracting from description or publisher metadata
          const fallbackContent = [
            data?.data?.description,
            data?.data?.publisher,
            link.description
          ].filter(Boolean).join('\n\n');
          
          if (fallbackContent.length > 50) {
            updateLink(link.id, { content: fallbackContent });
          }
        }
      } catch (error) {
        console.log('Failed to fetch content:', error);
        // Try basic fetch as last resort (will work on native, not web due to CSP)
        if (Platform.OS !== 'web') {
          try {
            const response = await fetch(link.url);
            const html = await response.text();
            
            // Extract text content from HTML
            let text = html
              .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '')
              .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, '')
              .replace(/<\/?[^>]+(>|$)/g, ' ')
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/\s+/g, ' ')
              .trim();
            
            if (text.length > 100) {
              updateLink(link.id, { content: text });
            }
          } catch (fallbackError) {
            console.log('Fallback fetch also failed:', fallbackError);
          }
        }
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

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleDelete = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    removeLink(link.id);
    showToast({ message: 'Link deleted', type: 'success' });
    router.replace('/');
  };

  const handleCopyLink = () => {
    Clipboard.setString(link.url);
    triggerHaptic();
    showToast({ message: 'Link copied!', type: 'success' });
  };

  const handleOpenLink = async () => {
    try {
      await WebBrowser.openBrowserAsync(link.url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        controlsColor: colors.primary,
      });
      triggerHaptic();
    } catch (error) {
      // Fallback to Linking if WebBrowser fails
      Linking.openURL(link.url);
    }
  };

  const handleEditLink = () => {
    router.push({
      pathname: '/new-link',
      params: { id: link.id },
    });
  };

  const displayUrl = useMemo(() => {
    try {
      const parsed = new URL(link.url);
      return parsed.hostname.replace('www.', '');
    } catch {
      return link.url;
    }
  }, [link.url]);

  const statusConfig = useMemo(() => {
    const configs = {
      unread: { label: 'Unread', icon: Clock },
      reading: { label: 'In Progress', icon: BookOpen },
      completed: { label: 'Completed', icon: CheckCircle },
    };
    return configs[link.status];
  }, [link.status]);

  const StatusIcon = statusConfig.icon;
  const statusColor = getStatusColor(link.status, colors);

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
    setReadingMode((prev) => {
      if (prev === 'details') return 'text';
      if (prev === 'text') return 'cards';
      return 'details';
    });
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleScrollBeginDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset } = event.nativeEvent;
      if (contentOffset.y < -100 && readingMode === 'details') {
        setShowSwipeHint(false);
      }
    },
    [readingMode]
  );

  const handleScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset } = event.nativeEvent;
      if (contentOffset.y < -120 && readingMode === 'details') {
        handleOpenLink();
      }
    },
    [readingMode]
  );

  const combinedContent = link.content || [link.description, link.note].filter(Boolean).join(' ');

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: '',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()} 
              style={({ pressed }) => [styles.headerButton, pressed && { opacity: 0.6 }]}
            >
              <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
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
                style={({ pressed }) => [styles.headerButton, pressed && { opacity: 0.6 }]}
              >
                {readingMode === 'details' ? (
                  <AlignLeft size={22} color={colors.text} strokeWidth={2} />
                ) : readingMode === 'text' ? (
                  <GalleryHorizontal size={22} color={colors.text} strokeWidth={2} />
                ) : (
                  <FileText size={22} color={colors.text} strokeWidth={2} />
                )}
              </Pressable>
              <Pressable 
                onPress={handleOpenLink} 
                style={({ pressed }) => [styles.headerButton, pressed && { opacity: 0.6 }]}
              >
                <ExternalLink size={22} color={colors.text} strokeWidth={2} />
              </Pressable>
              <Pressable
                onPress={() => setShowMoreActions(!showMoreActions)}
                style={({ pressed }) => [styles.headerButton, pressed && { opacity: 0.6 }]}
              >
                <MoreHorizontal size={22} color={colors.text} strokeWidth={2} />
              </Pressable>
            </View>
          ),
        }}
      />
      
      {readingMode === 'cards' ? (
        <CardsReader content={combinedContent} onProgressUpdate={handleCardsProgress} />
      ) : readingMode === 'text' ? (
        <ScrollView
          style={[styles.container, { backgroundColor: colors.card }]}
          contentContainerStyle={styles.textModeContent}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          showsVerticalScrollIndicator={true}
        >
          {/* Simple Text Reader */}
          <View style={[styles.textReaderHeader, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.textReaderTitle, { color: colors.text }]}>{link.title}</Text>
            <Pressable
              onPress={handleOpenLink}
              style={({ pressed }) => [
                styles.textReaderSource,
                { backgroundColor: colors.backgroundSecondary },
                pressed && { opacity: 0.7 }
              ]}
            >
              <Globe size={12} color={colors.textSecondary} strokeWidth={2} />
              <Text style={[styles.textReaderSourceText, { color: colors.textSecondary }]} numberOfLines={1}>
                {displayUrl}
              </Text>
              <ExternalLink size={12} color={colors.textTertiary} strokeWidth={2} />
            </Pressable>
          </View>
          
          <View style={styles.textReaderBody}>
            {link.content ? (
              <Text style={[styles.textReaderContent, { color: colors.text }]}>
                {link.content}
              </Text>
            ) : link.description ? (
              <>
                <Text style={[styles.textReaderContent, { color: colors.text }]}>
                  {link.description}
                </Text>
                {isFetchingContent && (
                  <View style={styles.loadingContainer}>
                    <Loader2 size={20} color={colors.textSecondary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                      Loading full content...
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.noContentContainer}>
                <FileText size={48} color={colors.textTertiary} strokeWidth={1.5} />
                <Text style={[styles.noContentText, { color: colors.textSecondary }]}>
                  No content available
                </Text>
                <Text style={[styles.noContentHint, { color: colors.textTertiary }]}>
                  Tap the link above to visit the source
                </Text>
              </View>
            )}
          </View>
          
          <View style={[styles.textReaderProgress, { backgroundColor: colors.backgroundSecondary }]}>
            <ReadingProgressBar progress={currentProgress} variant="large" />
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          bounces={true}
          showsVerticalScrollIndicator={false}
        >
          {/* Pull to open hint */}
          {showSwipeHint && (
            <View style={[styles.pullHintContainer, { opacity: 0.6 }]}>
              <View style={[styles.pullHint, { backgroundColor: colors.textTertiary }]} />
              <Text style={[styles.pullHintText, { color: colors.textSecondary }]}>
                Pull down to open in browser
              </Text>
            </View>
          )}
          {/* Hero Image */}
          {link.imageUrl && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: link.imageUrl }}
                style={styles.image}
                contentFit="cover"
                transition={200}
              />
              <LinearGradient
                colors={['transparent', colors.background]}
                style={styles.imageGradient}
              />
            </View>
          )}

          <View style={styles.content}>
            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
              <StatusIcon size={14} color={statusColor} strokeWidth={2.5} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusConfig.label}
              </Text>
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: colors.text }]}>{link.title}</Text>
            
            {/* Source */}
            <Pressable 
              onPress={handleOpenLink}
              style={({ pressed }) => [
                styles.sourceRow,
                { backgroundColor: colors.backgroundSecondary },
                pressed && { opacity: 0.8 }
              ]}
            >
              <Globe size={14} color={colors.textSecondary} strokeWidth={2} />
              <Text style={[styles.sourceText, { color: colors.textSecondary }]} numberOfLines={1}>
                {displayUrl}
              </Text>
              <ExternalLink size={14} color={colors.textTertiary} strokeWidth={2} />
            </Pressable>

            {/* Progress */}
            <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ReadingProgressBar progress={currentProgress} variant="large" />
            </View>
            
            {/* Description */}
            {link.description && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <FileText size={16} color={colors.primary} strokeWidth={2} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
                </View>
                <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                  {link.description}
                </Text>
              </View>
            )}
            
            {/* Note */}
            {link.note && (
              <View style={[styles.noteCard, { backgroundColor: colors.primaryLight, borderColor: colors.primaryMuted }]}>
                <Text style={[styles.noteLabel, { color: colors.primary }]}>Your note</Text>
                <Text style={[styles.noteText, { color: colors.text }]}>
                  {link.note}
                </Text>
              </View>
            )}

            {/* Tags */}
            {link.tags.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Tag size={16} color={colors.primary} strokeWidth={2} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Tags</Text>
                </View>
                <View style={styles.tagsContainer}>
                  {link.tags.map((tag) => (
                    <View 
                      key={tag} 
                      style={[styles.tag, { backgroundColor: colors.backgroundSecondary }]}
                    >
                      <Text style={[styles.tagText, { color: colors.text }]}>
                        #{tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Action Menu Overlay */}
      {showMoreActions && (
        <Pressable 
          style={[styles.overlay, { backgroundColor: colors.overlay }]} 
          onPress={() => setShowMoreActions(false)}
        >
          <View style={[styles.actionMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable 
              style={({ pressed }) => [styles.actionItem, pressed && { backgroundColor: colors.cardPressed }]} 
              onPress={() => { handleCopyLink(); setShowMoreActions(false); }}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: colors.infoLight }]}>
                <Copy size={18} color={colors.info} strokeWidth={2} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>Copy Link</Text>
            </Pressable>
            
            <Pressable 
              style={({ pressed }) => [styles.actionItem, pressed && { backgroundColor: colors.cardPressed }]} 
              onPress={() => { handleEditLink(); setShowMoreActions(false); }}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: colors.primaryLight }]}>
                <Pencil size={18} color={colors.primary} strokeWidth={2} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>Edit</Text>
            </Pressable>
            
            <View style={[styles.actionDivider, { backgroundColor: colors.divider }]} />
            
            <Pressable 
              style={({ pressed }) => [styles.actionItem, pressed && { backgroundColor: colors.cardPressed }]} 
              onPress={() => { handleDelete(); setShowMoreActions(false); }}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: colors.errorLight }]}>
                <Trash2 size={18} color={colors.error} strokeWidth={2} />
              </View>
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
    paddingBottom: 60,
  },
  headerButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    height: 220,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  sourceText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  progressCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
  },
  noteCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noteText: {
    fontSize: 15,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  pullHintContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  pullHint: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  pullHintText: {
    fontSize: 12,
    fontWeight: '500',
  },
  textModeContent: {
    paddingBottom: 40,
  },
  textReaderHeader: {
    padding: 20,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  textReaderTitle: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
  },
  textReaderSource: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  textReaderSourceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  textReaderBody: {
    padding: 20,
    paddingTop: 24,
    gap: 20,
  },
  textReaderContent: {
    fontSize: 17,
    lineHeight: 28,
    letterSpacing: 0.2,
  },
  textReaderProgress: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  noContentContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  noContentText: {
    fontSize: 16,
    fontWeight: '600',
  },
  noContentHint: {
    fontSize: 14,
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 100 : 60,
    paddingRight: 16,
  },
  actionMenu: {
    borderRadius: 16,
    padding: 8,
    minWidth: 200,
    borderWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderRadius: 10,
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
    marginHorizontal: 8,
  },
});
