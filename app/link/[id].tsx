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
import WebView from 'react-native-webview';
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

// Content extraction script for WebView
const EXTRACTION_SCRIPT = `
  // Wait for content with better retry logic
  function waitForContent(attempt = 0) {
    if (attempt > 15) {
      console.log('[JS] Max retries (15) reached, extracting what we have');
      extractAndSend();
      return;
    }
    
    const article = document.querySelector('article') || 
                   document.querySelector('[role="main"]') || 
                   document.querySelector('main') ||
                   document.querySelector('.post-content') ||
                   document.querySelector('.article-content') ||
                   document.querySelector('.entry-content') ||
                   document.querySelector('.content') ||
                   document.querySelector('[class*="article"]') ||
                   document.querySelector('[data-testid="storyBody"]') ||
                   document.body;
    
    const textElements = article.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
    console.log('[JS] Attempt', attempt + 1, '- found', textElements.length, 'text elements');
    
    if (textElements.length >= 3) {
      console.log('[JS] Found sufficient content, extracting...');
      extractAndSend();
    } else {
      setTimeout(() => waitForContent(attempt + 1), 1000);
    }
  }
  
  function extractAndSend() {
    const article = document.querySelector('article') || 
                   document.querySelector('[role="main"]') || 
                   document.querySelector('main') ||
                   document.querySelector('.post-content') ||
                   document.querySelector('.article-content') ||
                   document.querySelector('.entry-content') ||
                   document.querySelector('.content') ||
                   document.querySelector('[class*="article"]') ||
                   document.body;
    
    const clone = article.cloneNode(true);
    
    // Remove unwanted elements
    const selectorsToRemove = [
      'script', 'style', 'nav', 'header', 'footer', 'aside', 
      'iframe', 'noscript', 'button', 'form',
      '[class*="ad"]', '[class*="advertisement"]', '[class*="sidebar"]',
      '[class*="related"]', '[class*="comment"]', '[class*="share"]'
    ];
    
    selectorsToRemove.forEach(selector => {
      try {
        clone.querySelectorAll(selector).forEach(el => el.remove());
      } catch (e) {}
    });
    
    // Extract paragraphs
    const paragraphs = [];
    const textNodes = clone.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote');
    
    textNodes.forEach(node => {
      const text = node.textContent.trim();
      if (text.length > 20) {
        paragraphs.push(text);
      }
    });
    
    console.log('[JS] Extracted', paragraphs.length, 'paragraphs');
    
    if (paragraphs.length === 0) {
      // Fallback: get all visible text
      const fallback = article.innerText.trim();
      if (fallback.length > 100) {
        window.ReactNativeWebView.postMessage(fallback);
        return;
      }
    }
    
    const content = paragraphs.join('\\n\\n');
    console.log('[JS] Final content length:', content.length);
    
    if (content.length > 50) {
      window.ReactNativeWebView.postMessage(content);
    } else {
      window.ReactNativeWebView.postMessage('EXTRACTION_FAILED');
    }
  }
  
  // Start extraction
  waitForContent();
`;

export default function LinkDetailsScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const link = useLinksStore((state) => state.getLink(id as string));
  const removeLink = useLinksStore((state) => state.removeLink);
  const updateLink = useLinksStore((state) => state.updateLink);
  const { showToast } = useToast();
  const progressRef = useRef(link?.readingProgress ?? 0);
  const [currentProgress, setCurrentProgress] = useState(progressRef.current);
  const [readingMode, setReadingMode] = useState<'details' | 'text' | 'cards'>('details');
  const [isFetchingContent, setIsFetchingContent] = useState(false);
  const [userInitiatedFetch, setUserInitiatedFetch] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  // Auto-clear loading state after 60 seconds (failsafe) - increased timeout
  useEffect(() => {
    if (isFetchingContent) {
      console.log('[WebView] Starting 60-second timeout for content extraction');
      fetchTimeoutRef.current = setTimeout(() => {
        console.log('[WebView] Timeout reached, clearing loading state');
        setIsFetchingContent(false);
        setUserInitiatedFetch(false);
        showToast({ message: 'Content extraction timed out', type: 'error' });
      }, 60000);
    }
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [isFetchingContent, showToast]);

  useEffect(() => {
    if (!link) {
      router.replace('/');
      return;
    }

    // Content will be fetched via WebView when user opens details
    // See the hidden WebView component below
  }, [link?.id]);

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

  const retryContentFetch = useCallback(() => {
    console.log('[UI] Manual content fetch triggered');
    setUserInitiatedFetch(true);
    setIsFetchingContent(true);
    showToast({ message: 'Fetching article content...', type: 'success' });
  }, [showToast]);

  const handleStartReading = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    console.log('[UI] Start Reading button clicked');
    setUserInitiatedFetch(true);
    setIsFetchingContent(true);
    setReadingMode('text');
    showToast({ message: 'Extracting article content...', type: 'success' });
  }, [showToast]);

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

  const handleDescriptionPress = useCallback(() => {
    console.log('[UI] Description pressed - switching to text mode');
    setReadingMode('text');
  }, [setReadingMode]);

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

  const handleWebViewMessage = useCallback(
    (event: any) => {
      try {
        const extractedText = event.nativeEvent.data;
        console.log('[WebView] Received message from JavaScript:', {
          length: extractedText?.length,
          contentPreview: extractedText?.substring(0, 150),
        });
        
        if (extractedText === 'EXTRACTION_FAILED') {
          console.log('[WebView] Extraction explicitly failed');
          setIsFetchingContent(false);
          setUserInitiatedFetch(false);
          showToast({ message: 'Could not extract article content', type: 'error' });
          return;
        }
        
        if (extractedText && extractedText.length > 50) {
          console.log('[WebView] Content length valid, cleaning and storing...');
          // Clean and format the content - preserve paragraphs
          const cleanedContent = extractedText
            .split('\n\n')
            .map((para: string) => para.replace(/\s+/g, ' ').trim())
            .filter((para: string) => para.length > 20)
            .join('\n\n')
            .trim();
          
          console.log('[WebView] Cleaned content length:', cleanedContent.length);
          console.log('[WebView] Saving to link.content...');
          updateLink(link.id, { content: cleanedContent });
          setIsFetchingContent(false);
          setUserInitiatedFetch(false);
          showToast({ message: 'Article content loaded successfully!', type: 'success' });
          console.log('[WebView] Content saved successfully');
        } else {
          console.log('[WebView] Content too short, not saving:', {
            length: extractedText?.length,
          });
          setIsFetchingContent(false);
          setUserInitiatedFetch(false);
          showToast({ message: 'Article too short or empty', type: 'error' });
        }
      } catch (error) {
        console.error('[WebView] Failed to process message:', error);
        setIsFetchingContent(false);
        setUserInitiatedFetch(false);
        showToast({ message: 'Error extracting content', type: 'error' });
      }
    },
    [link?.id, updateLink, showToast]
  );

  const handleWebViewLoad = useCallback(() => {
    console.log('[WebView] Page started loading...');
  }, []);

  const handleWebViewLoadEnd = useCallback(() => {
    console.log('[WebView] Page finished loading, waiting 2 seconds for dynamic content...');
    // Give dynamic content time to render, then inject extraction script
    setTimeout(() => {
      console.log('[WebView] Injecting content extraction script...');
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          (function() {
            console.log('[JS] Starting content extraction...');
            ${EXTRACTION_SCRIPT}
          })();
          true;
        `);
      }
    }, 2000);
  }, []);

  const handleWebViewError = useCallback((error: any) => {
    console.error('[WebView] Failed to load page:', {
      code: error.code,
      description: error.description,
      url: link?.url,
    });
    setIsFetchingContent(false);
  }, [link?.url]);

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
            ) : isFetchingContent ? (
              <View style={styles.loadingContainer}>
                <Loader2 size={24} color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.text }]}>
                  Extracting full article content...
                </Text>
                <Text style={[styles.loadingHint, { color: colors.textSecondary }]}>
                  This may take a few seconds
                </Text>
              </View>
            ) : link.description ? (
              <View style={styles.descriptionFallback}>
                <View style={[styles.infoBox, { backgroundColor: colors.warningLight, borderColor: colors.warning }]}>
                  <FileText size={16} color={colors.warning} strokeWidth={2} />
                  <Text style={[styles.infoText, { color: colors.text }]}>
                    Showing preview text. Full content extraction failed.
                  </Text>
                </View>
                <Text style={[styles.textReaderContent, { color: colors.text }]}>
                  {link.description}
                </Text>
                {Platform.OS !== 'web' && (
                  <Pressable
                    onPress={retryContentFetch}
                    style={({ pressed }) => [
                      styles.retryButton,
                      { backgroundColor: colors.primary },
                      pressed && { opacity: 0.8 }
                    ]}
                  >
                    <Text style={[styles.retryButtonText, { color: colors.textOnPrimary }]}>
                      Try fetching full content again
                    </Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <View style={styles.noContentContainer}>
                <FileText size={48} color={colors.textTertiary} strokeWidth={1.5} />
                <Text style={[styles.noContentText, { color: colors.textSecondary }]}>
                  No content available
                </Text>
                <Text style={[styles.noContentHint, { color: colors.textTertiary }]}>
                  Tap the link above to visit the source
                </Text>
                {Platform.OS !== 'web' && (
                  <Pressable
                    onPress={retryContentFetch}
                    style={({ pressed }) => [
                      styles.retryButton,
                      { backgroundColor: colors.primary },
                      pressed && { opacity: 0.8 }
                    ]}
                  >
                    <Text style={[styles.retryButtonText, { color: colors.textOnPrimary }]}>
                      Try fetching content
                    </Text>
                  </Pressable>
                )}
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
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Preview</Text>
                </View>
                <Text 
                  style={[styles.bodyText, { color: colors.textSecondary }]}
                  numberOfLines={4}
                >
                  {link.description}
                </Text>
              </View>
            )}

            {/* Start Reading CTA - Only show if no content yet */}
            {!link.content && !isFetchingContent && (
              <Pressable
                onPress={handleStartReading}
                style={({ pressed }) => [
                  styles.startReadingButton,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }
                ]}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark || colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.startReadingGradient}
                >
                  <BookOpen size={22} color={colors.textOnPrimary} strokeWidth={2.5} />
                  <Text style={[styles.startReadingText, { color: colors.textOnPrimary }]}>
                    Start Reading
                  </Text>
                  <Text style={[styles.startReadingHint, { color: `${colors.textOnPrimary}CC` }]}>
                    Extract full article content
                  </Text>
                </LinearGradient>
              </Pressable>
            )}

            {/* Loading content indicator */}
            {isFetchingContent && (
              <View style={[styles.fetchingCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
                <Loader2 size={24} color={colors.primary} />
                <View style={styles.fetchingTextContainer}>
                  <Text style={[styles.fetchingTitle, { color: colors.text }]}>
                    Extracting content...
                  </Text>
                  <Text style={[styles.fetchingSubtitle, { color: colors.textSecondary }]}>
                    This may take a few seconds
                  </Text>
                </View>
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
                      <Text style={[styles.tagText, { color: colors.text }]}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Hidden WebView for content extraction - Native only */}
      {!link.content && Platform.OS !== 'web' && userInitiatedFetch && isFetchingContent && (
        <View style={{ height: 0, width: 0, overflow: 'hidden' }}>
          <WebView
            ref={webViewRef}
            key={`webview-${link.id}-${Date.now()}`}
            source={{ uri: link.url }}
            onMessage={handleWebViewMessage}
            onLoadStart={handleWebViewLoad}
            onLoadEnd={handleWebViewLoadEnd}
            onError={handleWebViewError}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scalesPageToFit={true}
          />
        </View>
      )}

      {/* Web platform message - content extraction not available */}
      {!link.content && Platform.OS === 'web' && userInitiatedFetch && isFetchingContent && (
        <View style={{ height: 0 }}>
          {(() => {
            // Auto-dismiss on web since WebView doesn't work
            setTimeout(() => {
              setIsFetchingContent(false);
              setUserInitiatedFetch(false);
              showToast({ 
                message: 'Content extraction only available on mobile app', 
                type: 'error' 
              });
            }, 100);
            return null;
          })()}
        </View>
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
  startReadingButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  startReadingGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 8,
  },
  startReadingText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  startReadingHint: {
    fontSize: 13,
    fontWeight: '500',
  },
  fetchingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  fetchingTextContainer: {
    flex: 1,
    gap: 4,
  },
  fetchingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  fetchingSubtitle: {
    fontSize: 14,
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textDecorationLine: 'underline',
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingHint: {
    fontSize: 14,
  },
  descriptionFallback: {
    gap: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
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
