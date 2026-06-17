/* =========================================================================
   ARCANE — Private service helpers. Simulated latency + deep cloning so the
   in-memory datasets are never mutated by accident through a read.
   ========================================================================= */

/** Resolve after a simulated network delay (default 320ms). */
export function delay(ms = 320): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Deep copy, so callers can mutate results without touching the mock store. */
export function clone<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

/** A short, uppercase alphanumeric run (used for references/tokens). */
export function randomCode(length: number, alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

/** Lowercase case-insensitive "contains" that tolerates undefined haystacks. */
export function matches(haystack: string | undefined | null, needle: string): boolean {
  if (!haystack) return false;
  return haystack.toLowerCase().includes(needle.toLowerCase());
}
