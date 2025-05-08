import { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { LinkCard } from '@/components/LinkCard';
import { FilterBar } from '@/components/FilterBar';
import { SearchBar } from '@/components/SearchBar';
import { AddLinkModal } from '@/components/AddLinkModal';
import { useLinksStore } from '@/stores/links';
import { colors } from '@/constants/colors';
import { FloatingButton } from '@/components/FloatingButton';
import { CategoryFilter } from '@/components/CategoryFilter';
import { TagFilter } from '@/components/TagFilter';

type Filter = 'all' | 'unread' | 'reading' | 'completed';

export default function LinksScreen() {
  const router = useRouter();
  const links = useLinksStore((state) => state.links);
  const [currentFilter, setCurrentFilter] = useState<Filter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

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
    <View style={styles.container}>
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
        renderItem={({ item }) => (
          <LinkCard
            link={item}
            onPress={() => router.push(`/link/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.content}
      />

      <FloatingButton
        icon={<Plus size={24} color={colors.text} />}
        onPress={() => setIsModalVisible(true)}
      />

      <AddLinkModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
});