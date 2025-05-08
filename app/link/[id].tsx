import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ExternalLink, ArrowLeft, Trash2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useLinksStore } from '@/stores/links';

export default function LinkDetailsScreen() {
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

  const handleOpenLink = () => {
    Linking.openURL(link.url);
  };

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
            <Pressable onPress={handleDelete} style={styles.headerButton}>
              <Trash2 size={24} color={colors.error} />
            </Pressable>
          ),
        }}
      />
      
      <ScrollView style={styles.container}>
        {link.imageUrl && (
          <Image
            source={{ uri: link.imageUrl }}
            style={styles.image}
            contentFit="cover"
          />
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{link.title}</Text>
          
          {link.description && (
            <Text style={styles.description}>{link.description}</Text>
          )}

          <Pressable style={styles.linkButton} onPress={handleOpenLink}>
            <ExternalLink size={20} color={colors.text} />
            <Text style={styles.linkButtonText}>Open Link</Text>
          </Pressable>

          {link.tags.length > 0 && (
            <View style={styles.tags}>
              {link.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
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
    backgroundColor: colors.background,
  },
  headerButton: {
    padding: 8,
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
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  linkButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 24,
  },
  linkButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.cardHover,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  tagText: {
    color: colors.text,
    fontSize: 14,
  },
});