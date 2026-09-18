export type HabitKind = 'smoke' | 'vape' | 'both';

export const HABIT_OPTIONS: { id: HabitKind; label: string }[] = [
  { id: 'smoke', label: 'Cigarettes' },
  { id: 'vape', label: 'Vape' },
  { id: 'both', label: 'Both' },
];

export function parseHabit(value: string): HabitKind | '' {
  if (value === 'smoke' || value === 'vape' || value === 'both') return value;
  const match = HABIT_OPTIONS.find(
    (option) => option.label.toLowerCase() === value.trim().toLowerCase()
  );
  return match?.id ?? '';
}

export function habitLabel(habit: HabitKind | ''): string {
  return HABIT_OPTIONS.find((option) => option.id === habit)?.label ?? 'Not set';
}

export function unitsPrompt(habit: HabitKind | ''): string {
  if (habit === 'vape') return 'How many sessions a day?';
  if (habit === 'both') return 'How many hits a day (cigs + vape)?';
  return 'How many cigarettes a day?';
}

export function costPrompt(habit: HabitKind | ''): string {
  if (habit === 'vape') return 'What does a pod or coil cost (₹)?';
  if (habit === 'both') return 'Typical daily spend (₹)?';
  return 'What does a pack cost (₹)?';
}

export function unitsSettingsTitle(habit: HabitKind | ''): string {
  if (habit === 'vape') return 'Sessions a day';
  if (habit === 'both') return 'Hits a day';
  return 'Cigarettes a day';
}

export function costSettingsTitle(habit: HabitKind | ''): string {
  if (habit === 'vape') return 'What a pod cost';
  if (habit === 'both') return 'Daily spend';
  return 'What a pack cost';
}
