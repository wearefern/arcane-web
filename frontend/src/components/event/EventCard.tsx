import { Link } from 'react-router-dom';
import { MapPin, ArrowUpRight } from 'lucide-react';
import type { EventItem } from '../../types';
import { EventPoster } from './EventPoster';
import { Badge } from '../ui/Badge';
import { formatDateShort, formatLkr } from '../../lib/format';

export function EventCard({ event }: { event: EventItem }) {
  const soldOut = event.ticketsSold >= event.capacity;
  return (
    <Link to={`/events/${event.slug}`} className="ecard" aria-label={`${event.title} — ${event.venue}, ${event.city}`}>
      <EventPoster tone={event.tone} watermark={event.title.charAt(0)} className="ecard__poster">
        <div className="ecard__poster-top">
          <span className="ecard__date">{formatDateShort(event.eventDate)}</span>
          {event.featured ? (
            <Badge tone="gold">Featured</Badge>
          ) : soldOut ? (
            <Badge tone="oxblood">Sold out</Badge>
          ) : null}
        </div>
        <div>
          <h3 className="ecard__title">{event.title}</h3>
          <p className="ecard__venue">
            <MapPin size={12} /> {event.venue}, {event.city}
          </p>
        </div>
      </EventPoster>
      <div className="ecard__foot">
        <span className="ecard__price">
          <span className="from">From</span>
          <span className="amt">{formatLkr(event.priceFromLkr)}</span>
        </span>
        <span className="ecard__cat">
          {event.category} <ArrowUpRight size={14} />
        </span>
      </div>
    </Link>
  );
}
