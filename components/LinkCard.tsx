import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Link } from '@/types/link';
import { colors } from '@/constants/colors';
import { Clock, BookOpen, CheckCircle2 } from 'lucide-react-native';

interface LinkCardProps {
  link: Link;
  onPress: () => void;
}

const StatusIcon = ({ status }: { status: Link['status'] }) => {
  switch (status) {
    case 'unread':
      return <Clock size={16} color={colors.textSecondary} />;
    case 'reading':
      return <BookOpen size={16} color={colors.warning} />;
    case 'completed':
      return <CheckCircle2 size={16} color={colors.success} />;
  }
};

export function LinkCard({ link, onPress }: LinkCardProps) {
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
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
          <StatusIcon status={link.status} />
          <Text style={styles.title} numberOfLines={2}>
            {link.title}
          </Text>
        </View>
        
        {link.description && (
          <Text style={styles.description} numberOfLines={2}>
            {link.description}
          </Text>
        )}

        <View style={styles.footer}>
          {link.tags.length > 0 && (
            <View style={styles.tags}>
              {link.tags.slice(0, 2).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
          
          {link.estimatedReadTime && (
            <Text style={styles.readTime}>
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
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  pressed: {
    backgroundColor: colors.cardHover,
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
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
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
    backgroundColor: colors.cardHover,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  readTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});