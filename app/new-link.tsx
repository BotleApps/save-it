import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { X, Plus, Loader2 } from 'lucide-react-native';
import { useColors } from '@/constants/colors';
import { useLinksStore } from '@/stores/links';
import { useTagsStore } from '@/stores/tags';
import { TagInput } from '@/components/TagInput';

export default function NewLinkScreen() {
  const colors = useColors();
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const addLink = useLinksStore((state) => state.addLink);
  const addTags = useTagsStore((state) => state.addTags);

  const handleSubmit = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      
      const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(formattedUrl)}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error('Failed to fetch link preview');

      const { title, description, image } = data.data;

      addTags(tags); // Add to consolidated tags list
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

      router.back();
    } catch (err) {
      setError('Failed to fetch link preview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>Cancel</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Save New Link</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={[styles.label, { color: colors.text }]}>URL</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card,
            color: colors.text,
          }]}
          value={url}
          onChangeText={setUrl}
          placeholder="Enter URL"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />

        <Text style={[styles.label, { color: colors.text }]}>Note (optional)</Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            { backgroundColor: colors.card, color: colors.text }
          ]}
          value={note}
          onChangeText={setNote}
          placeholder="Add a note..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
        />

        <Text style={[styles.label, { color: colors.text }]}>Tags</Text>
        <TagInput tags={tags} onChange={setTags} />

        {error && (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        )}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Pressable
          style={[
            styles.button,
            { backgroundColor: colors.primary },
            isLoading && styles.buttonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 size={24} color={colors.text} />
          ) : (
            <>
              <Plus size={24} color={colors.text} />
              <Text style={[styles.buttonText, { color: colors.text }]}>
                Save Link
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: -1,
  },
  closeButton: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 17,
    fontWeight: '400',
  },
  headerRight: {
    width: 72,
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  error: {
    marginTop: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  button: {
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
    fontSize: 16,
    fontWeight: '600',
  },
});
