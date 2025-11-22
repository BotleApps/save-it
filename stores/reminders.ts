import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ReminderFrequency = 'daily';

interface ReminderState {
  enabled: boolean;
  reminderTime: string; // HH:mm
  frequency: ReminderFrequency;
  lastScheduledAt: string | null;
  scheduledNotificationId: string | null;
  setEnabled: (value: boolean) => void;
  setReminderTime: (time: string) => void;
  setFrequency: (frequency: ReminderFrequency) => void;
  setLastScheduledAt: (value: string | null) => void;
  setScheduledNotificationId: (value: string | null) => void;
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set) => ({
      enabled: false,
      reminderTime: '20:00',
      frequency: 'daily',
      lastScheduledAt: null,
      scheduledNotificationId: null,
      setEnabled: (value) => set({ enabled: value }),
      setReminderTime: (time) => set({ reminderTime: time }),
      setFrequency: (frequency) => set({ frequency }),
      setLastScheduledAt: (value) => set({ lastScheduledAt: value }),
      setScheduledNotificationId: (value) => set({ scheduledNotificationId: value }),
    }),
    {
      name: 'reading-reminder-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
