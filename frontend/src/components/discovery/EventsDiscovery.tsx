import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import type { EventFilters, EventItem } from '../../types';
import { listCategories, listEvents } from '../../services/eventsService';
import { EventCard } from '../event/EventCard';
import { Input, Select } from '../ui/Field';
import { Skeleton, StateBlock } from '../ui/Feedback';
import { Button } from '../ui/Button';
import { cn } from '../../lib/cn';

type When = NonNullable<EventFilters['when']>;
type Sort = 'date' | 'price-low' | 'price-high';

const CATEGORIES = ['All', 'Club Night', 'Concert', 'Day Party', 'Festival', 'Gala', 'Rooftop'];
const REFERENCE_NOW = '2025-06-16T12:00:00+05:30';
const DAY_MS = 86_400_000;

function inWindow(event: EventItem, when: When) {
  if (when === 'all') return true;
  const days = (Date.parse(event.eventDate) - Date.parse(REFERENCE_NOW)) / DAY_MS;
  if (when === 'this-week') return days >= 0 && days <= 7;
  if (when === 'this-month') return days >= 0 && days <= 31;
  return days > 31;
}

export function EventsDiscovery() {
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [when, setWhen] = useState<When>('all');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState<Sort>('date');

  useEffect(() => {
    let active = true;
    Promise.all([listEvents(), listCategories()])
      .then(([items, cats]) => {
        if (!active) return;
        setEvents(items);
        setAvailableCategories(cats);
      })
      .catch(() => active && setError(true));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 200);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const categories = CATEGORIES.filter((item) => item === 'All' || availableCategories.includes(item));
  const results = useMemo(() => {
    if (!events) return [];
    const cap = maxPrice ? Number(maxPrice) : null;
    const filtered = events.filter((event) => {
      const haystack = [event.title, event.venue, event.city, event.category, ...(event.lineup ?? [])].join(' ').toLowerCase();
      return (category === 'All' || event.category === category)
        && inWindow(event, when)
        && (cap === null || event.priceFromLkr <= cap)
        && (!search || haystack.includes(search));
    });
    return filtered.toSorted((a, b) => sort === 'date'
      ? Date.parse(a.eventDate) - Date.parse(b.eventDate)
      : sort === 'price-low'
        ? a.priceFromLkr - b.priceFromLkr
        : b.priceFromLkr - a.priceFromLkr);
  }, [events, search, category, when, maxPrice, sort]);

  const clearFilters = () => {
    setSearchInput(''); setSearch(''); setCategory('All'); setWhen('all'); setMaxPrice('');
  };

  return (
    <section className="discovery">
      <div className="discovery__hero container container--wide">
        <p className="eyebrow rise">All events</p>
        <h1 className="discovery__title display rise delay-1">Events</h1>
        <p className="discovery__subtitle lead rise delay-2">
          Every night on the calendar — curated, intimate, and unlocked the moment you arrive. Filter by what you’re after.
        </p>
      </div>

      <div className="container container--wide discovery__body">
        <div className="filterbar discovery__filters rise delay-3">
          <div className="filterbar__search">
            <Input type="search" icon={<Search size={17} />} placeholder="Search by name, venue, city or artist" aria-label="Search events" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
          </div>
          <Select aria-label="Filter by date" value={when} onChange={(event) => setWhen(event.target.value as When)}>
            <option value="all">Any date</option><option value="this-week">This week</option><option value="this-month">This month</option><option value="later">Later</option>
          </Select>
          <Select aria-label="Filter by price" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)}>
            <option value="">Any price</option><option value="5000">Under Rs 5,000</option><option value="10000">Under Rs 10,000</option><option value="25000">Under Rs 25,000</option>
          </Select>
        </div>

        <div className="chips discovery__chips" role="group" aria-label="Filter by category">
          {categories.map((item, index) => (
            <button key={item} style={{ '--reveal-order': index } as CSSProperties} className={cn('chip pill-reveal', category === item && 'is-active')} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>
          ))}
        </div>

        <div className="results-head">
          <p className="results-head__count" aria-live="polite"><Sparkles size={14} /> {events ? `${results.length} events found` : 'Curating events'}</p>
          <label className="results-head__sort">Sort by
            <select value={sort} onChange={(event) => setSort(event.target.value as Sort)}><option value="date">Date</option><option value="price-low">Price: low</option><option value="price-high">Price: high</option></select>
          </label>
        </div>

        {error ? <StateBlock icon={<SlidersHorizontal />} title="We couldn't load events" body="Please refresh to try again." />
          : events === null ? <div className="event-grid">{Array.from({ length: 6 }).map((_, index) => <div className="card" key={index}><Skeleton w="100%" h={240} radius={0} /></div>)}</div>
          : results.length === 0 ? <StateBlock icon={<Search />} title="No events match" body="Try widening your search or clearing a filter." action={<Button variant="outline" onClick={clearFilters}>Clear filters</Button>} />
          : <div className="event-grid">{results.map((event, index) => <div className="event-reveal" style={{ '--reveal-order': index } as CSSProperties} key={event.id}><EventCard event={event} /></div>)}</div>}
      </div>
    </section>
  );
}
