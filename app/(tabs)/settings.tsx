import { View, StyleSheet, Text, ScrollView, Switch, Pressable, Share } from 'react-native';
import { Download, Bell, Moon, Sun } from 'lucide-react-native';
import { useColors } from '@/constants/colors';
import { useLinksStore } from '@/stores/links';
import { useThemeStore, useTheme } from '@/constants/colors';

export default function SettingsScreen() {
  const colors = useColors();
  const theme = useTheme();
  const { theme: themePreference, setTheme } = useThemeStore();
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Appearance</Text>
        <View style={[styles.setting, { backgroundColor: colors.card }]}>
          <View style={styles.settingInfo}>
            {theme === 'dark' ? (
              <Moon size={20} color={colors.text} />
            ) : (
              <Sun size={20} color={colors.text} />
            )}
            <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={(value) => setTheme(value ? 'dark' : 'light')}
          />
        </View>
        <View style={[styles.setting, { backgroundColor: colors.card }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingText, { color: colors.text }]}>Use System Theme</Text>
          </View>
          <Switch
            value={themePreference === 'system'}
            onValueChange={(value) => setTheme(value ? 'system' : theme)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Notifications</Text>
        <View style={[styles.setting, { backgroundColor: colors.card }]}>
          <View style={styles.settingInfo}>
            <Bell size={20} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>Reading Reminders</Text>
          </View>
          <Switch
            value={false}
            onValueChange={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Data</Text>
        <Pressable 
          style={[styles.setting, { backgroundColor: colors.card }]} 
          onPress={handleExport}
        >
          <View style={styles.settingInfo}>
            <Download size={20} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>Export Links</Text>
          </View>
        </Pressable>
      </View>

      <Text style={[styles.version, { color: colors.textSecondary }]}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  version: {
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
});