import { useEffect, useState } from 'react';
import { NavLink, Outlet, useOutletContext, Link } from 'react-router-dom';
import { CalendarCheck, ScanLine, RefreshCw } from 'lucide-react';
import { Wordmark } from '../components/brand/Wordmark';
import type { EventItem } from '../types';
import { cn } from '../lib/cn';

export interface ScannerCtx {
  selectedEvent: EventItem | null;
  setSelectedEvent: (e: EventItem | null) => void;
  online: boolean;
  setOnline: (v: boolean) => void;
}

const STORE_KEY = 'arcane_scan_event';

const NAV = [
  { to: '/scanner/events', label: 'Select Event', icon: CalendarCheck, end: false },
  { to: '/scanner', label: 'Scanner', icon: ScanLine, end: true },
  { to: '/scanner/sync', label: 'Sync Status', icon: RefreshCw, end: false },
];

export function ScannerLayout() {
  const [selectedEvent, setSelectedEventState] = useState<EventItem | null>(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? (JSON.parse(raw) as EventItem) : null;
    } catch {
      return null;
    }
  });
  const [online, setOnline] = useState(true);

  const setSelectedEvent = (e: EventItem | null) => {
    setSelectedEventState(e);
    try {
      if (e) localStorage.setItem(STORE_KEY, JSON.stringify(e));
      else localStorage.removeItem(STORE_KEY);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    document.body.style.background = 'var(--ink-1000)';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  const ctx: ScannerCtx = { selectedEvent, setSelectedEvent, online, setOnline };

  return (
    <div className="scanner">
      <header className="scbar">
        {selectedEvent ? (
          <div className="scbar__event">
            <span className="scbar__event-label">Scanning</span>
            <span className="scbar__event-name truncate">{selectedEvent.title}</span>
          </div>
        ) : (
          <Link to="/scanner/events" aria-label="Arcane Scanner">
            <Wordmark suffix="Scan" size="sm" />
          </Link>
        )}

        <span className={cn('conn', online ? 'conn--online' : 'conn--offline')}>
          <span className="dot" aria-hidden />
          {online ? 'Online' : 'Offline'}
        </span>
      </header>

      <div className="scanner__body">
        <Outlet context={ctx} />
      </div>

      <nav className="scnav" aria-label="Scanner">
        {NAV.map((n) => {
          const Icon = n.icon;
          return (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => cn('scnav__item', isActive && 'is-active')}
            >
              <Icon />
              {n.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook shares the outlet context with <ScannerLayout>
export function useScanner(): ScannerCtx {
  return useOutletContext<ScannerCtx>();
}
