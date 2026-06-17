import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface DLItem {
  key: ReactNode;
  value: ReactNode;
  mono?: boolean;
}

export function DefinitionList({ items, className }: { items: DLItem[]; className?: string }) {
  return (
    <dl className={cn('dl', className)}>
      {items.map((it, i) => (
        <div className="dl__row" key={i}>
          <dt className="dl__key">{it.key}</dt>
          <dd className={cn('dl__val', it.mono && 'dl__val--mono')}>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
