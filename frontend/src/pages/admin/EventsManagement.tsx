import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Search } from 'lucide-react';
import type { EventItem, EventStatus } from '../../types';
import { listAllEvents, setEventStatus } from '../../services/eventsService';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Input, Select } from '../../components/ui/Field';
import { Meter } from '../../components/ui/Stat';
import { Skeleton, StateBlock } from '../../components/ui/Feedback';
import { buttonClass } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { formatDate, formatNumber } from '../../lib/format';

type StatusFilter = EventStatus | 'all';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'paused', label: 'Paused' },
  { value: 'unpublished', label: 'Unpublished' },
];

export default function EventsManagement() {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setError(false);
    listAllEvents()
      .then((rows) => active && setEvents(rows))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(() => {
    if (!events) return [];
    const q = search.trim().toLowerCase();
    return events.filter((e) => {
      const matchesStatus = status === 'all' || e.status === status;
      const matchesSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [events, search, status]);

  async function changeStatus(id: string, next: EventStatus, verb: string) {
    setBusyId(id);
    try {
      await setEventStatus(id, next);
      setEvents((prev) =>
        prev ? prev.map((e) => (e.id === id ? { ...e, status: next } : e)) : prev,
      );
      toast({ tone: 'success', title: `Event ${verb}` });
    } catch {
      toast({ tone: 'error', title: `Couldn't ${verb.replace(/ed$/, '')} event` });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="adminhead">
        <div>
          <h1 className="adminhead__title">Events</h1>
          <p className="adminhead__sub">Curate the calendar — publish, pause, and track how each night is selling.</p>
        </div>
        <div className="adminhead__actions">
          <Link to="/admin/events/new" className={buttonClass('gold', 'md')}>
            <Plus size={16} /> Create event
          </Link>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar__search">
          <Input
            icon={<Search size={16} />}
            placeholder="Search by title, venue, or city"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search events"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          aria-label="Filter by status"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      {error ? (
        <StateBlock
          title="We couldn't load events"
          body="Something went wrong fetching the calendar. Refresh to try again."
        />
      ) : (
        <div className="table-wrap">
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th className="cell-num">Sold</th>
                  <th>Status</th>
                  <th className="cell-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events === null ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td>
                        <Skeleton w="60%" h={14} />
                        <Skeleton w="35%" h={11} style={{ marginTop: 8 }} />
                      </td>
                      <td><Skeleton w={120} h={13} /></td>
                      <td><Skeleton w={80} h={13} /></td>
                      <td className="cell-num"><Skeleton w={90} h={13} /></td>
                      <td><Skeleton w={84} h={20} radius={999} /></td>
                      <td className="cell-actions"><Skeleton w={120} h={32} /></td>
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 0 }}>
                      <StateBlock
                        title={search || status !== 'all' ? 'No events match' : 'No events yet'}
                        body={
                          search || status !== 'all'
                            ? 'Try a different search or clear the status filter.'
                            : 'Create your first event to start selling tickets.'
                        }
                        action={
                          <Link to="/admin/events/new" className={buttonClass('gold', 'sm')}>
                            <Plus size={15} /> Create event
                          </Link>
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  rows.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <div className="cell-strong">{e.title}</div>
                        <div className="meta" style={{ marginTop: 2 }}>{e.city}</div>
                      </td>
                      <td className="mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-2)' }}>
                        {formatDate(e.eventDate)}
                      </td>
                      <td>{e.category}</td>
                      <td className="cell-num">
                        <div style={{ whiteSpace: 'nowrap' }}>
                          {formatNumber(e.ticketsSold)} / {formatNumber(e.capacity)}
                        </div>
                        <div style={{ marginTop: 8, marginLeft: 'auto', maxWidth: 120 }}>
                          <Meter value={e.ticketsSold} max={e.capacity} />
                        </div>
                      </td>
                      <td><StatusBadge kind="event" value={e.status} /></td>
                      <td className="cell-actions">
                        <div className="row" style={{ gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                          {e.status === 'published' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              loading={busyId === e.id}
                              onClick={() => changeStatus(e.id, 'paused', 'paused')}
                            >
                              Pause
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              loading={busyId === e.id}
                              onClick={() => changeStatus(e.id, 'published', 'published')}
                            >
                              Publish
                            </Button>
                          )}
                          <Link
                            to={`/admin/events/${e.id}/edit`}
                            className="icon-btn"
                            aria-label={`Edit ${e.title}`}
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
