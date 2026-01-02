import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { X, Plus, Loader2, Pencil, Link as LinkIcon, FileText, Tag } from 'lucide-react-native';
import { useColors } from '@/constants/colors';
import { useLinksStore } from '@/stores/links';
import { useTagsStore } from '@/stores/tags';
import { TagInput } from '@/components/TagInput';
import { useToast } from '@/contexts/toast';
import { LinearGradient } from 'expo-linear-gradient';

const isValidUrl = (urlString: string) => {
  try {
    // Use URL constructor for robust validation
    const url = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
    // Check for valid hostname (must have at least one dot for TLD)
    return url.hostname.includes('.') && url.hostname.length > 2;
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
  const [urlFocused, setUrlFocused] = useState(false);
  const [noteFocused, setNoteFocused] = useState(false);
  const { showToast } = useToast();
  
  const addLink = useLinksStore((state) => state.addLink);
  const updateLink = useLinksStore((state) => state.updateLink);
  const existingLink = useLinksStore((state) =>
    editId ? state.getLink(editId) : undefined
  );
  const isEditing = Boolean(editId && existingLink);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const addTags = useTagsStore((state) => state.addTags);

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
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      // Try Microlink API first for better content extraction
      const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&data.content=true`;
      const response = await fetch(apiUrl, { 
        signal: controller.signal,
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        }
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data?.data?.content) {
          const cleanedContent = data.data.content
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, '\n\n')
            .trim();
          
          if (cleanedContent.length > 100) {
            return cleanedContent;
          }
        }
      }
      
      // Fallback for native platforms only (web has CSP restrictions)
      if (Platform.OS !== 'web') {
        const directResponse = await fetch(url, { signal: controller.signal });
        const html = await directResponse.text();
        
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
      }
      
      return null;
    } catch (error) {
      console.log('Content fetch failed:', error);
      return null;
    }
  };

  const fetchPreview = async (formattedUrl: string) => {
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
    
    const preview = await fetchPreview(formattedUrl);
    
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
          content: null, // Will be fetched lazily when viewing details
        });
      }

      setIsLoading(false);
      
      const message = isEditing
        ? 'Link updated!'
        : preview
          ? 'Link saved with preview!'
          : 'Link saved!';
      
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
        message: 'Failed to save. Please try again.',
        type: 'error'
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable 
            onPress={() => router.dismiss()} 
            style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.6 }]}
          >
            <X size={24} color={colors.textSecondary} strokeWidth={2} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>
            {isEditing ? 'Edit Link' : 'Save Link'}
          </Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* URL Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <LinkIcon size={16} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.label, { color: colors.text }]}>URL</Text>
            </View>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: urlFocused ? colors.inputFocused : colors.inputBorder,
                }
              ]}
              value={url}
              onChangeText={setUrl}
              placeholder="https://example.com/article"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              onFocus={() => setUrlFocused(true)}
              onBlur={() => setUrlFocused(false)}
              selectionColor={colors.primary}
            />
          </View>

          {/* Note Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <FileText size={16} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.label, { color: colors.text }]}>Note</Text>
              <Text style={[styles.optional, { color: colors.textTertiary }]}>Optional</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { 
                  backgroundColor: colors.inputBackground, 
                  color: colors.text,
                  borderColor: noteFocused ? colors.inputFocused : colors.inputBorder,
                }
              ]}
              value={note}
              onChangeText={setNote}
              placeholder="Add a personal note..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={4}
              onFocus={() => setNoteFocused(true)}
              onBlur={() => setNoteFocused(false)}
              selectionColor={colors.primary}
              textAlignVertical="top"
            />
          </View>

          {/* Tags Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Tag size={16} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.label, { color: colors.text }]}>Tags</Text>
              <Text style={[styles.optional, { color: colors.textTertiary }]}>Optional</Text>
            </View>
            <TagInput tags={tags} onChange={setTags} />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              isLoading && styles.buttonDisabled,
              pressed && !isLoading && { opacity: 0.9, transform: [{ scale: 0.98 }] }
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <LinearGradient
              colors={isLoading ? [colors.buttonDisabled, colors.buttonDisabled] : [colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} color={colors.textOnPrimary} />
                  <Text style={[styles.buttonText, { color: colors.textOnPrimary }]}>
                    {loadingType === 'preview' ? 'Fetching preview...' : 'Saving...'}
                  </Text>
                </>
              ) : (
                <>
                  {isEditing ? (
                    <Pencil size={20} color={colors.textOnPrimary} strokeWidth={2.5} />
                  ) : (
                    <Plus size={20} color={colors.textOnPrimary} strokeWidth={2.5} />
                  )}
                  <Text style={[styles.buttonText, { color: colors.textOnPrimary }]}>
                    {isEditing ? 'Update Link' : 'Save Link'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 24,
  },
  inputGroup: {
    gap: 10,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  optional: {
    fontSize: 13,
    fontWeight: '400',
    marginLeft: 'auto',
  },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1.5,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  button: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
