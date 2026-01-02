import React from 'react';
import { ScrollView, Text, Pressable, StyleSheet, View, Platform } from 'react-native';
import { useColors } from '@/constants/colors';
import { useLinksStore } from '@/stores/links';
import { Hash, X } from 'lucide-react-native';

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
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {allTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          
          return (
            <Pressable
              key={tag}
              style={({ pressed }) => [
                styles.tag,
                { 
                  backgroundColor: isSelected ? colors.primary : colors.backgroundSecondary,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => toggleTag(tag)}
            >
              {isSelected ? (
                <X size={12} color="#FFFFFF" strokeWidth={2.5} />
              ) : (
                <Hash size={12} color={colors.textSecondary} strokeWidth={2.5} />
              )}
              <Text
                style={[
                  styles.tagText,
                  { color: isSelected ? '#FFFFFF' : colors.text },
                ]}
              >
                {tag}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 52,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
  },
});