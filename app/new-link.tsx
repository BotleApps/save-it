import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { X, Plus, Loader2, Pencil } from 'lucide-react-native';
import { useColors } from '@/constants/colors';
import { useLinksStore } from '@/stores/links';
import { useTagsStore } from '@/stores/tags';
import { TagInput } from '@/components/TagInput';
import { useToast } from '@/contexts/toast';

const isValidUrl = (urlString: string) => {
  try {
    const urlPattern = /^(https?:\/\/)?([\/w-]+\.)+[\w-]+(\/[\w-./?%&=@]*)?$/i;
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
  const params = useLocalSearchParams();
  const editId = params.id as string | undefined;
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'preview' | 'save' | null>(null);
  const { showToast } = useToast();
  
  const addLink = useLinksStore((state) => state.addLink);
  const updateLink = useLinksStore((state) => state.updateLink);
  const existingLink = useLinksStore((state) =>
    editId ? state.getLink(editId) : undefined
  );
  const isEditing = Boolean(editId && existingLink);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const addTags = useTagsStore((state) => state.addTags);

  // Handle edit mode or share target prefill
  useEffect(() => {
    if (isPrefilled) return;

    if (isEditing && existingLink) {
      setUrl(existingLink.url);
      setNote(existingLink.note || '');
      setTags(existingLink.tags || []);
      setIsPrefilled(true);
      return;
    }

    const sharedUrl = (params.url as string) || '';
    const sharedTitle = (params.title as string) || '';
    const sharedText = (params.text as string) || '';

    if (sharedUrl) {
      setUrl(sharedUrl);
    } else if (sharedText) {
      const urlMatch = sharedText.match(/(https?:\/\/[^\s]+)/);
      if (urlMatch) {
        setUrl(urlMatch[0]);
      } else {
        setUrl(sharedText);
      }
    }

    if (sharedTitle && !sharedUrl) {
      setNote(sharedTitle);
    }

    setIsPrefilled(true);
  }, [isEditing, existingLink, params, isPrefilled]);

  const fetchPageContent = async (url: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      const html = await response.text();
      
      // Extract text content from HTML
      let text = html
        .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
        .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
        .replace(/<\/?[^>]+(>|$)/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, " ")
        .trim();
      
      return text.length > 50 ? text : null;
    } catch (error) {
      console.log('Content fetch failed:', error);
      return null;
    }
  };

  const fetchPreview = async (formattedUrl: string) => {
    // Try Microlink API first
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(
        `https://api.microlink.io?url=${encodeURIComponent(formattedUrl)}`,
        { 
          signal: controller.signal,
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        const { title, description, image } = data.data;
        return {
          title: title || formattedUrl,
          description: description || null,
          imageUrl: image?.url || null,
        };
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.log('Preview fetch failed:', error);
      return null;
    }
  };

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
    
    // Try to fetch preview and content in parallel
    const [preview, content] = await Promise.all([
      fetchPreview(formattedUrl),
      fetchPageContent(formattedUrl)
    ]);
    
    setLoadingType('save');
    
    try {
      addTags(tags);

      if (isEditing && existingLink) {
        updateLink(existingLink.id, {
          url: formattedUrl,
          note: note || null,
          tags,
          title: preview?.title || existingLink.title,
          description: preview?.description ?? existingLink.description,
          imageUrl: preview?.imageUrl ?? existingLink.imageUrl,
          content: content ?? existingLink.content,
        });
      } else {
        addLink({
          url: formattedUrl,
          title: preview?.title || formattedUrl,
          description: preview?.description || null,
          note: note || null,
          groups: [],
          prompt: null,
          summary: null,
          response: null,
          imageUrl: preview?.imageUrl || null,
          tags,
          category: null,
          status: 'unread' as const,
          readingProgress: 0,
          estimatedReadTime: null,
          content: content,
        });
      }

      setIsLoading(false);
      
      const message = isEditing
        ? 'Link updated successfully!'
        : preview
          ? 'Link saved with preview!'
          : 'Link saved successfully!';
      
      showToast({ 
        message,
        type: 'success',
        duration: 2000
      });
      router.dismiss();
    } catch (saveErr) {
      console.error('Save error:', saveErr);
      setIsLoading(false);
      showToast({ 
        message: 'Failed to save link. Please try again.',
        type: 'error'
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
                {loadingType === 'preview'
                  ? 'Loading Preview...'
                  : isEditing
                    ? 'Updating Link...'
                    : 'Saving Link...'}
              </Text>
            </>
          ) : (
            <>
              {isEditing ? (
                <Pencil size={24} color={colors.text} />
              ) : (
                <Plus size={24} color={colors.text} />
              )}
              <Text style={[styles.buttonText, { color: colors.text }]}>
                {isEditing ? 'Update Link' : 'Save Link'}
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
