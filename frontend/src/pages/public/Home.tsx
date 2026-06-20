import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Compass, Crown, MapPin, ScanLine, Sparkles, Star, TicketCheck, Users } from 'lucide-react';
import { EVENTS } from '../../data/events';
import { formatLkr } from '../../lib/format';
import { ScrollReveal } from '../../components/motion/ScrollReveal';
import { ScrollGlowSection } from '../../components/motion/ScrollGlowSection';
import gateImage from '../../assets/landing/arcane-gate.png';

const categories = ['All', 'Club Night', 'Festival', 'Rooftop', 'Day Party', 'Gala', 'Concert'];
const featuredEvents = EVENTS.filter((event) => event.status === 'published').slice(0, 5);

const features = [
  { icon: Sparkles, title: 'Curated Access', copy: 'Every event is selected for atmosphere, quality, and experience.' },
  { icon: ScanLine, title: 'Seamless Entry', copy: 'Digital tickets, instant verification, effortless arrivals.' },
  { icon: Users, title: 'Member-First', copy: 'Priority access, exclusive releases, and curated recommendations.' },
];

const membership = [
  { icon: Crown, title: 'Priority Access', copy: 'Be first in line for the best events.' },
  { icon: Star, title: 'Exclusive Events', copy: 'Member-only experiences and private releases.' },
  { icon: TicketCheck, title: 'Faster Entry', copy: 'Skip the line. Enter effortlessly.' },
  { icon: Compass, title: 'Personal Discovery', copy: 'Curated events, shaped around your taste.' },
];

const testimonials = [
  { name: 'Adithya', initials: 'AD', quote: 'ARCANE changed the way I experience nights out in Colombo.' },
  { name: 'Tharushi', initials: 'TH', quote: 'Curated events, smooth entry, and a premium experience every time.' },
  { name: 'Rashan', initials: 'RA', quote: 'The only platform I trust for the best nights in the city.' },
];

const imageStyle = { '--gate-image': `url(${gateImage})` } as CSSProperties;

function eventDateParts(date: string) {
  const value = new Date(date);
  return {
    day: value.toLocaleDateString('en-GB', { day: '2-digit' }),
    month: value.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
  };
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All');
  const visibleEvents = activeCategory === 'All'
    ? featuredEvents
    : EVENTS.filter((event) => event.status === 'published' && event.category === activeCategory).slice(0, 5);

  return (
    <div className="landing">
      <section className="landing-hero" style={imageStyle}>
        <div className="landing-hero__beam" aria-hidden />
        <div className="landing-hero__content container container--wide">
          <div className="landing-hero__copy">
            <p className="landing-kicker">ARCANE <span>•</span> COLOMBO</p>
            <h1>Access<br /><em>the night.</em></h1>
            <p className="landing-hero__lede">A premium platform connecting members with carefully curated nightlife, festivals, rooftop sessions, cultural experiences, and exclusive events.</p>
            <div className="landing-actions">
              <Link to="/events" className="landing-button landing-button--primary">Explore Events <ArrowRight size={16} /></Link>
              <Link to="/tickets" className="landing-button landing-button--ghost">My Tickets</Link>
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
              <div><p className="landing-kicker">Curated events</p><h2 id="upcoming-heading">Upcoming Experiences</h2><p>Discover the next nights worth remembering.</p></div>
              <Link to="/events" className="landing-link">View all events <ArrowRight size={15} /></Link>
            </div>
          </ScrollReveal>
          <div className="landing-events" aria-live="polite">
            {visibleEvents.length > 0 ? visibleEvents.map((event, index) => {
              const date = eventDateParts(event.eventDate);
              return (
                <Link to={`/events/${event.slug}`} className={`landing-event landing-event--${index}`} key={event.id}>
                  <div className="landing-event__art" style={imageStyle}><span className="landing-event__date"><b>{date.day}</b>{date.month}</span></div>
                  <div className="landing-event__body">
                    <h3>{event.title.split('—')[0].trim()}</h3><p>{event.category}</p>
                    <span><MapPin size={12} /> {event.city}</span><span className="landing-event__price">{formatLkr(event.priceFromLkr)}</span>
                  </div>
                </Link>
              );
            }) : <p className="landing-empty">New {activeCategory.toLowerCase()} experiences are being curated.</p>}
          </div>
        </section>

        <section className="landing-section container container--wide">
          <ScrollGlowSection className="landing-why">
            <div className="landing-why__intro"><p className="landing-kicker">Why Arcane</p><h2>Designed Around<br />Experience</h2></div>
            {features.map(({ icon: Icon, title, copy }) => <article className="landing-feature" key={title}><span className="landing-icon"><Icon /></span><h3>{title}</h3><p>{copy}</p></article>)}
          </ScrollGlowSection>
        </section>

        <section className="landing-section container container--wide">
          <ScrollReveal>
            <div className="landing-journey">
              <div className="landing-journey__copy"><p className="landing-kicker">The Arcane journey</p><h2>Every detail<br />considered.</h2><p>From discovery to arrival, ARCANE creates a seamless journey through the city's most memorable events.</p><ul><li><Check /> Considered discovery</li><li><Check /> Instant digital access</li><li><Check /> Effortless arrival</li></ul></div>
              <div className="landing-journey__visual" style={imageStyle} aria-label="A violet-lit entrance to an Arcane experience" />
            </div>
          </ScrollReveal>
        </section>

        <section className="landing-scenes" aria-labelledby="scenes-heading">
          <div className="container container--wide"><p className="landing-kicker">Explore by vibe</p><div className="landing-scenes__head"><h2 id="scenes-heading">Find Your Scene</h2><Link to="/events" className="landing-link">Browse all events <ArrowRight size={15} /></Link></div><div className="landing-scenes__pills" role="group" aria-label="Filter featured events by category">{categories.map((category) => <button key={category} type="button" aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)}>{category}</button>)}</div></div>
        </section>

        <section className="landing-section container container--wide">
          <ScrollReveal><div className="landing-membership"><div className="landing-membership__intro"><p className="landing-kicker">Membership</p><h2>More than tickets.</h2><p>Gain access to exclusive releases, priority entry opportunities, curated recommendations, and members-only experiences.</p></div><div className="landing-membership__grid">{membership.map(({ icon: Icon, title, copy }) => <article key={title}><span className="landing-icon"><Icon /></span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></ScrollReveal>
        </section>

        <section className="landing-section container container--wide">
          <ScrollReveal><div className="landing-trust"><div className="landing-trust__intro"><p className="landing-kicker">Trusted community</p><h2>Trusted by the<br />city’s night crowd</h2></div><div className="landing-testimonials">{testimonials.map((item) => <figure key={item.name}><figcaption><span>{item.initials}</span><b>{item.name}</b><small>Member</small></figcaption><blockquote>“{item.quote}”</blockquote><div aria-label="5 out of 5 stars">★★★★★</div></figure>)}</div></div></ScrollReveal>
        </section>

        <section className="landing-final" style={imageStyle}><div className="landing-final__content"><p className="landing-kicker">The night is yours</p><h2>Your next night<br />starts here.</h2><div className="landing-actions landing-actions--center"><Link to="/events" className="landing-button landing-button--primary">Explore Events</Link><Link to="/tickets" className="landing-button landing-button--ghost">My Tickets</Link></div></div></section>
      </main>
    </div>
  );
}
