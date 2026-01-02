import { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Text, RefreshControl, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Sparkles, Share2, Library } from 'lucide-react-native';
import { SwipeableLinkCard } from '@/components/SwipeableLinkCard';
import { FilterBar } from '@/components/FilterBar';
import { SearchBar } from '@/components/SearchBar';
import { useLinksStore } from '@/stores/links';
import { useColors } from '@/constants/colors';
import { FloatingButton } from '@/components/FloatingButton';
import { CategoryFilter } from '@/components/CategoryFilter';
import { TagFilter } from '@/components/TagFilter';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useToast } from '@/contexts/toast';
import * as Haptics from 'expo-haptics';

type Filter = 'all' | 'unread' | 'reading' | 'completed';

export default function LinksScreen() {
  const colors = useColors();
  const router = useRouter();
  const links = useLinksStore((state) => state.links);
  const removeLink = useLinksStore((state) => state.removeLink);
  const updateLink = useLinksStore((state) => state.updateLink);
  const { showToast } = useToast();
  const [currentFilter, setCurrentFilter] = useState<Filter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const activeFilterCount = [
    selectedTags.length > 0,
    selectedCategory !== null,
    currentFilter !== 'all',
  ].filter(Boolean).length;
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleDelete = useCallback((id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    removeLink(id);
    showToast({ message: 'Link deleted', type: 'success' });
  }, [removeLink, showToast]);

  const handleToggleComplete = useCallback((link: typeof links[0]) => {
    const newStatus = link.status === 'completed' ? 'unread' : 'completed';
    const newProgress = newStatus === 'completed' ? 1 : 0;
    updateLink(link.id, { status: newStatus, readingProgress: newProgress });
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    showToast({ 
      message: newStatus === 'completed' ? 'Marked as complete!' : 'Marked as unread',
      type: 'success' 
    });
  }, [updateLink, showToast]);
  
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

  const clearAllFilters = () => {
    setCurrentFilter('all');
    setSelectedTags([]);
    setSelectedCategory(null);
    setSearchQuery('');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Compact Toolbar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          showFilters={showAdvancedFilters}
          onToggleFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
          filterCount={activeFilterCount}
        />

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <View style={[styles.filtersPanel, { backgroundColor: colors.backgroundSecondary }]}>
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
            
            {activeFilterCount > 0 && (
              <Pressable 
                style={[styles.clearFiltersButton, { backgroundColor: colors.errorLight }]}
                onPress={clearAllFilters}
              >
                <Text style={[styles.clearFiltersText, { color: colors.error }]}>
                  Clear all filters
                </Text>
              </Pressable>
            )}
          </View>
        )}
      
        <FlatList
          data={filteredLinks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.content,
            filteredLinks.length === 0 && styles.emptyContent
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <SwipeableLinkCard
              link={item}
              onPress={() => router.push(`/link/${item.id}`)}
              onDelete={() => handleDelete(item.id)}
              onToggleComplete={() => handleToggleComplete(item)}
            />
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconContainer, { backgroundColor: colors.primaryLight }]}>
                <Library size={48} color={colors.primary} strokeWidth={1.5} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Your library is empty
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Save articles, videos, and links to read later
              </Text>
              
              <View style={styles.tipsList}>
                <View style={[styles.tipItem, { backgroundColor: colors.backgroundSecondary }]}>
                  <View style={[styles.tipIconContainer, { backgroundColor: colors.primaryLight }]}>
                    <Plus size={16} color={colors.primary} />
                  </View>
                  <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                    Tap the + button to add a link
                  </Text>
                </View>
                <View style={[styles.tipItem, { backgroundColor: colors.backgroundSecondary }]}>
                  <View style={[styles.tipIconContainer, { backgroundColor: colors.primaryLight }]}>
                    <Share2 size={16} color={colors.primary} />
                  </View>
                  <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                    Share from any app to save instantly
                  </Text>
                </View>
                <View style={[styles.tipItem, { backgroundColor: colors.backgroundSecondary }]}>
                  <View style={[styles.tipIconContainer, { backgroundColor: colors.primaryLight }]}>
                    <Sparkles size={16} color={colors.primary} />
                  </View>
                  <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                    Swipe cards to mark complete or delete
                  </Text>
                </View>
              </View>
            </View>
          )}
        />

        <FloatingButton
          icon={<Plus size={26} color={colors.textOnPrimary} strokeWidth={2.5} />}
          onPress={() => router.push('../../new-link')}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  emptyContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tipsList: {
    marginTop: 32,
    gap: 12,
    width: '100%',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  tipIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
  },
  filtersPanel: {
    paddingBottom: 12,
  },
  clearFiltersButton: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
