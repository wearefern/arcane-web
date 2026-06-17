import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { EventFilters, EventItem } from '../../types';
import { listEvents, listCategories } from '../../services/eventsService';
import { EventCard } from '../../components/event/EventCard';
import { Input, Select } from '../../components/ui/Field';
import { Skeleton, StateBlock } from '../../components/ui/Feedback';
import { Button } from '../../components/ui/Button';
import { plural } from '../../lib/format';
import { cn } from '../../lib/cn';

type When = NonNullable<EventFilters['when']>;

const WHEN_OPTIONS: { value: When; label: string }[] = [
  { value: 'all', label: 'Any date' },
  { value: 'this-week', label: 'This week' },
  { value: 'this-month', label: 'This month' },
  { value: 'later', label: 'Later' },
];

const PRICE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Any price' },
  { value: '5000', label: 'Under Rs 5,000' },
  { value: '10000', label: 'Under Rs 10,000' },
  { value: '25000', label: 'Under Rs 25,000' },
];

/** Fixed "now" anchor matching the services layer (mock catalogue lives in 2025). */
const REFERENCE_NOW = '2025-06-16T12:00:00+05:30';
const DAY_MS = 86_400_000;

function inWindow(event: EventItem, when: When): boolean {
  if (when === 'all') return true;
  const days = (Date.parse(event.eventDate) - Date.parse(REFERENCE_NOW)) / DAY_MS;
  if (when === 'this-week') return days >= 0 && days <= 7;
  if (when === 'this-month') return days >= 0 && days <= 31;
  return days > 31;
}

function hit(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle);
}

export default function Events() {
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [cats, setCats] = useState<string[]>([]);
  const [error, setError] = useState(false);

  // raw search input + debounced value used for filtering
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('all');
  const [when, setWhen] = useState<When>('all');
  const [maxPrice, setMaxPrice] = useState('');

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

  // debounce the search ~250ms so typing stays snappy
  useEffect(() => {
    const id = window.setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 250);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  const hasFilters = search !== '' || cat !== 'all' || when !== 'all' || maxPrice !== '';

  const results = useMemo(() => {
    if (!events) return [];
    const cap = maxPrice ? Number(maxPrice) : null;
    return events.filter((e) => {
      if (cat !== 'all' && e.category !== cat) return false;
      if (!inWindow(e, when)) return false;
      if (cap !== null && e.priceFromLkr > cap) return false;
      if (search) {
        const inLineup = (e.lineup ?? []).some((act) => hit(act, search));
        const matched =
          hit(e.title, search) ||
          hit(e.venue, search) ||
          hit(e.city, search) ||
          hit(e.category, search) ||
          inLineup;
        if (!matched) return false;
      }
      return true;
    });
  }, [events, cat, when, maxPrice, search]);

  function clearFilters() {
    setSearchInput('');
    setSearch('');
    setCat('all');
    setWhen('all');
    setMaxPrice('');
  }

  return (
    <section>
      <div className="container container--wide">
        <header className="pagehead">
          <p className="eyebrow">All events</p>
          <h1 className="pagehead__title display">Events</h1>
          <p className="pagehead__sub lead">
            Every night on the calendar — curated, intimate, and unlocked the moment you arrive.
            Filter by what you're after.
          </p>
        </header>

        {/* ---- Filter bar ---- */}
        <div className="filterbar" style={{ marginBottom: 'var(--space-7)' }}>
          <div className="filterbar__search">
            <Input
              type="search"
              icon={<Search size={16} aria-hidden />}
              placeholder="Search by name, venue, city or artist"
              aria-label="Search events"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <label className="visually-hidden" htmlFor="filter-when">
            When
          </label>
          <Select
            id="filter-when"
            aria-label="Filter by date"
            value={when}
            onChange={(e) => setWhen(e.target.value as When)}
          >
            {WHEN_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>

          <label className="visually-hidden" htmlFor="filter-price">
            Price
          </label>
          <Select
            id="filter-price"
            aria-label="Filter by price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          >
            {PRICE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>

        {/* ---- Category chips ---- */}
        <div
          className="chips"
          role="group"
          aria-label="Filter by category"
          style={{ marginBottom: 'var(--space-6)' }}
        >
          <button
            className={cn('chip', cat === 'all' && 'is-active')}
            aria-pressed={cat === 'all'}
            onClick={() => setCat('all')}
          >
            All
          </button>
          {cats.map((c) => (
            <button
              key={c}
              className={cn('chip', cat === c && 'is-active')}
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* ---- Result count ---- */}
        {events !== null && !error && (
          <p className="meta" style={{ marginBottom: 'var(--space-6)' }} aria-live="polite">
            {plural(results.length, 'event')}
          </p>
        )}

        {/* ---- Results ---- */}
        {error ? (
          <StateBlock
            icon={<SlidersHorizontal />}
            title="We couldn't load events"
            body="Something went wrong on our side. Please refresh to try again."
          />
        ) : events === null ? (
          <div className="event-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card" style={{ overflow: 'hidden' }}>
                <Skeleton w="100%" h={210} radius={0} />
                <div style={{ padding: 'var(--space-5)' }}>
                  <Skeleton w="60%" h={14} />
                  <Skeleton w="40%" h={12} style={{ marginTop: 'var(--space-4)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <StateBlock
            icon={<Search />}
            title="No events match"
            body="Try widening your search or clearing a filter — new nights are added every week."
            action={
              <Button variant="outline" onClick={clearFilters} disabled={!hasFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="event-grid">
            {results.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
