/* Formatting helpers — currency (LKR), dates, numbers. Locale: Sri Lanka. */

/** The mock catalogue is anchored to mid-2025; relative time is measured from
 *  here (not the wall clock) so the demo timeline stays coherent. Matches the
 *  REFERENCE_NOW used inside the services layer. */
export const REFERENCE_NOW = '2025-06-16T12:00:00+05:30';
const NOW_MS = Date.parse(REFERENCE_NOW);

const LKR = new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 });

/** "Rs 12,500" — premium, no trailing decimals. */
export function formatLkr(amount: number): string {
  return `Rs ${LKR.format(Math.round(amount))}`;
}

/** "12,500" */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

/** "12.5K" / "1.2M" — compact for stats. */
export function formatCompact(n: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function d(input: string | Date): Date {
  return input instanceof Date ? input : new Date(input);
}

/** "Sat · 12 Jul 2025" */
export function formatDate(input: string | Date): string {
  const x = d(input);
  return `${DAYS[x.getDay()]} · ${x.getDate()} ${MONTHS[x.getMonth()]} ${x.getFullYear()}`;
}

/** "Saturday, 12 July 2025" */
export function formatDateLong(input: string | Date): string {
  const x = d(input);
  const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][x.getDay()];
  return `${day}, ${x.getDate()} ${MONTHS_LONG[x.getMonth()]} ${x.getFullYear()}`;
}

/** "12 Jul" */
export function formatDateShort(input: string | Date): string {
  const x = d(input);
  return `${x.getDate()} ${MONTHS[x.getMonth()]}`;
}

/** "9:00 PM" */
export function formatTime(input: string | Date): string {
  const x = d(input);
  let h = x.getHours();
  const m = x.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

/** "12 Jul 2025, 9:00 PM" */
export function formatDateTime(input: string | Date): string {
  const x = d(input);
  return `${x.getDate()} ${MONTHS[x.getMonth()]} ${x.getFullYear()}, ${formatTime(x)}`;
}

/** Relative time, past or near future: "just now", "5m ago", "in 3d". */
export function formatRelative(input: string | Date): string {
  const x = d(input);
  const diff = x.getTime() - NOW_MS;
  const abs = Math.abs(diff);
  const min = 60_000;
  const hr = 60 * min;
  const day = 24 * hr;
  const fmt = (v: number, unit: string) => {
    const n = Math.round(v);
    return diff < 0 ? `${n}${unit} ago` : `in ${n}${unit}`;
  };
  if (abs < min) return 'just now';
  if (abs < hr) return fmt(abs / min, 'm');
  if (abs < day) return fmt(abs / hr, 'h');
  if (abs < 7 * day) return fmt(abs / day, 'd');
  return formatDate(x);
}

/** Days until a future date (floored). */
export function daysUntil(input: string | Date): number {
  return Math.ceil((d(input).getTime() - NOW_MS) / 86_400_000);
}

/** Initials from a name: "Imran Wickrama" → "IW". */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

/** "1 ticket" / "3 tickets". */
export function plural(n: number, singular: string, pluralForm?: string): string {
  return `${n} ${n === 1 ? singular : pluralForm ?? singular + 's'}`;
}
