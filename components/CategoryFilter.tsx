import React from 'react';
import { View, ScrollView, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useColors } from '@/constants/colors';
import { 
  FileText, 
  Video, 
  GraduationCap, 
  Newspaper, 
  Users, 
  MoreHorizontal 
} from 'lucide-react-native';

const categories = [
  { name: 'Articles', icon: FileText },
  { name: 'Videos', icon: Video },
  { name: 'Tutorials', icon: GraduationCap },
  { name: 'News', icon: Newspaper },
  { name: 'Social', icon: Users },
  { name: 'Other', icon: MoreHorizontal },
];

interface Props {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: Props) {
  const colors = useColors();

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category.name;
          const Icon = category.icon;
          
          return (
            <Pressable
              key={category.name}
              style={({ pressed }) => [
                styles.category,
                { 
                  backgroundColor: isSelected ? colors.primary : colors.backgroundSecondary,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
                pressed && { opacity: 0.8 },
              ]}
              onPress={() =>
                onSelectCategory(selectedCategory === category.name ? null : category.name)
              }
            >
              <Icon 
                size={14} 
                color={isSelected ? '#FFFFFF' : colors.textSecondary} 
                strokeWidth={2} 
              />
              <Text
                style={[
                  styles.categoryText,
                  { color: isSelected ? '#FFFFFF' : colors.text },
                ]}
              >
                {category.name}
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
    height: 56,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
  },
});