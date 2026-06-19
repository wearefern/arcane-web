import { cn } from '../../lib/cn';

/** The ARCANE wordmark — intentionally small and quiet. A thin champagne "A"
 *  glyph beside letter-spaced type. Never used as a large centered logo. */
export function Wordmark({
  suffix,
  size = 'md',
  className,
}: {
  suffix?: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <span className={cn('wordmark', `wordmark--${size}`, className)} aria-label={`Arcane${suffix ? ' ' + suffix : ''}`}>
      <span className="wordmark__text">ARCANE</span>
      {suffix && <span className="wordmark__suffix">{suffix}</span>}
    </span>
  );
}
