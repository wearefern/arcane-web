import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Mail, CalendarDays, MapPin, Hash } from 'lucide-react';
import type { Ticket } from '../../types';
import { getTicket } from '../../services/ticketsService';
import { TicketCredential } from '../../components/ticket/TicketCredential';
import { DefinitionList } from '../../components/ui/DefinitionList';
import { LoadingBlock, StateBlock } from '../../components/ui/Feedback';
import { buttonClass } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { formatDateLong, formatDateTime } from '../../lib/format';

export default function TicketView() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    if (!id) return;
    let active = true;
    getTicket(id)
      .then((t) => {
        if (!active) return;
        if (!t) setStatus('missing');
        else {
          setTicket(t);
          setStatus('ready');
        }
      })
      .catch(() => active && setStatus('missing'));
    return () => {
      active = false;
    };
  }, [id]);

  if (status === 'loading') return <div className="container section"><LoadingBlock label="Loading ticket…" /></div>;
  if (status === 'missing' || !ticket)
    return (
      <div className="container section">
        <StateBlock
          title="Ticket not found"
          body="Check the link, or look it up from My Tickets."
          action={<Link to="/tickets" className={buttonClass('ghost')}>Find my tickets</Link>}
        />
      </div>
    );

  return (
    <section className="container container--narrow section">
      <Link to="/tickets" className="row" style={{ gap: 8, color: 'var(--text-3)', fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-6)' }}>
        <ArrowLeft size={16} /> My tickets
      </Link>

      <div style={{ maxWidth: 480, marginInline: 'auto' }}>
        <TicketCredential ticket={ticket} />

        {ticket.status === 'used' && ticket.usedAt && (
          <p className="meta t-center" style={{ marginTop: 'var(--space-4)' }}>
            Checked in {formatDateTime(ticket.usedAt)}{ticket.gate ? ` · ${ticket.gate}` : ''}
          </p>
        )}
        {ticket.status === 'void' && (
          <p className="t-center" style={{ marginTop: 'var(--space-4)', color: 'var(--oxblood-300)', fontSize: 'var(--fs-sm)' }}>
            This ticket has been voided and will not be admitted.
          </p>
        )}

        <div className="card card--pad" style={{ marginTop: 'var(--space-6)' }}>
          <p className="eyebrow eyebrow--plain" style={{ color: 'var(--text-3)' }}>Event</p>
          <DefinitionList
            items={[
              { key: <span className="row" style={{ gap: 8 }}><CalendarDays size={14} /> Date</span>, value: formatDateLong(ticket.eventDate) },
              { key: <span className="row" style={{ gap: 8 }}><MapPin size={14} /> Venue</span>, value: ticket.venue },
              { key: <span className="row" style={{ gap: 8 }}><Hash size={14} /> Order</span>, value: ticket.orderRef, mono: true },
            ]}
          />
        </div>

        <div className="card card--pad" style={{ marginTop: 'var(--space-4)' }}>
          <p className="eyebrow eyebrow--plain" style={{ color: 'var(--text-3)' }}>Ticket holder</p>
          <DefinitionList
            items={[
              { key: 'Name', value: ticket.buyerName },
              { key: 'Email', value: ticket.buyerEmail },
              { key: 'Type', value: ticket.ticketTypeName },
            ]}
          />
        </div>

        <div className="row" style={{ gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
          <button
            className={buttonClass('gold', 'md', 'btn--block')}
            onClick={() => toast({ tone: 'gold', title: 'Preparing your ticket', body: 'Your PDF download will begin shortly.' })}
          >
            <Download size={16} /> Download
          </button>
          <button
            className={buttonClass('ghost', 'md', 'btn--block')}
            onClick={() => toast({ tone: 'success', title: 'Ticket re-sent', body: `Sent to ${ticket.buyerEmail}.` })}
          >
            <Mail size={16} /> Email me
          </button>
        </div>
      </div>
    </section>
  );
}
