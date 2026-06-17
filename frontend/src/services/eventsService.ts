/* =========================================================================
   ARCANE — Events service (mock). Reads return deep copies after a delay;
   mutations are logged placeholders. Public reads expose published events;
   the admin reads expose every status.
   ========================================================================= */

import type { EventFilters, EventItem, EventStatus, EventWithTickets } from '../types';
import { EVENTS, TICKET_TYPES } from '../data';
import { clone, delay, matches } from './_mock';

/**
 * Fixed "now" anchor for relative filtering. The mock catalogue lives in 2025,
 * so we deliberately do NOT use the wall clock — that would push every event
 * into the past. This sits just before the first event goes live.
 */
const REFERENCE_NOW = '2025-06-16T12:00:00+05:30';

const DAY_MS = 86_400_000;

function withTickets(event: EventItem): EventWithTickets {
  const ticketTypes = TICKET_TYPES.filter((t) => t.eventId === event.id);
  return { ...event, ticketTypes };
}

function inWindow(event: EventItem, when: NonNullable<EventFilters['when']>): boolean {
  if (when === 'all') return true;
  const now = Date.parse(REFERENCE_NOW);
  const at = Date.parse(event.eventDate);
  const days = (at - now) / DAY_MS;
  if (when === 'this-week') return days >= 0 && days <= 7;
  if (when === 'this-month') return days >= 0 && days <= 31;
  // 'later'
  return days > 31;
}

function applyFilters(events: EventItem[], filters?: EventFilters): EventItem[] {
  if (!filters) return events;
  let out = events;
  const search = filters.search?.trim();
  if (search) {
    out = out.filter(
      (e) =>
        matches(e.title, search) ||
        matches(e.venue, search) ||
        matches(e.city, search) ||
        matches(e.category, search) ||
        (e.lineup ?? []).some((act) => matches(act, search)),
    );
  }
  if (filters.category && filters.category !== 'all') {
    out = out.filter((e) => e.category === filters.category);
  }
  if (filters.when) {
    out = out.filter((e) => inWindow(e, filters.when as NonNullable<EventFilters['when']>));
  }
  if (typeof filters.maxPriceLkr === 'number') {
    out = out.filter((e) => e.priceFromLkr <= (filters.maxPriceLkr as number));
  }
  return out;
}

function byDateAsc(a: EventItem, b: EventItem): number {
  return Date.parse(a.eventDate) - Date.parse(b.eventDate);
}

/** Public listing: published events only, with optional filters. */
export async function listEvents(filters?: EventFilters): Promise<EventItem[]> {
  await delay();
  const published = EVENTS.filter((e) => e.status === 'published');
  const filtered = applyFilters(published, filters).sort(byDateAsc);
  return clone(filtered);
}

/** Admin listing: every event regardless of status. */
export async function listAllEvents(): Promise<EventItem[]> {
  await delay();
  const all = [...EVENTS].sort(byDateAsc);
  return clone(all);
}

export async function getEventBySlug(slug: string): Promise<EventWithTickets | undefined> {
  await delay();
  const event = EVENTS.find((e) => e.slug === slug);
  return event ? clone(withTickets(event)) : undefined;
}

export async function getEventById(id: string): Promise<EventWithTickets | undefined> {
  await delay();
  const event = EVENTS.find((e) => e.id === id);
  return event ? clone(withTickets(event)) : undefined;
}

/** First featured, published event (by event date). */
export async function getFeaturedEvent(): Promise<EventItem | undefined> {
  await delay();
  const featured = EVENTS.filter((e) => e.status === 'published' && e.featured).sort(byDateAsc);
  return featured.length ? clone(featured[0]) : undefined;
}

export async function getUpcomingEvents(limit = 6): Promise<EventItem[]> {
  await delay();
  const upcoming = EVENTS.filter((e) => e.status === 'published').sort(byDateAsc).slice(0, limit);
  return clone(upcoming);
}

export async function listCategories(): Promise<string[]> {
  await delay();
  const set = new Set<string>();
  for (const e of EVENTS) {
    if (e.status === 'published') set.add(e.category);
  }
  return [...set].sort();
}

/* ---- placeholder mutations (no persistence) ---- */

export async function createEvent(input: Partial<EventItem>): Promise<EventItem> {
  await delay();
  console.info('[eventsService.createEvent] placeholder — not persisted', input);
  const draft: EventItem = {
    id: `evt_${Math.random().toString(36).slice(2, 8)}`,
    slug: input.slug ?? 'new-event',
    title: input.title ?? 'Untitled event',
    description: input.description ?? '',
    venue: input.venue ?? '',
    city: input.city ?? 'Colombo',
    category: input.category ?? 'Club Night',
    tone: input.tone ?? 'mono',
    status: input.status ?? 'draft',
    featured: input.featured ?? false,
    eventDate: input.eventDate ?? REFERENCE_NOW,
    startTime: input.startTime ?? '21:00',
    endTime: input.endTime ?? '02:00',
    doorsTime: input.doorsTime,
    agePolicy: input.agePolicy,
    dressCode: input.dressCode,
    lineup: input.lineup,
    priceFromLkr: input.priceFromLkr ?? 0,
    ticketsSold: input.ticketsSold ?? 0,
    capacity: input.capacity ?? 0,
  };
  return clone(draft);
}

export async function updateEvent(id: string, input: Partial<EventItem>): Promise<EventItem> {
  await delay();
  console.info('[eventsService.updateEvent] placeholder — not persisted', id, input);
  const existing = EVENTS.find((e) => e.id === id);
  if (!existing) throw new Error(`Event not found: ${id}`);
  return clone({ ...existing, ...input, id: existing.id });
}

export async function setEventStatus(id: string, status: EventStatus): Promise<void> {
  await delay();
  console.info('[eventsService.setEventStatus] placeholder — not persisted', id, status);
}
