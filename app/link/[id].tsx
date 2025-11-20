import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Clipboard } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ExternalLink, ArrowLeft, Trash2, Copy, Pencil } from 'lucide-react-native';
import { useColors } from '@/constants/colors';
import { useLinksStore } from '@/stores/links';

export default function LinkDetailsScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const link = useLinksStore((state) => state.getLink(id as string));
  const removeLink = useLinksStore((state) => state.removeLink);

  useEffect(() => {
    if (!link) {
      router.replace('/');
    }
  }, [link, router]);

  if (!link) return null;

  const handleDelete = () => {
    removeLink(link.id);
    router.replace('/');
  };

  const handleCopyLink = () => {
    Clipboard.setString(link.url);
  };

  const handleOpenLink = () => {
    Linking.openURL(link.url);
  };

  const handleEditLink = () => {
    router.push({
      pathname: '/new-link',
      params: { id: link.id },
    });
  };

  const displayUrl = (() => {
    try {
      const parsed = new URL(link.url);
      const path = parsed.pathname === '/' ? '' : parsed.pathname;
      return `${parsed.hostname}${path}`;
    } catch {
      return link.url;
    }
  })();

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: '',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={colors.text} />
            </Pressable>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <Pressable onPress={handleOpenLink} style={styles.headerButton}>
                <ExternalLink size={22} color={colors.text} />
              </Pressable>
              <Pressable onPress={handleCopyLink} style={styles.headerButton}>
                <Copy size={22} color={colors.text} />
              </Pressable>
              <Pressable onPress={handleEditLink} style={styles.headerButton}>
                <Pencil size={22} color={colors.text} />
              </Pressable>
              <Pressable onPress={handleDelete} style={styles.headerButton}>
                <Trash2 size={22} color={colors.error} />
              </Pressable>
            </View>
          ),
        }}
      />
      
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        {link.imageUrl && (
          <Image
            source={{ uri: link.imageUrl }}
            style={styles.image}
            contentFit="cover"
          />
        )}

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>{link.title}</Text>
          
          {(link.description || link.note) && (
            <>
              {link.description && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
                  <Text style={[styles.description, { color: colors.textSecondary }]}>
                    {link.description}
                  </Text>
                </View>
              )}
              
              {link.note && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Note</Text>
                  <Text style={[styles.description, { color: colors.textSecondary }]}>
                    {link.note}
                  </Text>
                </View>
              )}
            </>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Link</Text>
            <Pressable onPress={handleOpenLink} style={[styles.urlPill, { borderColor: colors.border }]}> 
              <Text
                style={[styles.urlText, { color: colors.primary }]}
                numberOfLines={2}
              >
                {displayUrl}
              </Text>
            </Pressable>
          </View>

          {link.tags.length > 0 && (
            <View style={styles.tags}>
              {link.tags.map((tag) => (
                <View 
                  key={tag} 
                  style={[styles.tag, { backgroundColor: colors.cardHover }]}
                >
                  <Text style={[styles.tagText, { color: colors.text }]}>
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  urlPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  urlText: {
    fontSize: 15,
    fontWeight: '500',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
  },
});
