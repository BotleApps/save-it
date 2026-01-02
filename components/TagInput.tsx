import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text, ScrollView } from 'react-native';
import { X, Hash, Plus } from 'lucide-react-native';
import { useColors } from '@/constants/colors';
import { useTagsStore } from '@/stores/tags';

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: Props) {
  const colors = useColors();
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = React.useRef<TextInput>(null);
  const consolidated = useTagsStore((state) => state.tags);
  const addTag = useTagsStore((state) => state.addTag);

  const MAX_TAGS = 10;

  useEffect(() => {
    if (input.trim()) {
      const matchingTags = consolidated
        .filter(tag => 
          tag.toLowerCase().includes(input.toLowerCase()) && 
          !tags.includes(tag)
        )
        .slice(0, 5);
      setSuggestions(matchingTags);
    } else {
      setSuggestions([]);
    }
  }, [input, consolidated, tags]);

  const handleAddTag = (value = input) => {
    if (!value.trim()) return;
    
    const newTags = value
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag && !tags.includes(tag));
    
    if (tags.length + newTags.length <= MAX_TAGS) {
      newTags.forEach(addTag);
      onChange([...tags, ...newTags]);
    }
    setInput('');
    setSuggestions([]);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSelectSuggestion = (tag: string) => {
    if (tags.length < MAX_TAGS) {
      onChange([...tags, tag]);
      setInput('');
      setSuggestions([]);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <View style={styles.container}>
      {/* Current Tags */}
      {tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.map(tag => (
            <View 
              key={tag} 
              style={[styles.tag, { backgroundColor: colors.primaryLight }]}
            >
              <Hash size={12} color={colors.primary} strokeWidth={2.5} />
              <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
              <Pressable
                onPress={() => handleRemoveTag(tag)}
                style={({ pressed }) => [
                  styles.removeButton, 
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.7 }
                ]}
                hitSlop={4}
              >
                <X size={10} color={colors.textOnPrimary} strokeWidth={3} />
              </Pressable>
            </View>
          ))}
        </View>
      )}
      
      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={[
            styles.input, 
            { 
              backgroundColor: colors.inputBackground,
              color: colors.text,
              borderColor: isFocused ? colors.inputFocused : colors.inputBorder,
            }
          ]}
          value={input}
          onChangeText={(text) => {
            setInput(text);
            if (text.endsWith(',')) {
              handleAddTag(text.slice(0, -1));
            }
          }}
          onSubmitEditing={() => handleAddTag()}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Type and press enter to add..."
          placeholderTextColor={colors.textTertiary}
          returnKeyType="done"
          selectionColor={colors.primary}
        />
        
        <Text style={[styles.hint, { color: colors.textTertiary }]}>
          {tags.length}/{MAX_TAGS} tags
        </Text>

        {/* Suggestions */}
        {(isFocused && (suggestions.length > 0 || (consolidated.length > 0 && !input))) && (
          <View style={[styles.suggestions, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.suggestionsTitle, { color: colors.textSecondary }]}>
              {suggestions.length > 0 ? 'Suggestions' : 'Recent tags'}
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}
            >
              {(suggestions.length > 0 ? suggestions : consolidated.slice(0, 8))
                .filter(s => !tags.includes(s))
                .map(suggestion => (
                <Pressable
                  key={suggestion}
                  style={({ pressed }) => [
                    styles.chip,
                    { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                    pressed && { backgroundColor: colors.backgroundTertiary }
                  ]}
                  onPress={() => handleSelectSuggestion(suggestion)}
                >
                  <Plus size={12} color={colors.textSecondary} strokeWidth={2} />
                  <Text style={[styles.chipText, { color: colors.text }]}>
                    {suggestion}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 10,
    paddingRight: 6,
    gap: 4,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  removeButton: {
    marginLeft: 4,
    padding: 4,
    borderRadius: 6,
  },
  inputContainer: {
    position: 'relative',
    gap: 6,
  },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1.5,
  },
  hint: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  suggestions: {
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipsScroll: {
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
