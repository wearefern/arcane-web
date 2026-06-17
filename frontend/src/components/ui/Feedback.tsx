import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function Spinner({ lg, className }: { lg?: boolean; className?: string }) {
  return <span className={cn('spinner', lg && 'spinner--lg', className)} role="status" aria-label="Loading" />;
}

export function Skeleton({
  w,
  h = 16,
  radius,
  className,
  style,
}: {
  w?: number | string;
  h?: number | string;
  radius?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={cn('skeleton', className)}
      style={{ display: 'block', width: w ?? '100%', height: h, borderRadius: radius, ...style }}
      aria-hidden
    />
  );
}

/** Centered state used for empty / error screens. */
export function StateBlock({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="state">
      {icon && <div className="state__icon">{icon}</div>}
      <h3 className="state__title">{title}</h3>
      {body && <p className="state__body">{body}</p>}
      {action && <div style={{ marginTop: 'var(--space-2)' }}>{action}</div>}
    </div>
  );
}

/** Loading state with spinner + message. */
export function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <Spinner lg />
      <p className="state__body" style={{ marginTop: 'var(--space-2)' }}>{label}</p>
    </div>
  );
}
