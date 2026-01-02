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
} from 'react-native';
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
        
        let text = html
          .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
          .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
          .replace(/<\/?[^>]+(>|$)/g, " ")
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

  const handleOpenLink = () => {
    Linking.openURL(link.url);
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
    setReadingMode((prev) => (prev === 'normal' ? 'cards' : 'normal'));
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

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
                {readingMode === 'normal' ? (
                  <GalleryHorizontal size={22} color={colors.text} strokeWidth={2} />
                ) : (
                  <AlignLeft size={22} color={colors.text} strokeWidth={2} />
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
      ) : (
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          showsVerticalScrollIndicator={false}
        >
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
