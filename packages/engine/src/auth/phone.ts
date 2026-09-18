/** India-first phone helpers. 10 digits become +91. */

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function toE164Phone(value: string): string {
  const digits = digitsOnly(value);
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (value.trim().startsWith('+') && digits.length >= 8) return `+${digits}`;
  return `+${digits}`;
}

export function isSimpleMobile(value: string): boolean {
  const digits = digitsOnly(value);
  return digits.length === 10 || (digits.length === 12 && digits.startsWith('91'));
}

export function formatLocalPhone(value: string): string {
  const digits = digitsOnly(value).replace(/^91/, '').slice(0, 10);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}
