import { View, StyleSheet, Text, ScrollView, Switch, Pressable, Share } from 'react-native';
import { useColorScheme } from 'react-native';
import { Download, Bell, Moon, Sun } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useLinksStore } from '@/stores/links';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const links = useLinksStore((state) => state.links);

  const handleExport = async () => {
    try {
      const jsonStr = JSON.stringify(links, null, 2);
      await Share.share({
        message: jsonStr,
        title: 'Save It - Links Export'
      });
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            {isDark ? <Moon size={20} color={colors.text} /> : <Sun size={20} color={colors.text} />}
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Switch
            value={isDark}
            // In a real app, we would implement theme switching
            onValueChange={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <Bell size={20} color={colors.text} />
            <Text style={styles.settingText}>Reading Reminders</Text>
          </View>
          <Switch
            value={false}
            onValueChange={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <Pressable style={styles.setting} onPress={handleExport}>
          <View style={styles.settingInfo}>
            <Download size={20} color={colors.text} />
            <Text style={styles.settingText}>Export Links</Text>
          </View>
        </Pressable>
      </View>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: colors.text,
  },
  version: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 32,
    marginBottom: 16,
  },
});