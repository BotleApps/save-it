import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useColors } from '@/constants/colors';

type Filter = 'all' | 'unread' | 'reading' | 'completed';

interface Props {
  currentFilter: Filter;
  onFilterChange: (filter: Filter) => void;
}

export function FilterBar({ currentFilter, onFilterChange }: Props) {
  const colors = useColors();
  const filters: Array<{ id: Filter; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'reading', label: 'Reading' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <View style={[styles.wrapper, { borderBottomColor: colors.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {filters.map(filter => (
          <Pressable
            key={filter.id}
            style={[
              styles.filterButton,
              { backgroundColor: colors.card },
              currentFilter === filter.id && { backgroundColor: colors.primary }
            ]}
            onPress={() => onFilterChange(filter.id)}
          >
            <Text
              style={[
                styles.filterText,
                { color: colors.textSecondary },
                currentFilter === filter.id && { color: colors.text }
              ]}
            >
              {filter.label}
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
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    height: 36,
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
});