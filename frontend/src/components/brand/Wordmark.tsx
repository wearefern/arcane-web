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
  const glyph = size === 'sm' ? 18 : 22;
  return (
    <span className={cn('wordmark', `wordmark--${size}`, className)} aria-label={`Arcane${suffix ? ' ' + suffix : ''}`}>
      <svg width={glyph} height={glyph} viewBox="0 0 32 32" fill="none" aria-hidden focusable="false">
        <path d="M16 6.4 L9.4 25.6" stroke="var(--gold-400)" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 6.4 L22.6 25.6" stroke="var(--gold-400)" strokeWidth="2" strokeLinecap="round" />
        <path d="M12.3 18.9 L19.7 18.9" stroke="var(--gold-400)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="wordmark__text">Arcane</span>
      {suffix && <span className="wordmark__suffix">{suffix}</span>}
    </span>
  );
}
