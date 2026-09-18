export interface MoneyComparison {
  label: string;
  cost: number;
}

const INR_COMPARISONS: MoneyComparison[] = [
  { label: 'a cup of chai', cost: 20 },
  { label: 'a movie ticket', cost: 200 },
  { label: 'a week of snacks', cost: 350 },
  { label: 'a nice dinner out', cost: 800 },
];

export function formatMoney(amount: number, currency = 'INR'): string {
  if (currency === 'INR') {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  }
  return `${Math.round(amount).toLocaleString()} ${currency}`;
}

export function formatTimeSaved(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (remainder === 0) return `${hours}h`;
  return `${hours}h ${remainder}m`;
}

export function formatDays(days: number): string {
  if (days === 1) return '1 day';
  return `${days} days`;
}

/** Turns reclaimed money into something tangible, e.g. "₹520 ≈ 2 weeks of chai". */
export function moneyInRealTerms(
  amount: number,
  currency = 'INR'
): string | null {
  if (amount <= 0 || currency !== 'INR') return null;

  const chaiDaily = 40; // ~2 cups × ₹20
  const chaiDays = amount / chaiDaily;
  if (chaiDays >= 6) {
    const weeks = Math.max(1, Math.round(chaiDays / 7));
    return `${formatMoney(amount)} ≈ ${weeks} week${weeks === 1 ? '' : 's'} of chai`;
  }

  for (let i = INR_COMPARISONS.length - 1; i >= 0; i--) {
    const item = INR_COMPARISONS[i];
    const count = Math.floor(amount / item.cost);
    if (count >= 1) {
      const plural = count === 1 ? item.label : pluralize(item.label);
      return `${formatMoney(amount)} = ${count} ${plural}`;
    }
  }

  return null;
}

function pluralize(label: string): string {
  if (label.startsWith('a ')) return label.replace(/^a /, '');
  return label;
}

export function pickDailyQuote(quotes: string[]): string {
  if (quotes.length === 0) return '';
  const dayIndex = Math.floor(Date.now() / 86_400_000) % quotes.length;
  return quotes[dayIndex];
}

/** Placeholder insight until Anthropic ships — grounded in current milestone. */
export function buildProgressInsight(
  currentMilestoneLabel: string | undefined,
  beatenThisWeek: number
): string {
  if (beatenThisWeek >= 5) {
    return `You've beaten ${beatenThisWeek} cravings this week. That rhythm is building a new habit.`;
  }
  if (currentMilestoneLabel) {
    return `Your body is working through "${currentMilestoneLabel}". Every craving you beat buys it more time.`;
  }
  return 'Patterns will emerge as you log more wins. For now, just keep showing up.';
}
