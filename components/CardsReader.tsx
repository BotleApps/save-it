import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, LayoutChangeEvent, ViewToken, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors, useTheme } from '@/constants/colors';
import { ChevronDown, Book } from 'lucide-react-native';

interface CardsReaderProps {
  content: string;
  onProgressUpdate?: (progress: number) => void;
}

export function CardsReader({ content, onProgressUpdate }: CardsReaderProps) {
  const colors = useColors();
  const theme = useTheme();
  const [containerHeight, setContainerHeight] = useState(0);
  const [currentCard, setCurrentCard] = useState(0);
  
  const cards = useMemo(() => {
    if (!content) return ['No content available to read.'];
    
    const sentences = content.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g) || [content];
    
    const chunks: string[] = [];
    let currentChunk = '';
    let count = 0;

    sentences.forEach((sentence) => {
      const trimmed = sentence.trim();
      if (!trimmed) return;

      if (count < 2) {
        currentChunk += (currentChunk ? ' ' : '') + trimmed;
        count++;
      } else {
        chunks.push(currentChunk);
        currentChunk = trimmed;
        count = 1;
      }
    });

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }, [content]);

  const cardGradients: ReadonlyArray<readonly [string, string]> = useMemo(() => [
    ['#6366f1', '#8b5cf6'],
    ['#ec4899', '#f43f5e'],
    ['#06b6d4', '#14b8a6'],
    ['#22c55e', '#10b981'],
    ['#f59e0b', '#f97316'],
    ['#8b5cf6', '#a855f7'],
    ['#ef4444', '#ec4899'],
    ['#3b82f6', '#6366f1'],
  ], []);

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerHeight(e.nativeEvent.layout.height);
  };

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        const index = viewableItems[0].index;
        setCurrentCard(index);
        
        if (onProgressUpdate && cards.length > 0) {
          const progress = Math.min(1, (index + 1) / cards.length);
          onProgressUpdate(progress);
        }
      }
    },
    [cards.length, onProgressUpdate]
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const isLastCard = currentCard === cards.length - 1;
  const isFirstCard = currentCard === 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} onLayout={handleLayout}>
      {containerHeight > 0 && (
        <>
          <FlatList
            data={cards}
            keyExtractor={(_, index) => index.toString()}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            renderItem={({ item, index }) => (
              <View style={[styles.card, { height: containerHeight }]}>
                <LinearGradient
                  colors={cardGradients[index % cardGradients.length] as [string, string]}
                  style={[
                    styles.cardGradient,
                    { opacity: theme === 'dark' ? 0.12 : 0.08 },
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <View style={styles.cardContent}>
                  <Text
                    style={[
                      styles.text,
                      {
                        color: theme === 'dark' ? colors.textOnPrimary : colors.text,
                          textShadowColor: theme === 'dark' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.9)',
                          textShadowOffset: theme === 'dark' ? { width: 0, height: 1 } : { width: 0, height: 0 },
                          textShadowRadius: theme === 'dark' ? 4 : 0,
                      },
                    ]}
                  >
                    {item}
                  </Text>
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 0 }}
          />
          
          {/* Progress indicator */}
          <View style={[styles.progressContainer, { backgroundColor: colors.card }]}>
            <View style={styles.progressInner}>
              <View style={styles.progressInfo}>
                <Book size={16} color={colors.primary} strokeWidth={2} />
                <Text style={[styles.pageNumber, { color: colors.text }]}>
                  {currentCard + 1} of {cards.length}
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: colors.backgroundSecondary }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: colors.primary,
                      width: `${((currentCard + 1) / cards.length) * 100}%` 
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
          
          {/* Swipe hint */}
          {isFirstCard && (
            <View style={styles.swipeHint}>
              <ChevronDown size={24} color={theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(26,29,33,0.6)'} strokeWidth={2} />
              <Text style={[styles.swipeHintText, { color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(26,29,33,0.6)' }]}>Swipe to continue</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
  },
  cardContent: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    zIndex: 1,
  },
  text: {
    fontSize: 24,
    lineHeight: 38,
    textAlign: 'center',
    fontWeight: '500',
    // Color and shadow are applied inline based on theme for correct contrast
  },
  progressContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 24,
    left: 20,
    right: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  progressInner: {
    padding: 16,
    gap: 10,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  swipeHint: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 130 : 110,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 4,
  },
  swipeHintText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
});
