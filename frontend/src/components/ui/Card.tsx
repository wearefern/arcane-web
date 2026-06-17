import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  pad?: 'none' | 'sm' | 'md' | 'lg';
  quiet?: boolean;
  hover?: boolean;
  children: ReactNode;
}

export function Card({ pad = 'md', quiet, hover, className, children, ...rest }: CardProps) {
  const padClass =
    pad === 'none' ? '' : pad === 'sm' ? 'card--pad-sm' : pad === 'lg' ? 'card--pad-lg' : 'card--pad';
  return (
    <div
      className={cn('card', padClass, quiet && 'card--quiet', hover && 'card--hover', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function SectionHead({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="section-head__title">{title}</h2>
        {sub && <p className="section-head__sub">{sub}</p>}
      </div>
      {action && <div className="row" style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
