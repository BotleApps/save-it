import { View, StyleSheet, Text, ScrollView, Switch, Pressable, Share, Platform } from 'react-native';
import { Download, Bell, Moon, Sun } from 'lucide-react-native';
import { useColors } from '@/constants/colors';
import { useLinksStore } from '@/stores/links';
import { useThemeStore, useTheme } from '@/constants/colors';
import { useReminderStore } from '@/stores/reminders';
import { ensureReminderPermissions } from '@/utils/reminders';
import { useToast } from '@/contexts/toast';

export default function SettingsScreen() {
  const colors = useColors();
  const theme = useTheme();
  const { theme: themePreference, setTheme } = useThemeStore();
  const links = useLinksStore((state) => state.links);
  const { enabled, reminderTime, setEnabled, setReminderTime } = useReminderStore();
  const { showToast } = useToast();
  const reminderOptions = ['08:00', '12:30', '20:00'];

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

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const handleToggleReminders = async (value: boolean) => {
    if (Platform.OS === 'web' && value) {
      showToast({
        message: 'Reading reminders are only available on the mobile apps right now.',
        type: 'error',
      });
      return;
    }

    if (value) {
      const permitted = await ensureReminderPermissions();
      if (!permitted) {
        showToast({
          message: 'Notifications are blocked. Enable them in system settings to schedule reminders.',
          type: 'error',
        });
        return;
      }
    }
    setEnabled(value);
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
            value={enabled}
            onValueChange={handleToggleReminders}
          />
        </View>
        {enabled && (
          <View style={[styles.reminderCard, { backgroundColor: colors.card }]}> 
            <Text style={[styles.reminderLabel, { color: colors.textSecondary }]}>
              Choose when you want the nudge
            </Text>
            <View style={styles.reminderOptions}>
              {reminderOptions.map((option) => {
                const isActive = option === reminderTime;
                return (
                  <Pressable
                    key={option}
                    style={[
                      styles.reminderOption,
                      {
                        backgroundColor: isActive ? colors.primary : colors.cardHover,
                      },
                    ]}
                    onPress={() => setReminderTime(option)}
                  >
                    <Text
                      style={[
                        styles.reminderOptionText,
                        { color: isActive ? '#fff' : colors.text },
                      ]}
                    >
                      {formatTime(option)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={[styles.reminderHelper, { color: colors.textSecondary }]}>
              Daily reminder only fires when you have unread or in-progress links.
            </Text>
          </View>
        )}
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
  reminderCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
  },
  reminderLabel: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '600',
  },
  reminderOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  reminderOption: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  reminderOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reminderHelper: {
    fontSize: 13,
    lineHeight: 18,
  },
});