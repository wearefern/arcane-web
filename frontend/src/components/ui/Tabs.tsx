import { cn } from '../../lib/cn';

interface Item {
  value: string;
  label: string;
}

export function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: Item[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={cn('tabs', className)} role="tablist">
      {items.map((it) => (
        <button
          key={it.value}
          role="tab"
          aria-selected={value === it.value}
          className={cn('tabs__item', value === it.value && 'is-active')}
          onClick={() => onChange(it.value)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

export function Segmented({
  items,
  value,
  onChange,
  className,
  'aria-label': ariaLabel,
}: {
  items: Item[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
  'aria-label'?: string;
}) {
  return (
    <div className={cn('segmented', className)} role="group" aria-label={ariaLabel}>
      {items.map((it) => (
        <button
          key={it.value}
          className={cn('segmented__item', value === it.value && 'is-active')}
          aria-pressed={value === it.value}
          onClick={() => onChange(it.value)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
