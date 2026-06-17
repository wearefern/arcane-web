import type { ReactNode } from 'react';
import type { Ticket } from '../../types';
import { StatusBadge } from '../ui/Badge';
import { QRCode } from './QRCode';
import { formatDateLong, formatDateTime, formatDateShort } from '../../lib/format';
import { cn } from '../../lib/cn';

function Cell({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div>
      <p className="cred-cell__label">{label}</p>
      <p className={cn('cred-cell__value', mono && 'cred-cell__value--mono')}>{value}</p>
    </div>
  );
}

/** The signature element: a ticket rendered as a luxury access credential. */
export function TicketCredential({
  ticket,
  compact,
  showQR = true,
}: {
  ticket: Ticket;
  compact?: boolean;
  showQR?: boolean;
}) {
  return (
    <article className={cn('credential', compact && 'credential--compact')}>
      <div className="credential__head">
        <div>
          <p className="eyebrow eyebrow--plain" style={{ color: 'var(--gold-500)' }}>
            {ticket.ticketTypeName}
          </p>
          <h3 className="credential__event" style={{ marginTop: 'var(--space-2)' }}>
            {ticket.eventTitle}
          </h3>
          <p className="credential__sub">
            {formatDateLong(ticket.eventDate)} · {ticket.venue}
          </p>
        </div>
        <StatusBadge kind="ticket" value={ticket.status} />
      </div>

      <div className="credential__grid">
        <Cell label="Holder" value={ticket.buyerName} />
        <Cell label="Order" value={ticket.orderRef} mono />
        {ticket.seat ? <Cell label="Seat" value={ticket.seat} /> : <Cell label="Admit" value="One guest" />}
        <Cell
          label={ticket.status === 'used' ? 'Checked in' : 'Issued'}
          value={ticket.status === 'used' && ticket.usedAt ? formatDateTime(ticket.usedAt) : formatDateShort(ticket.issuedAt)}
        />
      </div>

      <div className="credential__perf" aria-hidden />

      <div className="credential__stub">
        <div>
          <p className="credential__admit">Admit One · {ticket.gate ?? 'Gate TBA'}</p>
          <p className="credential__id">{ticket.id}</p>
        </div>
        {showQR && <QRCode value={ticket.token} size={compact ? 84 : 104} />}
      </div>
    </article>
  );
}
