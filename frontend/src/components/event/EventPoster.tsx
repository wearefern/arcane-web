import type { CSSProperties, ReactNode } from 'react';
import type { EventTone } from '../../types';
import { cn } from '../../lib/cn';

/** A cinematic, muted duotone field standing in for event artwork.
 *  Deterministic per tone — never bright, always dark enough for overlaid text. */
export function EventPoster({
  tone,
  image,
  watermark,
  className,
  children,
  style,
}: {
  tone: EventTone;
  image?: string;
  watermark?: string;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  const posterStyle = image
    ? ({ ...style, '--poster-img': `url(${image})` } as CSSProperties)
    : style;
  return (
    <div className={cn('poster', `poster--${tone}`, image && 'poster--photo', className)} style={posterStyle}>
      {watermark && !image && (
        <span className="poster__watermark" aria-hidden>
          {watermark}
        </span>
      )}
      {children}
    </div>
  );
}
