import { Minus, Plus } from 'lucide-react';

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  label = 'Quantity',
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label?: string;
}) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Decrease">
        <Minus />
      </button>
      <span className="stepper__val" aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Increase">
        <Plus />
      </button>
    </div>
  );
}
