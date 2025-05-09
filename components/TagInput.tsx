import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
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
      newTags.forEach(addTag); // Add to consolidated list
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
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tagContainer}
        contentContainerStyle={styles.tagContentContainer}
      >
        {tags.map(tag => (
          <View key={tag} style={[styles.tag, { backgroundColor: colors.cardHover }]}>
            <Text style={[styles.tagText, { color: colors.text }]}>#{tag}</Text>
            <Pressable
              onPress={() => handleRemoveTag(tag)}
              style={[styles.removeButton, { backgroundColor: colors.card }]}
            >
              <X size={14} color={colors.textSecondary} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={[styles.input, { 
            backgroundColor: colors.card,
            color: colors.text,
          }]}
          value={input}
          onChangeText={(text) => {
            setInput(text);
            if (text.endsWith(',')) {
              handleAddTag(text.slice(0, -1));
            }
          }}
          onSubmitEditing={() => handleAddTag()}
          placeholder="Add tags (comma separated)..."
          placeholderTextColor={colors.textSecondary}
          returnKeyType="done"
        />
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          {tags.length}/{MAX_TAGS} tags (press Enter or use commas)
        </Text>

        {(suggestions.length > 0 || consolidated.length > 0) && (
          <ScrollView 
            style={[styles.suggestions, { backgroundColor: colors.card }]}
            contentContainerStyle={styles.suggestionsContent}
          >
            <Text style={[styles.suggestionsTitle, { color: colors.textSecondary }]}>
              {suggestions.length > 0 ? 'Suggestions' : 'Popular Tags'}
            </Text>
            <View style={styles.chipContainer}>
              {(suggestions.length > 0 ? suggestions : consolidated.slice(0, 10))
                .map(suggestion => (
                <Pressable
                  key={suggestion}
                  style={[
                    styles.chip,
                    { 
                      backgroundColor: tags.includes(suggestion) 
                        ? colors.primary 
                        : colors.cardHover,
                    }
                  ]}
                  onPress={() => handleSelectSuggestion(suggestion)}
                >
                  <Text 
                    style={[
                      styles.chipText, 
                      { 
                        color: tags.includes(suggestion) 
                          ? colors.background 
                          : colors.text 
                      }
                    ]}
                  >
                    #{suggestion}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  tagContainer: {
    maxHeight: 40,
  },
  tagContentContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  tag: {
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    marginLeft: 6,
    padding: 3,
    borderRadius: 12,
  },
  inputContainer: {
    position: 'relative',
    marginTop: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  suggestions: {
    marginTop: 8,
    maxHeight: 120,
    borderRadius: 8,
    padding: 12,
  },
  suggestionsContent: {
    gap: 12,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
