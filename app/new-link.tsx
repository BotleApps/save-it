import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { X, Plus, Loader2 } from 'lucide-react-native';
import { useColors } from '@/constants/colors';
import { useLinksStore } from '@/stores/links';
import { useTagsStore } from '@/stores/tags';
import { TagInput } from '@/components/TagInput';
import { useToast } from '@/contexts/toast';

const isValidUrl = (urlString: string) => {
  try {
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;
    return urlPattern.test(urlString);
  } catch {
    return false;
  }
};

const formatUrl = (urlString: string) => {
  if (!urlString.match(/^https?:\/\//i)) {
    return `https://${urlString}`;
  }
  return urlString;
};

export default function NewLinkScreen() {
  const colors = useColors();
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'preview' | 'save' | null>(null);
  const { showToast } = useToast();
  
  const addLink = useLinksStore((state) => state.addLink);
  const addTags = useTagsStore((state) => state.addTags);

  const handleSubmit = async () => {
    if (!url) {
      showToast({ message: 'Please enter a URL', type: 'error' });
      return;
    }

    const formattedUrl = formatUrl(url);
    if (!isValidUrl(formattedUrl)) {
      showToast({ message: 'Please enter a valid URL', type: 'error', duration: 3000 });
      return;
    }

    setIsLoading(true);
    setLoadingType('preview');
    
    try {
      console.log('Fetching preview for:', formattedUrl);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(
        `https://api.microlink.io?url=${encodeURIComponent(formattedUrl)}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      const data = await response.json();
      console.log('API response:', { status: response.status, data });
      
      if (response.status !== 200) {
        console.log('API error - status:', response.status);
        throw new Error(`Failed to fetch link preview: ${response.status}`);
      }

      if (!data.success) {
        console.log('API error - data:', data);
        throw new Error('API returned error');
      }

      console.log('Preview data:', data.data);
      const { title = url, description = null, image = null } = data.data || {};

      addTags(tags); // Add to consolidated tags list
      addLink({
        url: formattedUrl,
        title: title || url,
        description: description || null,
        note: note || null,
        groups: [],
        prompt: null,
        summary: null,
        response: null,
        imageUrl: image?.url || null,
        tags,
        category: null,
        status: 'unread' as const,
        readingProgress: 0,
        estimatedReadTime: null,
      });

      setIsLoading(false);
      showToast({ 
        message: 'Link saved successfully!',
        type: 'success',
        duration: 2000
      });
      router.dismiss();
    } catch (err: any) {
      setLoadingType('save');
      const message = err.name === 'AbortError' 
        ? 'Preview timed out. Saving without preview...'
        : 'Preview failed. Saving without preview...';
      showToast({ message, type: 'error', duration: 2000 });

      // Save without preview after a brief delay
      await new Promise(resolve => setTimeout(resolve, 800));
      try {
        addTags(tags);
        addLink({
          url: formattedUrl,
          title: url,
          description: null,
          note: note || null,
          groups: [],
          prompt: null,
          summary: null,
          response: null,
          imageUrl: null,
          tags,
          category: null,
          status: 'unread' as const,
          readingProgress: 0,
          estimatedReadTime: null,
        });

        // Dismiss after successful save
        showToast({ 
          message: 'Link saved without preview',
          type: 'success',
          duration: 2000
        });
        router.dismiss();
      } catch (saveErr) {
        console.error('Save error:', saveErr);
        showToast({ 
          message: 'Failed to save link. Please try again.',
          type: 'error'
        });
      }

      console.error('Preview error:', {
        message: err?.message || 'Unknown error',
        url: formattedUrl,
        stack: err?.stack,
        response: err?.response
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.dismiss()} style={styles.closeButton}>
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
            <>
              <Loader2 size={24} color={colors.text} />
              <Text style={[styles.buttonText, { color: colors.text }]}>
                {loadingType === 'preview' ? 'Loading Preview...' : 'Saving Link...'}
              </Text>
            </>
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
    color: '#ff3b30',
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
