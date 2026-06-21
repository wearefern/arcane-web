import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Compass, Crown, MapPin, ScanLine, Star, TicketCheck, Users } from 'lucide-react';
import { EVENTS } from '../../data/events';
import { formatLkr } from '../../lib/format';
import { buttonClass } from '../../components/ui/Button';
import { ScrollReveal } from '../../components/motion/ScrollReveal';
import gateImage from '../../assets/landing/arcane-gate.png';

const categories = ['All', 'Club Night', 'Festival', 'Rooftop', 'Day Party', 'Gala', 'Concert'];
const featuredEvents = EVENTS.filter((event) => event.status === 'published').slice(0, 5);

const features = [
  { icon: MapPin, title: 'Real doors, real rooms', copy: 'Sky Lounge, The Vault, Galle Fort. Nights worth leaving the house for — not a listings dump.' },
  { icon: ScanLine, title: 'Your phone is the ticket', copy: 'A QR that scans in a second at the door. No printouts, no will-call, no guest-list anxiety.' },
  { icon: Users, title: 'Members go first', copy: 'Early access and member-only releases before tickets open to everyone else.' },
];

const membership = [
  { icon: Crown, title: 'Priority access', copy: 'First window on the high-demand nights, before public release.' },
  { icon: Star, title: 'Member-only events', copy: 'Private rooms and off-calendar nights you won’t find listed.' },
  { icon: TicketCheck, title: 'Faster entry', copy: 'A dedicated members’ door. Scan, and you’re in.' },
  { icon: Compass, title: 'Saved & synced', copy: 'Every ticket in one place, ready to scan when you arrive.' },
];

const heroStyle = { '--gate-image': `url(${gateImage})` } as CSSProperties;

function eventDateParts(date: string) {
  const value = new Date(date);
  return {
    day: value.toLocaleDateString('en-GB', { day: '2-digit' }),
    month: value.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
  };
}

function cardImageStyle(event: { image?: string }): CSSProperties {
  return { '--gate-image': `url(${event.image ?? gateImage})` } as CSSProperties;
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All');
  const visibleEvents = activeCategory === 'All'
    ? featuredEvents
    : EVENTS.filter((event) => event.status === 'published' && event.category === activeCategory).slice(0, 5);

  return (
    <div className="landing">
      <section className="landing-hero" style={heroStyle}>
        <div className="landing-hero__beam" aria-hidden />
        <div className="landing-hero__content container container--wide">
          <div className="landing-hero__copy">
            <p className="landing-kicker">ARCANE <span>•</span> COLOMBO</p>
            <h1>Access<br /><em className="accent-serif">the night.</em></h1>
            <p className="landing-hero__lede">Members get the city’s best nights first — rooftops, club nights, galas and festivals across Colombo, Galle and Kandy. One tap to get in.</p>
            <div className="landing-actions">
              <Link to="/events" className={buttonClass('gold', 'lg')}>Explore events <ArrowRight size={16} /></Link>
              <Link to="/tickets" className={buttonClass('ghost', 'lg')}>My tickets</Link>
            </div>
          </div>
        </div>

        <div className="landing-ticker container container--wide" aria-label="Upcoming this season">
          <div className="landing-ticker__label"><span>Upcoming</span><span>this season</span></div>
          {featuredEvents.slice(0, 4).map((event) => {
            const date = eventDateParts(event.eventDate);
            return (
              <Link to={`/events/${event.slug}`} className="landing-ticker__event" key={event.id}>
                <span className="landing-ticker__date"><b>{date.day}</b>{date.month}</span>
                <span><b>{event.title.split('—')[0].trim()}</b><small>{event.category} · {event.city}</small></span>
              </Link>
            );
          })}
          <Link to="/events" className="landing-ticker__next" aria-label="View all events"><ArrowRight /></Link>
        </div>
      </section>

      <main className="landing-main">
        <section className="landing-section container container--wide" aria-labelledby="upcoming-heading">
          <ScrollReveal>
            <div className="landing-section-head">
              <div><p className="landing-kicker">On sale now</p><h2 id="upcoming-heading">What’s on this season</h2><p>The next few weeks, in one place.</p></div>
              <Link to="/events" className="landing-link">View all events <ArrowRight size={15} /></Link>
            </div>
          </ScrollReveal>
          <div className="landing-events" aria-live="polite">
            {visibleEvents.length > 0 ? visibleEvents.map((event) => {
              const date = eventDateParts(event.eventDate);
              return (
                <Link to={`/events/${event.slug}`} className="landing-event" key={event.id}>
                  <div className="landing-event__art" style={cardImageStyle(event)}><span className="landing-event__date"><b>{date.day}</b>{date.month}</span></div>
                  <div className="landing-event__body">
                    <h3>{event.title.split('—')[0].trim()}</h3><p>{event.category}</p>
                    <span><MapPin size={12} /> {event.city}</span><span className="landing-event__price">{formatLkr(event.priceFromLkr)}</span>
                  </div>
                </Link>
              );
            }) : <p className="landing-empty">No {activeCategory.toLowerCase()} events on sale right now. Check back soon.</p>}
          </div>
        </section>

        <section className="landing-section container container--wide">
          <ScrollReveal>
            <div className="landing-why">
              <div className="landing-why__intro"><p className="landing-kicker">Why Arcane</p><h2>What you<br />actually get</h2></div>
              {features.map(({ icon: Icon, title, copy }) => <article className="landing-feature" key={title}><span className="landing-icon"><Icon /></span><h3>{title}</h3><p>{copy}</p></article>)}
            </div>
          </ScrollReveal>
        </section>

        <section className="landing-section container">
          <ScrollReveal>
            <div className="landing-journey">
              <div className="landing-journey__copy"><p className="landing-kicker">The Arcane journey</p><h2>From the list<br />to the door.</h2><p>See it, book it, walk in. No queues, no printed tickets, no guest-list games.</p><ul><li><Check /> A tight, curated list</li><li><Check /> Tickets on your phone in seconds</li><li><Check /> Scan and walk straight in</li></ul></div>
              <div className="landing-journey__visual" style={heroStyle} aria-label="A violet-lit entrance to an Arcane experience" />
            </div>
          </ScrollReveal>
        </section>

        <section className="landing-scenes" aria-labelledby="scenes-heading">
          <div className="container container--wide"><p className="landing-kicker">Browse by night</p><div className="landing-scenes__head"><h2 id="scenes-heading">Find your scene</h2><Link to="/events" className="landing-link">Browse all events <ArrowRight size={15} /></Link></div><div className="landing-scenes__pills" role="group" aria-label="Filter featured events by category">{categories.map((category) => <button key={category} type="button" aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)}>{category}</button>)}</div></div>
        </section>

        <section className="landing-section container">
          <ScrollReveal><div className="landing-membership"><div className="landing-membership__intro"><p className="landing-kicker">Membership</p><h2>More than tickets.</h2><p>Arcane membership is about getting in — early windows, private rooms, and a faster door on the nights that sell out.</p></div><div className="landing-membership__grid">{membership.map(({ icon: Icon, title, copy }) => <article key={title}><span className="landing-icon"><Icon /></span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></ScrollReveal>
        </section>

        <section className="landing-final" style={heroStyle}><div className="landing-final__content"><p className="landing-kicker">The night is yours</p><h2 className="accent-serif">Your next night<br />starts here.</h2><div className="landing-actions landing-actions--center"><Link to="/events" className={buttonClass('gold', 'lg')}>Explore events <ArrowRight size={16} /></Link><Link to="/tickets" className={buttonClass('ghost', 'lg')}>My tickets</Link></div></div></section>
      </main>
    </div>
  );
}
