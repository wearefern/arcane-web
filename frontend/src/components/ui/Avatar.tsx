import { initials } from '../../lib/format';
import { cn } from '../../lib/cn';

export function Avatar({ name, sm }: { name: string; sm?: boolean }) {
  return (
    <span className={cn('avatar', sm && 'avatar--sm')} title={name} aria-hidden>
      {initials(name)}
    </span>
  );
}
