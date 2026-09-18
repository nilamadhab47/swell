const MAX_CHARS = 72;

/** Turn the onboarding reason into one calm Victory line, or null. */
export function victoryWhyLine(reason: string | undefined | null): string | null {
  const raw = (reason ?? '').replace(/\s+/g, ' ').trim();
  if (raw.length < 2) return null;

  const clipped = clipAtWord(raw, MAX_CHARS);
  const lower = clipped.toLowerCase();
  const body = stripTrailingPunctuation(clipped);

  if (/^(for|because)\b/.test(lower)) {
    return `You did that ${uncapitalize(body)}.`;
  }

  if (/^i\s+(want|need|hope|wish|promised)\b/i.test(body)) {
    return `You did that because ${uncapitalize(body)}.`;
  }

  return `You did that for ${body}.`;
}

/** Show the why on odd wins (1st, 3rd, …) so it stays special. */
export function shouldShowVictoryWhy(winCount: number): boolean {
  return winCount > 0 && winCount % 2 === 1;
}

function clipAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > max * 0.5 ? slice.slice(0, lastSpace) : slice;
  return `${cut.trimEnd()}…`;
}

function stripTrailingPunctuation(text: string): string {
  return text.replace(/[.!?]+$/u, '').trim();
}

function uncapitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}
