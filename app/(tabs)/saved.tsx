import { View, StyleSheet, Text } from 'react-native';
import { colors } from '@/constants/colors';

export default function SavedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Saved links will appear here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});