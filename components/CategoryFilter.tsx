import React from 'react';
import { ScrollView, Text, Pressable, StyleSheet } from 'react-native';
import { useColors } from '@/constants/colors';

const categories = [
  'Articles',
  'Videos',
  'Tutorials',
  'News',
  'Social',
  'Other'
];

interface Props {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: Props) {
  const colors = useColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.container, { borderBottomColor: colors.border }]}
      contentContainerStyle={styles.content}
    >
      {categories.map((category) => (
        <Pressable
          key={category}
          style={[
            styles.category,
            { backgroundColor: colors.card },
            selectedCategory === category && { backgroundColor: colors.secondary }
          ]}
          onPress={() => onSelectCategory(
            selectedCategory === category ? null : category
          )}
        >
          <Text
            style={[
              styles.categoryText,
              { color: colors.textSecondary },
              selectedCategory === category && { color: colors.text }
            ]}
          >
            {category}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    borderBottomWidth: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
    flexDirection: 'row',
  },
  category: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
  },
});