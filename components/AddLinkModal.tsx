import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { X, Plus, Loader2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useLinksStore } from '@/stores/links';
import { TagInput } from './TagInput';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AddLinkModal({ visible, onClose }: Props) {
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const addLink = useLinksStore((state) => state.addLink);

  const handleSubmit = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Add http:// if missing
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      
      // Fetch preview data
      const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(formattedUrl)}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error('Failed to fetch link preview');

      const { title, description, image } = data.data;

      addLink({
        url: formattedUrl,
        title: title || url,
        description: description || note || null,
        imageUrl: image?.url || null,
        tags,
        category: null,
        status: 'unread',
        readingProgress: 0,
        estimatedReadTime: null,
      });

      // Reset form
      setUrl('');
      setNote('');
      setTags([]);
      onClose();
    } catch (err) {
      setError('Failed to fetch link preview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Save New Link</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.label}>URL</Text>
            <TextInput
              style={styles.input}
              value={url}
              onChangeText={setUrl}
              placeholder="Enter URL"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Tags</Text>
            <TagInput tags={tags} onChange={setTags} />

            {error && (
              <Text style={styles.error}>{error}</Text>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 size={24} color={colors.text} />
              ) : (
                <>
                  <Plus size={24} color={colors.text} />
                  <Text style={styles.buttonText}>Save Link</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  error: {
    color: colors.error,
    marginTop: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});