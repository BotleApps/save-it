import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const CHANNEL_ID = 'reading-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureReminderPermissions() {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted || existing.ios?.status === Notifications.AuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return (
    requested.granted || requested.ios?.status === Notifications.AuthorizationStatus.PROVISIONAL
  );
}

export async function configureReminderChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Reading reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: undefined,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}

interface ReminderScheduleParams {
  reminderTime: string; // HH:mm
  body?: string;
}

export async function scheduleDailyReminder({ reminderTime, body }: ReminderScheduleParams) {
  const [hours, minutes] = reminderTime.split(':').map((value) => parseInt(value, 10));

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Catch up on your reading',
      body: body ?? 'Finish a link you saved earlier today.',
      sound: undefined,
    },
    trigger: {
      repeats: true,
      hour: hours,
      minute: minutes,
    },
  });

  return identifier;
}

export async function cancelReminder(identifier: string | null) {
  if (!identifier) {
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {
    // Ignore missing notification errors.
  }
}
