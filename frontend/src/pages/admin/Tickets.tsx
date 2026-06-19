import { useEffect, useMemo, useState } from 'react';
import { Search, Ban, Mail } from 'lucide-react';
import type { EventItem, Ticket, TicketStatus } from '../../types';
import { listTickets, voidTicket, resendTicketEmail } from '../../services/ticketsService';
import { listAllEvents } from '../../services/eventsService';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Input, Select } from '../../components/ui/Field';
import { Skeleton, StateBlock } from '../../components/ui/Feedback';
import { Pagination } from '../../components/ui/Pagination';
import { useToast } from '../../components/ui/Toast';
import { formatDateTime } from '../../lib/format';

type StatusFilter = TicketStatus | 'all';

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'valid', label: 'Valid' },
  { value: 'used', label: 'Used' },
  { value: 'void', label: 'Void' },
];

export default function Tickets() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [eventId, setEventId] = useState('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState<{ id: string; action: 'void' | 'resend' } | null>(null);

  // Event filter options load once.
  useEffect(() => {
    let active = true;
    listAllEvents()
      .then((rows) => active && setEvents(rows))
      .catch(() => {
        /* non-fatal: the event filter simply stays empty */
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    /* eslint-disable react-hooks/set-state-in-effect -- intentional reset keyed on filters before fetch */
    setTickets(null);
    setError(false);
    setPage(1); // new filter set → back to the first page
    /* eslint-enable react-hooks/set-state-in-effect */
    listTickets({ search, eventId: eventId === 'all' ? undefined : eventId, status })
      .then((rows) => active && setTickets(rows))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [search, eventId, status]);

  const pageCount = tickets ? Math.max(1, Math.ceil(tickets.length / PAGE_SIZE)) : 1;
  const pageRows = useMemo(() => {
    if (!tickets) return [];
    const start = (page - 1) * PAGE_SIZE;
    return tickets.slice(start, start + PAGE_SIZE);
  }, [tickets, page]);

  async function onVoid(t: Ticket) {
    setBusy({ id: t.id, action: 'void' });
    try {
      await voidTicket(t.id);
      setTickets((prev) =>
        prev ? prev.map((x) => (x.id === t.id ? { ...x, status: 'void' } : x)) : prev,
      );
      toast({ tone: 'success', title: 'Ticket voided', body: t.id });
    } catch {
      toast({ tone: 'error', title: "Couldn't void ticket", body: t.id });
    } finally {
      setBusy(null);
    }
  }

  async function onResend(t: Ticket) {
    setBusy({ id: t.id, action: 'resend' });
    try {
      await resendTicketEmail(t.id);
      toast({ tone: 'success', title: 'Ticket resent', body: t.buyerEmail });
    } catch {
      toast({ tone: 'error', title: "Couldn't resend ticket", body: t.id });
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="adminhead">
        <div>
          <h1 className="adminhead__title">Tickets</h1>
          <p className="adminhead__sub">Every issued credential — void compromised tickets or resend them to buyers.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar__search">
          <Input
            icon={<Search size={16} />}
            placeholder="Search ticket ID, buyer, or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search tickets"
          />
        </div>
        <Select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          aria-label="Filter by event"
        >
          <option value="all">All events</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.title}</option>
          ))}
        </Select>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </div>

      {error ? (
        <StateBlock
          title="We couldn't load tickets"
          body="Something went wrong fetching tickets. Refresh to try again."
        />
      ) : (
        <>
          <div className="table-wrap">
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Event</th>
                    <th>Buyer</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Used at</th>
                    <th className="cell-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets === null ? (
                    Array.from({ length: PAGE_SIZE }).map((_, i) => (
                      <tr key={i}>
                        <td><Skeleton w={104} h={13} /></td>
                        <td><Skeleton w={140} h={13} /></td>
                        <td>
                          <Skeleton w="70%" h={13} />
                          <Skeleton w="50%" h={11} style={{ marginTop: 8 }} />
                        </td>
                        <td><Skeleton w={80} h={13} /></td>
                        <td><Skeleton w={72} h={20} radius={999} /></td>
                        <td><Skeleton w={120} h={13} /></td>
                        <td className="cell-actions"><Skeleton w={140} h={32} /></td>
                      </tr>
                    ))
                  ) : pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: 0 }}>
                        <StateBlock
                          title="No tickets match"
                          body="Adjust your search or clear the filters to see more."
                        />
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((t) => (
                      <tr key={t.id}>
                        <td className="cell-mono">{t.id}</td>
                        <td>
                          <div className="truncate" style={{ maxWidth: 180 }}>{t.eventTitle}</div>
                        </td>
                        <td>
                          <div className="cell-strong">{t.buyerName}</div>
                          <div className="meta truncate" style={{ marginTop: 2, maxWidth: 200 }}>{t.buyerEmail}</div>
                        </td>
                        <td>{t.ticketTypeName}</td>
                        <td><StatusBadge kind="ticket" value={t.status} /></td>
                        <td className="mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-3)' }}>
                          {t.usedAt ? formatDateTime(t.usedAt) : '—'}
                        </td>
                        <td className="cell-actions">
                          <div className="row" style={{ gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              loading={busy?.id === t.id && busy.action === 'resend'}
                              disabled={busy?.id === t.id}
                              onClick={() => onResend(t)}
                            >
                              <Mail size={14} /> Resend
                            </Button>
                            {t.status !== 'void' && (
                              <Button
                                variant="danger"
                                size="sm"
                                loading={busy?.id === t.id && busy.action === 'void'}
                                disabled={busy?.id === t.id}
                                onClick={() => onVoid(t)}
                              >
                                <Ban size={14} /> Void
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {tickets && tickets.length > PAGE_SIZE && (
            <div className="row row--between" style={{ marginTop: 'var(--space-5)' }}>
              <span className="meta">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, tickets.length)} of {tickets.length}
              </span>
              <Pagination page={page} pageCount={pageCount} onChange={setPage} />
            </div>
          )}
        </>
      )}
    </>
  );
}
