import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, LayoutChangeEvent, ViewToken } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/constants/colors';

interface CardsReaderProps {
  content: string;
  onProgressUpdate?: (progress: number) => void;
}

export function CardsReader({ content, onProgressUpdate }: CardsReaderProps) {
  const colors = useColors();
  const [containerHeight, setContainerHeight] = useState(0);
  const [currentCard, setCurrentCard] = useState(0);
  
  const cards = useMemo(() => {
    if (!content) return ['No content available to read.'];
    
    // Split by sentence endings (. ! ?)
    // This regex matches a sentence ending with punctuation, or the end of the string
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
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#a18cd1', '#fbc2eb'],
    ['#ff9a9e', '#fecfef'],
    ['#667eea', '#764ba2'],
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} onLayout={handleLayout}>
      {containerHeight > 0 && (
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
                colors={cardGradients[index % cardGradients.length]}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.cardContent}>
                <Text style={[styles.text, { color: colors.text }]}>
                  {item}
                </Text>
                <Text style={[styles.pageNumber, { color: colors.textSecondary }]}>
                  {index + 1} / {cards.length}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 0 }}
        />
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
    padding: 32,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  cardContent: {
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  text: {
    fontSize: 26,
    lineHeight: 38,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 24,
  },
  pageNumber: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.6,
  },
});
