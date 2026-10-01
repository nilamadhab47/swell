export const REMINDERS_STORAGE_KEY = 'swell.reminders.enabled';

/** Stored as `'1'` / `'0'`. Missing value defaults to on. */
export function parseRemindersEnabled(raw: string | null | undefined): boolean {
  return raw !== '0';
}
