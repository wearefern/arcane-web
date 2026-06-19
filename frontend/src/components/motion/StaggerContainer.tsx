import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function StaggerContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('stagger-container', className)} style={{ '--stagger-step': '70ms' } as CSSProperties}>{children}</div>;
}
