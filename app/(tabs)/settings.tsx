import { View, StyleSheet, Text, ScrollView, Switch, Pressable, Share, Platform, Alert, TextInput, Modal, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Download, Bell, Moon, Sun, Upload, Smartphone, CircleCheck, X } from 'lucide-react-native';
import { useColors, useThemeStore } from '@/constants/colors';
import { useLinksStore } from '@/stores/links';
import { useReminderStore } from '@/stores/reminders';
import { ensureReminderPermissions } from '@/utils/reminders';
import { useToast } from '@/contexts/toast';

export default function SettingsScreen() {
  const colors = useColors();
  const { theme: themePreference, setTheme } = useThemeStore();
  const links = useLinksStore((state) => state.links);
  const addLink = useLinksStore((state) => state.addLink);
  const { enabled, reminderTime, setEnabled, setReminderTime } = useReminderStore();
  const { showToast } = useToast();
  const reminderOptions = ['08:00', '12:30', '20:00'];
  
  // Import modal state
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importText, setImportText] = useState('');

  // Reading stats - commented out for now
  // const totalLinks = links.length;
  // const completedLinks = links.filter(l => l.status === 'completed').length;
  // const readingLinks = links.filter(l => l.status === 'reading').length;
  // const unreadLinks = links.filter(l => l.status === 'unread').length;

  const handleExport = async () => {
    try {
      const jsonStr = JSON.stringify(links, null, 2);
      await Share.share({
        message: jsonStr,
        title: 'Save It - Links Export'
      });
      showToast({ message: 'Export ready to share!', type: 'success' });
    } catch (error) {
      console.error('Error exporting data:', error);
      showToast({ message: 'Failed to export data', type: 'error' });
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
        message: 'Reminders are only available on mobile apps.',
        type: 'error',
      });
      return;
    }

    if (value) {
      const permitted = await ensureReminderPermissions();
      if (!permitted) {
        showToast({
          message: 'Enable notifications in settings to use reminders.',
          type: 'error',
        });
        return;
      }
    }
    setEnabled(value);
  };

  const handleImport = () => {
    // Use cross-platform modal instead of Alert.prompt (iOS only)
    setImportText('');
    setImportModalVisible(true);
  };

  const processImport = () => {
    if (!importText.trim()) {
      showToast({ message: 'Please paste JSON data', type: 'error' });
      return;
    }
    
    try {
      const importedLinks = JSON.parse(importText);
      if (!Array.isArray(importedLinks)) {
        throw new Error('Invalid format');
      }
      let importedCount = 0;
      importedLinks.forEach((link: any) => {
        if (link.url && link.title) {
          addLink({
            url: link.url,
            title: link.title,
            description: link.description || null,
            imageUrl: link.imageUrl || null,
            tags: link.tags || [],
            category: link.category || null,
            status: link.status || 'unread',
            readingProgress: link.readingProgress || 0,
            estimatedReadTime: link.estimatedReadTime || null,
            note: link.note || null,
            groups: link.groups || [],
            prompt: link.prompt || null,
            summary: link.summary || null,
            response: link.response || null,
            content: link.content || null,
          });
          importedCount++;
        }
      });
      setImportModalVisible(false);
      setImportText('');
      showToast({
        message: `Imported ${importedCount} links successfully!`,
        type: 'success',
      });
    } catch (error) {
      showToast({
        message: 'Invalid JSON format. Please check your data.',
        type: 'error',
      });
    }
  };

  const ThemeOption = ({ 
    value, 
    label, 
    icon: Icon 
  }: { 
    value: 'light' | 'dark' | 'system'; 
    label: string; 
    icon: React.ElementType;
  }) => {
    const isActive = themePreference === value;
    return (
      <Pressable
        style={[
          styles.themeOption,
          { 
            backgroundColor: isActive ? colors.primaryLight : colors.backgroundSecondary,
            borderColor: isActive ? colors.primary : colors.border,
          },
        ]}
        onPress={() => setTheme(value)}
      >
        <Icon 
          size={20} 
          color={isActive ? colors.primary : colors.textSecondary} 
          strokeWidth={isActive ? 2.5 : 2}
        />
        <Text style={[
          styles.themeOptionText, 
          { color: isActive ? colors.primary : colors.text }
        ]}>
          {label}
        </Text>
        {isActive && (
          <View style={[styles.themeCheckmark, { backgroundColor: colors.primary }]}>
            <CircleCheck size={14} color={colors.textOnPrimary} />
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Stats Section - Commented out for now
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Reading Stats
        </Text>
        <View style={[styles.statsGrid]}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.primaryLight }]}>
              <Library size={18} color={colors.primary} />
            </View>
            <Text style={[styles.statNumber, { color: colors.text }]}>{totalLinks}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.infoLight }]}>
              <Clock size={18} color={colors.info} />
            </View>
            <Text style={[styles.statNumber, { color: colors.text }]}>{unreadLinks}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Unread</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.warningLight }]}>
              <BookOpen size={18} color={colors.warning} />
            </View>
            <Text style={[styles.statNumber, { color: colors.text }]}>{readingLinks}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Reading</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.successLight }]}>
              <CircleCheck size={18} color={colors.success} />
            </View>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{completedLinks}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Done</Text>
          </View>
        </View>
      </View>
      */}

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Appearance
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.text }]}>Theme</Text>
          <View style={styles.themeOptions}>
            <ThemeOption value="light" label="Light" icon={Sun} />
            <ThemeOption value="dark" label="Dark" icon={Moon} />
            <ThemeOption value="system" label="Auto" icon={Smartphone} />
          </View>
        </View>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Notifications
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIconContainer, { backgroundColor: colors.primaryLight }]}>
                <Bell size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.settingText, { color: colors.text }]}>
                  Reading Reminders
                </Text>
                <Text style={[styles.settingSubtext, { color: colors.textTertiary }]}>
                  Get daily nudges to read
                </Text>
              </View>
            </View>
            <Switch
              value={enabled}
              onValueChange={handleToggleReminders}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
              thumbColor={enabled ? colors.primary : colors.textTertiary}
            />
          </View>
          
          {enabled && (
            <View style={[styles.reminderSection, { borderTopColor: colors.divider }]}>
              <Text style={[styles.reminderLabel, { color: colors.textSecondary }]}>
                Reminder time
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
                          backgroundColor: isActive ? colors.primary : colors.backgroundSecondary,
                          borderColor: isActive ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setReminderTime(option)}
                    >
                      <Text
                        style={[
                          styles.reminderOptionText,
                          { color: isActive ? colors.textOnPrimary : colors.text },
                        ]}
                      >
                        {formatTime(option)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={[styles.reminderHelper, { color: colors.textTertiary }]}>
                Only fires when you have unread links
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Data Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Data
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable 
            style={({ pressed }) => [
              styles.settingRow,
              styles.settingRowPressable,
              pressed && { backgroundColor: colors.cardPressed }
            ]} 
            onPress={handleExport}
          >
            <View style={styles.settingInfo}>
              <View style={[styles.settingIconContainer, { backgroundColor: colors.successLight }]}>
                <Download size={18} color={colors.success} />
              </View>
              <View>
                <Text style={[styles.settingText, { color: colors.text }]}>Export Links</Text>
                <Text style={[styles.settingSubtext, { color: colors.textTertiary }]}>
                  Save as JSON file
                </Text>
              </View>
            </View>
          </Pressable>
          
          <View style={[styles.settingDivider, { backgroundColor: colors.divider }]} />
          
          <Pressable 
            style={({ pressed }) => [
              styles.settingRow,
              styles.settingRowPressable,
              pressed && { backgroundColor: colors.cardPressed }
            ]} 
            onPress={handleImport}
          >
            <View style={styles.settingInfo}>
              <View style={[styles.settingIconContainer, { backgroundColor: colors.infoLight }]}>
                <Upload size={18} color={colors.info} />
              </View>
              <View>
                <Text style={[styles.settingText, { color: colors.text }]}>Import Links</Text>
                <Text style={[styles.settingSubtext, { color: colors.textTertiary }]}>
                  Restore from backup
                </Text>
              </View>
            </View>
          </Pressable>
        </View>
      </View>

      <Text style={[styles.version, { color: colors.textTertiary }]}>
        Save It • Version 1.0.0
      </Text>

      {/* Import Modal */}
      <Modal
        visible={importModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImportModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Import Links</Text>
              <Pressable
                onPress={() => setImportModalVisible(false)}
                style={({ pressed }) => pressed && { opacity: 0.6 }}
              >
                <X size={24} color={colors.textSecondary} />
              </Pressable>
            </View>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Paste your exported JSON data below:
            </Text>
            <TextInput
              style={[
                styles.importInput,
                {
                  backgroundColor: colors.backgroundSecondary,
                  color: colors.text,
                  borderColor: colors.border,
                }
              ]}
              multiline
              numberOfLines={8}
              placeholder='[{"url": "...", "title": "..."}]'
              placeholderTextColor={colors.textTertiary}
              value={importText}
              onChangeText={setImportText}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.backgroundSecondary }]}
                onPress={() => setImportModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={processImport}
              >
                <Text style={[styles.modalButtonText, { color: colors.textOnPrimary }]}>Import</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '600',
    padding: 16,
    paddingBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: 8,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
    position: 'relative',
  },
  themeOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  themeCheckmark: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingRowPressable: {
    marginHorizontal: 0,
    borderRadius: 0,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtext: {
    fontSize: 13,
    marginTop: 2,
  },
  settingDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 66,
  },
  reminderSection: {
    padding: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  reminderLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  reminderOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  reminderOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  reminderOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reminderHelper: {
    fontSize: 12,
    lineHeight: 16,
  },
  version: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalSubtitle: {
    fontSize: 14,
  },
  importInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    minHeight: 150,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});