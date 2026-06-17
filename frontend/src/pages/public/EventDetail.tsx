import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  DoorOpen,
  ShieldCheck,
  Shirt,
  ArrowRight,
} from 'lucide-react';
import type { EventWithTickets, TicketType } from '../../types';
import { ticketsAvailable } from '../../types';
import { getEventBySlug } from '../../services/eventsService';
import { EventPoster } from '../../components/event/EventPoster';
import { Badge } from '../../components/ui/Badge';
import { Meter } from '../../components/ui/Stat';
import { Stepper } from '../../components/ui/Stepper';
import { LoadingBlock, StateBlock } from '../../components/ui/Feedback';
import { buttonClass } from '../../components/ui/Button';
import { formatDateLong, formatLkr, formatTime } from '../../lib/format';
import { cn } from '../../lib/cn';

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventWithTickets | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'missing'>('loading');
  const [selectedId, setSelectedId] = useState<string>('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setStatus('loading');
    getEventBySlug(slug)
      .then((e) => {
        if (!active) return;
        if (!e) {
          setStatus('missing');
          return;
        }
        setEvent(e);
        const firstSellable = e.ticketTypes.find((t) => t.status === 'active' && ticketsAvailable(t) > 0);
        setSelectedId(firstSellable?.id ?? e.ticketTypes[0]?.id ?? '');
        setStatus('ready');
      })
      .catch(() => active && setStatus('error'));
    return () => {
      active = false;
    };
  }, [slug]);

  const selected = useMemo(
    () => event?.ticketTypes.find((t) => t.id === selectedId),
    [event, selectedId],
  );
  const maxQty = selected
    ? Math.max(1, Math.min(selected.perOrderLimit, ticketsAvailable(selected)))
    : 1;

  useEffect(() => {
    setQty((q) => Math.min(Math.max(1, q), maxQty));
  }, [maxQty]);

  if (status === 'loading') return <div className="container section"><LoadingBlock label="Loading event…" /></div>;
  if (status === 'missing')
    return (
      <div className="container section">
        <StateBlock
          title="That event isn't here"
          body="It may have ended or been unlisted."
          action={<Link to="/events" className={buttonClass('ghost')}>Browse events</Link>}
        />
      </div>
    );
  if (status === 'error' || !event)
    return (
      <div className="container section">
        <StateBlock title="We couldn't load this event" body="Please refresh to try again." />
      </div>
    );

  const sellable = selected && selected.status === 'active' && ticketsAvailable(selected) > 0;

  function selectableLabel(t: TicketType): string | null {
    if (t.status === 'sold_out' || ticketsAvailable(t) === 0) return 'Sold out';
    if (t.status === 'scheduled') return 'On sale soon';
    if (t.status === 'paused') return 'Closed';
    return null;
  }

  return (
    <article>
      {/* ---- Banner ---- */}
      <div className="container container--wide" style={{ paddingTop: 'var(--space-6)' }}>
        <Link to="/events" className="row" style={{ gap: 8, color: 'var(--text-3)', fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-5)' }}>
          <ArrowLeft size={16} /> All events
        </Link>

        <div className="detail-banner">
          <EventPoster tone={event.tone} watermark={event.title.charAt(0)} style={{ position: 'absolute', inset: 0 }} />
          {event.featured && (
            <span style={{ position: 'absolute', top: 'var(--space-6)', left: 'var(--space-6)' }}>
              <Badge tone="gold" dot>Featured</Badge>
            </span>
          )}
          <div className="detail-banner__content">
            <p className="eyebrow">{event.category} · {event.city}</p>
            <h1 className="display" style={{ fontSize: 'var(--fs-h1)', marginTop: 'var(--space-4)' }}>{event.title}</h1>
            <div className="row row--wrap" style={{ gap: 'var(--space-5)', marginTop: 'var(--space-5)' }}>
              <span className="row" style={{ gap: 8, color: 'var(--text-2)', fontSize: 'var(--fs-sm)' }}><CalendarDays size={16} style={{ color: 'var(--gold-500)' }} /> {formatDateLong(event.eventDate)}</span>
              <span className="row" style={{ gap: 8, color: 'var(--text-2)', fontSize: 'var(--fs-sm)' }}><Clock size={16} style={{ color: 'var(--gold-500)' }} /> {formatTime(event.eventDate)} till {event.endTime}</span>
              <span className="row" style={{ gap: 8, color: 'var(--text-2)', fontSize: 'var(--fs-sm)' }}><MapPin size={16} style={{ color: 'var(--gold-500)' }} /> {event.venue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Body + ticket selection ---- */}
      <div className="container container--wide">
        <div className="detail-layout">
          <div>
            <p className="eyebrow">The night</p>
            <div className="prose" style={{ marginTop: 'var(--space-5)' }}>
              <p style={{ fontSize: 'var(--fs-lg)', color: 'var(--text-1)' }}>{event.description}</p>
            </div>

            {event.lineup && event.lineup.length > 0 && (
              <div style={{ marginTop: 'var(--space-9)' }}>
                <p className="eyebrow">Line-up</p>
                <div className="row row--wrap" style={{ gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                  {event.lineup.map((act) => (
                    <span key={act} className="chip" style={{ cursor: 'default' }}>{act}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: 'var(--space-9)' }}>
              <p className="eyebrow">Good to know</p>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', marginTop: 'var(--space-4)', gap: 'var(--space-4)' }}>
                <Detail icon={<DoorOpen size={16} />} label="Doors" value={event.doorsTime ? `${event.doorsTime}` : 'On arrival'} />
                <Detail icon={<ShieldCheck size={16} />} label="Entry" value={event.agePolicy ?? 'All welcome'} />
                <Detail icon={<Shirt size={16} />} label="Dress" value={event.dressCode ?? 'As you are'} />
              </div>
            </div>
          </div>

          {/* aside — ticket selection */}
          <aside className="detail-aside">
            <div className="card card--pad">
              <p className="eyebrow eyebrow--plain" style={{ color: 'var(--text-3)' }}>Tickets</p>
              <div className="stack" style={{ marginTop: 'var(--space-4)', ['--gap' as string]: 'var(--space-3)' }}>
                {event.ticketTypes.map((t) => {
                  const avail = ticketsAvailable(t);
                  const note = selectableLabel(t);
                  const disabled = note !== null;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={cn('tickettype', selectedId === t.id && 'is-selected')}
                      onClick={() => !disabled && setSelectedId(t.id)}
                      disabled={disabled}
                      style={{ opacity: disabled ? 0.55 : 1, cursor: disabled ? 'not-allowed' : 'pointer', width: '100%', textAlign: 'left' }}
                      aria-pressed={selectedId === t.id}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div className="t-1" style={{ fontWeight: 500 }}>{t.name}</div>
                        <div className="meta clamp-2" style={{ marginTop: 4 }}>{t.description}</div>
                        {!disabled && avail <= 40 && (
                          <div style={{ marginTop: 'var(--space-3)', maxWidth: 140 }}>
                            <Meter value={avail} max={t.totalQty} />
                            <span className="meta" style={{ fontSize: 'var(--fs-2xs)' }}>{avail} left</span>
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div className="tickettype__price">{formatLkr(t.priceLkr)}</div>
                        {note && <div style={{ marginTop: 6 }}><Badge tone={note === 'Sold out' ? 'oxblood' : 'slate'}>{note}</Badge></div>}
                      </div>
                    </button>
                  );
                })}
              </div>

              <hr className="divider" style={{ margin: 'var(--space-5) 0' }} />

              <div className="row row--between">
                <span className="meta">Quantity</span>
                <Stepper value={qty} onChange={setQty} min={1} max={maxQty} />
              </div>

              <div className="row row--between" style={{ marginTop: 'var(--space-5)' }}>
                <span className="meta">Subtotal</span>
                <span className="mono t-1" style={{ fontSize: 'var(--fs-lg)' }}>
                  {selected ? formatLkr(selected.priceLkr * qty) : '—'}
                </span>
              </div>

              <button
                className={buttonClass('gold', 'lg', 'btn--block')}
                style={{ marginTop: 'var(--space-5)' }}
                disabled={!sellable}
                onClick={() =>
                  selected && navigate(`/checkout?event=${event.slug}&tt=${selected.id}&qty=${qty}`)
                }
              >
                {sellable ? <>Continue to checkout <ArrowRight size={17} /></> : 'Unavailable'}
              </button>
              <p className="meta t-center" style={{ marginTop: 'var(--space-3)', fontSize: 'var(--fs-2xs)' }}>
                Secured by PayHere & Koko · Instant e-tickets
              </p>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card card--pad-sm" style={{ background: 'var(--ink-850)' }}>
      <div className="row" style={{ gap: 8, color: 'var(--gold-600)' }}>{icon}<span className="cred-cell__label" style={{ color: 'var(--text-3)' }}>{label}</span></div>
      <div className="t-1" style={{ marginTop: 'var(--space-2)', fontSize: 'var(--fs-sm)' }}>{value}</div>
    </div>
  );
}
