import type { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../lib/cn';

export function StatCard({
  label,
  icon,
  value,
  unit,
  trend,
  foot,
  accent,
}: {
  label: string;
  icon?: ReactNode;
  value: ReactNode;
  unit?: string;
  trend?: number;
  foot?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className={cn('stat', accent && 'stat--accent')}>
      <div className="stat__label">
        {icon}
        {label}
      </div>
      <div className="stat__value">
        {unit && <span className="unit">{unit}</span>}
        {value}
      </div>
      <div className="stat__foot">
        {typeof trend === 'number' && (
          <span className={cn(trend >= 0 ? 'stat__trend--up' : 'stat__trend--down')} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(trend)}%
          </span>
        )}
        {foot}
      </div>
    </div>
  );
}

export function Meter({ value, max, low }: { value: number; max: number; low?: boolean }) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  const isLow = low ?? pct <= 15;
  return (
    <div className={cn('meter', isLow && 'meter--low')} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="meter__fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
