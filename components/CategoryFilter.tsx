import React from 'react';
import { ScrollView, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

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
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {categories.map((category) => (
        <Pressable
          key={category}
          style={[
            styles.category,
            selectedCategory === category && styles.selectedCategory
          ]}
          onPress={() => onSelectCategory(
            selectedCategory === category ? null : category
          )}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category && styles.selectedCategoryText
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
    borderBottomColor: colors.border,
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
    backgroundColor: colors.card,
  },
  selectedCategory: {
    backgroundColor: colors.secondary,
  },
  categoryText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  selectedCategoryText: {
    color: colors.text,
  },
});