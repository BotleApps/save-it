import React, { useRef } from 'react';
import { View, TextInput, StyleSheet, Pressable, Platform } from 'react-native';
import { Search, X, SlidersHorizontal } from 'lucide-react-native';
import { useColors } from '@/constants/colors';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  filterCount?: number;
}

export function SearchBar({ 
  value, 
  onChangeText, 
  placeholder = 'Search saved links...', 
  showFilters,
  onToggleFilters,
  filterCount = 0,
}: Props) {
  const colors = useColors();
  const inputRef = useRef<TextInput>(null);

  const handleClear = () => {
    onChangeText('');
    inputRef.current?.focus();
  };

  return (
    <View style={[styles.toolbar, { borderBottomColor: colors.border }]}>
      <View 
        style={[
          styles.searchContainer, 
          { 
            backgroundColor: colors.backgroundSecondary,
            borderColor: 'transparent',
          }
        ]}
      >
        <Search size={18} color={colors.textTertiary} strokeWidth={2} />
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.primary}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <Pressable 
            onPress={handleClear}
            style={({ pressed }) => [
              styles.clearButton,
              { backgroundColor: colors.backgroundTertiary },
              pressed && { opacity: 0.7 }
            ]}
            hitSlop={8}
          >
            <X size={12} color={colors.textSecondary} strokeWidth={2.5} />
          </Pressable>
        )}
      </View>
      
      {onToggleFilters && (
        <Pressable
          onPress={onToggleFilters}
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: showFilters ? colors.primaryLight : colors.backgroundSecondary },
            pressed && { opacity: 0.7 }
          ]}
        >
          <SlidersHorizontal 
            size={18} 
            color={showFilters || filterCount > 0 ? colors.primary : colors.textSecondary} 
            strokeWidth={2} 
          />
          {filterCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]} />
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    gap: 10,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    paddingVertical: 0,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});