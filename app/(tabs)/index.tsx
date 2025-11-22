import { useState } from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { LinkCard } from '@/components/LinkCard';
import { FilterBar } from '@/components/FilterBar';
import { SearchBar } from '@/components/SearchBar';
import { useLinksStore } from '@/stores/links';
import { useColors } from '@/constants/colors';
import { FloatingButton } from '@/components/FloatingButton';
import { CategoryFilter } from '@/components/CategoryFilter';
import { TagFilter } from '@/components/TagFilter';

type Filter = 'all' | 'unread' | 'reading' | 'completed';

export default function LinksScreen() {
  const colors = useColors();
  const router = useRouter();
  const links = useLinksStore((state) => state.links);
  const [currentFilter, setCurrentFilter] = useState<Filter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const filteredLinks = links.filter(link => {
    const matchesFilter = currentFilter === 'all' || link.status === currentFilter;
    const matchesSearch = searchQuery === '' || 
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => link.tags.includes(tag));
    const matchesCategory = !selectedCategory || link.category === selectedCategory;

    return matchesFilter && matchesSearch && matchesTags && matchesCategory;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <FilterBar
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
      />

      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <TagFilter
        selectedTags={selectedTags}
        onSelectTags={setSelectedTags}
      />
      
      <FlatList
        data={filteredLinks}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <LinkCard
              link={item}
              onPress={() => router.push(`/link/${item.id}`)}
            />
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No links yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Save your first link to see it here.</Text>
          </View>
        )}
      />

      <FloatingButton
        icon={<Plus size={24} color={colors.text} />}
        onPress={() => router.push('../../new-link')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  column: {
    gap: 16,
  },
  cardWrapper: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
  },
});
