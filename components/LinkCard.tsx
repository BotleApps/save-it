import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Link } from '@/types/link';
import { Clock, BookOpen, CheckCircle2 } from 'lucide-react-native';
import { useColors } from '@/constants/colors';

interface LinkCardProps {
  link: Link;
  onPress: () => void;
}

const StatusIcon = ({ status, color }: { status: Link['status']; color: string }) => {
  switch (status) {
    case 'unread':
      return <Clock size={16} color={color} />;
    case 'reading':
      return <BookOpen size={16} color={color} />;
    case 'completed':
      return <CheckCircle2 size={16} color={color} />;
  }
};

export function LinkCard({ link, onPress }: LinkCardProps) {
  const colors = useColors();

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.card },
        pressed && { backgroundColor: colors.cardHover }
      ]}
      onPress={onPress}
    >
      {link.imageUrl && (
        <Image
          source={{ uri: link.imageUrl }}
          style={styles.image}
          contentFit="cover"
        />
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <StatusIcon status={link.status} color={colors.textSecondary} />
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {link.title}
          </Text>
        </View>
        
        {link.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
            {link.description}
          </Text>
        )}

        <View style={styles.footer}>
          {link.tags.length > 0 && (
            <View style={styles.tags}>
              {link.tags.slice(0, 2).map((tag) => (
                <View key={tag} style={[styles.tag, { backgroundColor: colors.cardHover }]}>
                  <Text style={[styles.tagText, { color: colors.textSecondary }]}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
          
          {link.estimatedReadTime && (
            <Text style={[styles.readTime, { color: colors.textSecondary }]}>
              {link.estimatedReadTime} min read
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
  },
  readTime: {
    fontSize: 12,
  },
});