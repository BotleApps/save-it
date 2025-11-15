import React from 'react';
import { View, ScrollView, Text, Pressable, StyleSheet } from 'react-native';
import { useColors } from '@/constants/colors';

const categories = [
  'Articles',
  'Videos',
  'Tutorials',
  'News',
  'Social',
  'Other',
];

interface Props {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: Props) {
  const colors = useColors();

  return (
    <View style={[styles.wrapper, { borderBottomColor: colors.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {categories.map((category) => (
          <Pressable
            key={category}
            style={[
              styles.category,
              { backgroundColor: colors.card },
              selectedCategory === category && { backgroundColor: colors.secondary },
            ]}
            onPress={() =>
              onSelectCategory(selectedCategory === category ? null : category)
            }
          >
            <Text
              style={[
                styles.categoryText,
                { color: colors.textSecondary },
                selectedCategory === category && { color: colors.text },
              ]}
            >
              {category}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 52,
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    minHeight: 32,
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 14,
  },
});