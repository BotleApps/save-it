import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useColors } from '@/constants/colors';
import { Clock, BookOpen, CheckCircle, Layers } from 'lucide-react-native';

type Filter = 'all' | 'unread' | 'reading' | 'completed';

interface Props {
  currentFilter: Filter;
  onFilterChange: (filter: Filter) => void;
}

const filterConfig = {
  all: { label: 'All', icon: Layers },
  unread: { label: 'Unread', icon: Clock },
  reading: { label: 'Reading', icon: BookOpen },
  completed: { label: 'Done', icon: CheckCircle },
} as const;

export function FilterBar({ currentFilter, onFilterChange }: Props) {
  const colors = useColors();

  return (
    <View style={[styles.wrapper, { borderBottomColor: colors.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {(Object.entries(filterConfig) as [Filter, typeof filterConfig[Filter]][]).map(([id, config]) => {
          const isActive = currentFilter === id;
          const Icon = config.icon;
          
          return (
            <Pressable
              key={id}
              style={({ pressed }) => [
                styles.filterButton,
                { 
                  backgroundColor: isActive ? colors.primary : colors.backgroundSecondary,
                  borderColor: isActive ? colors.primary : colors.border,
                },
                pressed && !isActive && { backgroundColor: colors.backgroundTertiary }
              ]}
              onPress={() => onFilterChange(id)}
            >
              <Icon 
                size={14} 
                color={isActive ? colors.textOnPrimary : colors.textSecondary}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <Text
                style={[
                  styles.filterText,
                  { color: isActive ? colors.textOnPrimary : colors.textSecondary },
                  isActive && styles.filterTextActive
                ]}
              >
                {config.label}
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
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  filterTextActive: {
    fontWeight: '600',
  },
});