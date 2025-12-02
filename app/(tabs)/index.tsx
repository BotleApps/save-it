import { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Text, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, BookmarkPlus, Sparkles, Share2, ChevronDown, ChevronUp, Filter } from 'lucide-react-native';
import { LinkCard } from '@/components/LinkCard';
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
    // Simulate refresh - in future could re-fetch previews
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleDelete = useCallback((id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    removeLink(id);
    showToast({ message: 'Link deleted', type: 'success' });
  }, [removeLink, showToast]);

  const handleToggleComplete = useCallback((link: typeof links[0]) => {
    const newStatus = link.status === 'completed' ? 'unread' : 'completed';
    const newProgress = newStatus === 'completed' ? 1 : 0;
    updateLink(link.id, { status: newStatus, readingProgress: newProgress });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <FilterBar
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
      />

      <Pressable 
        style={[styles.filterToggle, { borderBottomColor: colors.border }]}
        onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}
      >
        <View style={styles.filterToggleLeft}>
          <Filter size={16} color={colors.textSecondary} />
          <Text style={[styles.filterToggleText, { color: colors.textSecondary }]}>
            Advanced Filters
          </Text>
          {activeFilterCount > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </View>
        {showAdvancedFilters ? (
          <ChevronUp size={18} color={colors.textSecondary} />
        ) : (
          <ChevronDown size={18} color={colors.textSecondary} />
        )}
      </Pressable>

      {showAdvancedFilters && (
        <>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <TagFilter
            selectedTags={selectedTags}
            onSelectTags={setSelectedTags}
          />
        </>
      )}
      
      <FlatList
        data={filteredLinks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
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
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.card }]}>
              <BookmarkPlus size={48} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Your reading list is empty</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Save articles, videos, and links to read later
            </Text>
            
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Plus size={18} color={colors.primary} />
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  Tap the + button to add a link
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Share2 size={18} color={colors.primary} />
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  Share from any app to save instantly
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Sparkles size={18} color={colors.primary} />
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  Swipe through content in Cards mode
                </Text>
              </View>
            </View>
          </View>
        )}
      />

      <FloatingButton
        icon={<Plus size={24} color={colors.text} />}
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
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tipsList: {
    marginTop: 24,
    gap: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipText: {
    fontSize: 14,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  filterToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
