import type { CSSProperties, ReactNode } from 'react';
import type { EventTone } from '../../types';
import { cn } from '../../lib/cn';

/** A cinematic, muted duotone field standing in for event artwork.
 *  Deterministic per tone — never bright, always dark enough for overlaid text. */
export function EventPoster({
  tone,
  watermark,
  className,
  children,
  style,
}: {
  tone: EventTone;
  watermark?: string;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div className={cn('poster', `poster--${tone}`, className)} style={style}>
      {watermark && (
        <span className="poster__watermark" aria-hidden>
          {watermark}
        </span>
      )}
      {children}
    </div>
  );
}
