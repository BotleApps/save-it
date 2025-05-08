import React from 'react';
import { ScrollView, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { useLinksStore } from '@/stores/links';

interface Props {
  selectedTags: string[];
  onSelectTags: (tags: string[]) => void;
}

export function TagFilter({ selectedTags, onSelectTags }: Props) {
  const links = useLinksStore((state) => state.links);
  
  // Get unique tags from all links
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
            selectedTags.includes(tag) && styles.selectedTag
          ]}
          onPress={() => toggleTag(tag)}
        >
          <Text
            style={[
              styles.tagText,
              selectedTags.includes(tag) && styles.selectedTagText
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
    backgroundColor: colors.card,
  },
  selectedTag: {
    backgroundColor: colors.secondary,
  },
  tagText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  selectedTagText: {
    color: colors.text,
  },
});