import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Tone = 'neutral' | 'gold' | 'emerald' | 'oxblood' | 'amber' | 'slate';

export function Badge({
  tone = 'neutral',
  dot,
  children,
  className,
}: {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn('badge', tone !== 'neutral' && `badge--${tone}`, className)}>
      {dot && <span className="dot" aria-hidden />}
      {children}
    </span>
  );
}

/* Domain status → tone + label. One source of truth for every status pill. */
const MAP: Record<string, Record<string, { tone: Tone; label: string }>> = {
  event: {
    published: { tone: 'emerald', label: 'Published' },
    draft: { tone: 'neutral', label: 'Draft' },
    paused: { tone: 'amber', label: 'Paused' },
    unpublished: { tone: 'slate', label: 'Unpublished' },
  },
  ticketType: {
    active: { tone: 'emerald', label: 'On sale' },
    paused: { tone: 'amber', label: 'Paused' },
    sold_out: { tone: 'oxblood', label: 'Sold out' },
    scheduled: { tone: 'slate', label: 'Scheduled' },
  },
  order: {
    paid: { tone: 'emerald', label: 'Paid' },
    pending: { tone: 'amber', label: 'Pending' },
    failed: { tone: 'oxblood', label: 'Failed' },
    refunded: { tone: 'slate', label: 'Refunded' },
    cancelled: { tone: 'neutral', label: 'Cancelled' },
  },
  payment: {
    success: { tone: 'emerald', label: 'Success' },
    pending: { tone: 'amber', label: 'Pending' },
    failed: { tone: 'oxblood', label: 'Failed' },
  },
  ticket: {
    valid: { tone: 'emerald', label: 'Valid' },
    used: { tone: 'slate', label: 'Used' },
    void: { tone: 'oxblood', label: 'Void' },
  },
  account: {
    active: { tone: 'emerald', label: 'Active' },
    invited: { tone: 'amber', label: 'Invited' },
    disabled: { tone: 'neutral', label: 'Disabled' },
  },
  role: {
    owner: { tone: 'gold', label: 'Owner' },
    manager: { tone: 'slate', label: 'Manager' },
    staff: { tone: 'neutral', label: 'Staff' },
    gate_lead: { tone: 'gold', label: 'Gate lead' },
    scanner: { tone: 'neutral', label: 'Scanner' },
  },
};

export function StatusBadge({
  kind,
  value,
  dot = true,
}: {
  kind: keyof typeof MAP;
  value: string;
  dot?: boolean;
}) {
  const entry = MAP[kind]?.[value] ?? { tone: 'neutral' as Tone, label: value };
  return (
    <Badge tone={entry.tone} dot={dot}>
      {entry.label}
    </Badge>
  );
}
