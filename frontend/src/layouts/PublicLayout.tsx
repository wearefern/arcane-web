import { useEffect, useLayoutEffect, useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Ticket, Sparkles } from 'lucide-react';
import { Wordmark } from '../components/brand/Wordmark';
import { buttonClass } from '../components/ui/Button';
import { cn } from '../lib/cn';
import { ScrollGlowSection } from '../components/motion/ScrollGlowSection';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/events', label: 'Events', end: false },
  { to: '/tickets', label: 'My Tickets', end: false },
];

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 20);
  const location = useLocation();

  // close the mobile sheet whenever the route changes
  const pathKey = location.pathname;

  // Client-side route changes retain the previous document scroll position.
  // Reset before paint so checkout and other destination pages always open at
  // their header instead of inheriting a footer-level position.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className={cn('pubnav', scrolled && 'is-scrolled')}>
        <div className="pubnav__inner">
          <Link to="/" aria-label="Arcane home">
            <Wordmark />
          </Link>

          <nav className="pubnav__links" aria-label="Primary">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) => cn('pubnav__link', isActive && 'is-active')}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="pubnav__right">
            <Link to="/events" className={buttonClass('gold', 'sm')}>
              <Sparkles size={14} /> Browse events
            </Link>
            <button
              className="icon-btn icon-btn--plain pubnav__toggle"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <nav className="pubmenu" aria-label="Mobile" key={pathKey}>
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => cn(isActive && 'is-active')}
            >
              {l.label}
            </NavLink>
          ))}
          <Link to="/tickets" onClick={() => setMenuOpen(false)} className={buttonClass('gold', 'md', 'btn--block')} style={{ marginTop: 'var(--space-3)' }}>
            <Ticket size={16} /> Find my tickets
          </Link>
        </nav>
      )}

      <main id="main" className="cosmic-route-surface" style={{ flex: 1 }}>
        <div className="route-transition" key={`${location.pathname}${location.search}`}>
          <Outlet />
        </div>
      </main>

      <footer className="foot">
        <div className="container container--wide">
          <ScrollGlowSection className="foot__glow">
          <div className="foot__inner">
            <div className="foot__brand">
              <Wordmark />
              <p className="foot__tag">
                A quiet door to the city's most considered nights. Curated events across Colombo and beyond.
              </p>
            </div>
            <div className="foot__col">
              <h4>Discover</h4>
              <Link to="/events">All events</Link>
              <Link to="/events">This weekend</Link>
              <Link to="/tickets">My tickets</Link>
            </div>
            <div className="foot__col">
              <h4>Arcane</h4>
              <a href="#about">About</a>
              <a href="#terms">Terms of entry</a>
              <a href="#privacy">Privacy</a>
            </div>
          </div>
          <div className="foot__bar">
            <span>© 2026 Arcane. Colombo.</span>
            <span className="mono">Members-first ticketing</span>
          </div>
          </ScrollGlowSection>
        </div>
      </footer>
    </>
  );
}
