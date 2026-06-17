import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, MapPin, Clock, CalendarDays } from 'lucide-react';
import type { EventItem } from '../../types';
import { listEvents, listCategories } from '../../services/eventsService';
import { EventCard } from '../../components/event/EventCard';
import { EventPoster } from '../../components/event/EventPoster';
import { Badge } from '../../components/ui/Badge';
import { Skeleton, StateBlock } from '../../components/ui/Feedback';
import { buttonClass } from '../../components/ui/Button';
import { formatDate, formatDateShort, formatLkr, formatTime } from '../../lib/format';
import { cn } from '../../lib/cn';

export default function Home() {
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [cats, setCats] = useState<string[]>([]);
  const [cat, setCat] = useState('all');
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([listEvents(), listCategories()])
      .then(([e, c]) => {
        if (!active) return;
        setEvents(e);
        setCats(c);
      })
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, []);

  const featured = events?.find((e) => e.featured) ?? events?.[0];
  const nextNights = (events ?? []).slice(0, 3);
  const grid = (events ?? []).filter((e) => cat === 'all' || e.category === cat);

  return (
    <>
      {/* ---- Hero: the thesis — access to the city after dark ---- */}
      <section className="hero">
        <div className="container container--wide">
          <p className="eyebrow hero__eyebrow rise">Arcane · Colombo</p>
          <h1 className="hero__title display rise delay-1">Access the night.</h1>
          <p className="hero__sub lead rise delay-2">
            A members-first door to the city's most considered events — curated, intimate, and
            seamless from ticket to gate.
          </p>
          <div className="hero__actions rise delay-3">
            <Link to="/events" className={buttonClass('gold', 'lg')}>
              Explore events <ArrowRight size={17} />
            </Link>
            <Link to="/tickets" className={buttonClass('ghost', 'lg')}>
              Find my tickets
            </Link>
          </div>

          {/* live "next nights" ticker — real upcoming dates, not vanity stats */}
          <div className="hero__strip rise delay-4">
            {events === null
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ flex: '1 1 180px', maxWidth: 240 }}>
                    <Skeleton w={70} h={11} />
                    <Skeleton w="100%" h={15} style={{ marginTop: 8 }} />
                  </div>
                ))
              : nextNights.map((e) => (
                  <Link
                    key={e.id}
                    to={`/events/${e.slug}`}
                    style={{ flex: '1 1 180px', maxWidth: 260, display: 'block' }}
                  >
                    <div className="mono" style={{ fontSize: 'var(--fs-2xs)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold-600)' }}>
                      {formatDateShort(e.eventDate)} · {e.city}
                    </div>
                    <div className="t-1" style={{ marginTop: 6, fontSize: 'var(--fs-sm)' }}>
                      {e.title}
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* ---- Featured marquee ---- */}
      <section className="section--tight">
        <div className="container container--wide">
          <div className="row row--between" style={{ marginBottom: 'var(--space-6)' }}>
            <p className="eyebrow">In the spotlight</p>
            <Link to="/events" className="row" style={{ gap: 6, color: 'var(--text-3)', fontSize: 'var(--fs-sm)' }}>
              All events <ArrowUpRight size={14} />
            </Link>
          </div>

          {error ? (
            <StateBlock title="We couldn't load events" body="Please refresh to try again." />
          ) : !featured ? (
            <Skeleton w="100%" h={460} radius={20} />
          ) : (
            <article className="feature rise">
              <div className="feature__poster">
                <EventPoster tone={featured.tone} watermark={featured.title.charAt(0)} style={{ position: 'absolute', inset: 0 }}>
                  <span className="feature__poster-tag">
                    <Badge tone="gold" dot>Featured</Badge>
                  </span>
                </EventPoster>
              </div>
              <div className="feature__body">
                <div>
                  <p className="eyebrow eyebrow--plain" style={{ color: 'var(--text-3)' }}>{featured.category} · {featured.city}</p>
                  <h2 className="feature__title" style={{ marginTop: 'var(--space-3)' }}>{featured.title}</h2>
                </div>
                <p className="t-2 clamp-3" style={{ maxWidth: '46ch' }}>{featured.description}</p>
                <div className="feature__meta">
                  <span className="feature__meta-item"><CalendarDays /> {formatDate(featured.eventDate)}</span>
                  <span className="feature__meta-item"><Clock /> {formatTime(featured.eventDate)} till late</span>
                  <span className="feature__meta-item"><MapPin /> {featured.venue}</span>
                </div>
                <div className="row" style={{ gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                  <Link to={`/events/${featured.slug}`} className={buttonClass('gold', 'lg')}>
                    Get tickets <ArrowRight size={17} />
                  </Link>
                  <span className="meta">
                    From <span className="mono t-1" style={{ fontSize: 'var(--fs-base)' }}>{formatLkr(featured.priceFromLkr)}</span>
                  </span>
                </div>
              </div>
            </article>
          )}
        </div>
      </section>

      {/* ---- Upcoming + filters ---- */}
      <section className="section">
        <div className="container container--wide">
          <div className="section-head">
            <div>
              <p className="eyebrow">What's on</p>
              <h2 className="section-head__title">Upcoming nights</h2>
            </div>
            <div className="chips hide-mobile" role="group" aria-label="Filter by category">
              <button className={cn('chip', cat === 'all' && 'is-active')} aria-pressed={cat === 'all'} onClick={() => setCat('all')}>
                All
              </button>
              {cats.map((c) => (
                <button key={c} className={cn('chip', cat === c && 'is-active')} aria-pressed={cat === c} onClick={() => setCat(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <StateBlock title="We couldn't load events" body="Please refresh to try again." />
          ) : events === null ? (
            <div className="event-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card" style={{ overflow: 'hidden' }}>
                  <Skeleton w="100%" h={210} radius={0} />
                  <div style={{ padding: 'var(--space-5)' }}>
                    <Skeleton w="60%" h={14} />
                  </div>
                </div>
              ))}
            </div>
          ) : grid.length === 0 ? (
            <StateBlock title="Nothing in this category yet" body="Try another category — new nights are added every week." />
          ) : (
            <div className="event-grid">
              {grid.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
