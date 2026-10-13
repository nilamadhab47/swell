const PLAY_LISTING = 'https://play.google.com/store/apps/details?id=com.swell.quit';

export function shareWinMessage({
  beatenThisWeek,
  daysClear,
  brand = 'Swell',
}: {
  beatenThisWeek: number;
  daysClear: number;
  brand?: string;
}): string {
  const week =
    beatenThisWeek === 1
      ? '1 craving this week'
      : `${Math.max(0, beatenThisWeek)} cravings this week`;
  const days =
    daysClear === 1 ? '1 day clear' : `${Math.max(0, daysClear)} days clear`;
  return `${week}. ${days}. I rode it out with ${brand} — three minutes, then it was gone.\n${PLAY_LISTING}`;
}
