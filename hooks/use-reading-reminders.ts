import { useCallback, useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { useLinksStore } from '@/stores/links';
import { useReminderStore } from '@/stores/reminders';
import {
  ensureReminderPermissions,
  configureReminderChannel,
  scheduleDailyReminder,
  cancelReminder,
} from '@/utils/reminders';

export function useReadingReminders() {
  const links = useLinksStore((state) => state.links);
  const {
    enabled,
    reminderTime,
    scheduledNotificationId,
    setEnabled,
    setLastScheduledAt,
    setScheduledNotificationId,
  } = useReminderStore();

  const pendingCount = links.filter((link) => link.status !== 'completed').length;
  const isSupported = Platform.OS !== 'web';

  const refreshSchedule = useCallback(async () => {
    if (!isSupported) {
      return;
    }
    if (!enabled || pendingCount === 0) {
      await cancelReminder(scheduledNotificationId);
      setScheduledNotificationId(null);
      setLastScheduledAt(null);
      return;
    }

    const permitted = await ensureReminderPermissions();
    if (!permitted) {
      setEnabled(false);
      setLastScheduledAt(null);
      setScheduledNotificationId(null);
      return;
    }

    await configureReminderChannel();
    await cancelReminder(scheduledNotificationId);
    const identifier = await scheduleDailyReminder({
      reminderTime,
      body:
        pendingCount === 1
          ? 'You have 1 link waiting for your attention.'
          : `You have ${pendingCount} links waiting for your attention.`,
    });
    setScheduledNotificationId(identifier);
    setLastScheduledAt(new Date().toISOString());
  }, [
    enabled,
    isSupported,
    pendingCount,
    reminderTime,
    scheduledNotificationId,
    setEnabled,
    setLastScheduledAt,
    setScheduledNotificationId,
  ]);

  useEffect(() => {
    if (!isSupported) {
      return;
    }
    refreshSchedule();
  }, [isSupported, refreshSchedule]);

  useEffect(() => {
    if (!isSupported) {
      return;
    }
    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refreshSchedule();
      }
    });

    return () => listener.remove();
  }, [isSupported, refreshSchedule]);
}
