import React from 'react';
import { ScrollView, Text, Pressable, StyleSheet } from 'react-native';
import { useColors } from '@/constants/colors';
import { useLinksStore } from '@/stores/links';

interface Props {
  selectedTags: string[];
  onSelectTags: (tags: string[]) => void;
}

export function TagFilter({ selectedTags, onSelectTags }: Props) {
  const colors = useColors();
  const links = useLinksStore((state) => state.links);
  
  const allTags = Array.from(
    new Set(links.flatMap(link => link.tags))
  ).sort();

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onSelectTags(selectedTags.filter(t => t !== tag));
    } else {
      onSelectTags([...selectedTags, tag]);
    }
  };

  if (allTags.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {allTags.map((tag) => (
        <Pressable
          key={tag}
          style={[
            styles.tag,
            { backgroundColor: colors.card },
            selectedTags.includes(tag) && { backgroundColor: colors.secondary }
          ]}
          onPress={() => toggleTag(tag)}
        >
          <Text
            style={[
              styles.tagText,
              { color: colors.textSecondary },
              selectedTags.includes(tag) && { color: colors.text }
            ]}
          >
            #{tag}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
    flexDirection: 'row',
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