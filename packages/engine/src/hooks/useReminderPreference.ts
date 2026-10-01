import { create } from 'zustand';
import {
  parseRemindersEnabled,
  REMINDERS_STORAGE_KEY,
} from './reminders';

interface ReminderPreferenceStore {
  hydrated: boolean;
  enabled: boolean;
  hydrate: () => Promise<void>;
  setEnabled: (on: boolean) => Promise<void>;
}

async function storage() {
  try {
    return await import('expo-secure-store');
  } catch {
    return null;
  }
}

export const useReminderPreference = create<ReminderPreferenceStore>((set) => ({
  hydrated: false,
  enabled: true,

  hydrate: async () => {
    try {
      const ss = await storage();
      const raw = ss ? await ss.getItemAsync(REMINDERS_STORAGE_KEY) : null;
      set({
        enabled: parseRemindersEnabled(raw),
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  setEnabled: async (on) => {
    set({ enabled: on });
    try {
      const ss = await storage();
      await ss?.setItemAsync(REMINDERS_STORAGE_KEY, on ? '1' : '0');
    } catch {
      // Preference still applies in-memory this session.
    }
  },
}));
