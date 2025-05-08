import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text } from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: Props) {
  const [input, setInput] = useState('');

  const handleAddTag = () => {
    if (!input.trim()) return;
    
    const newTag = input.trim().toLowerCase();
    if (!tags.includes(newTag)) {
      onChange([...tags, newTag]);
    }
    setInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <View style={styles.container}>
      <View style={styles.tagContainer}>
        {tags.map(tag => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
            <Pressable
              onPress={() => handleRemoveTag(tag)}
              style={styles.removeButton}
            >
              <X size={14} color={colors.textSecondary} />
            </Pressable>
          </View>
        ))}
      </View>
      
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        onSubmitEditing={handleAddTag}
        placeholder="Add tags..."
        placeholderTextColor={colors.textSecondary}
        returnKeyType="done"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: colors.cardHover,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 10,
    paddingRight: 6,
  },
  tagText: {
    color: colors.text,
    fontSize: 14,
  },
  removeButton: {
    marginLeft: 4,
    padding: 2,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
  },
});