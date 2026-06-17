import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Download, ScanLine, CalendarX } from 'lucide-react';
import type { EventItem } from '../../types';
import { listAssignedEvents } from '../../services/scannerService';
import { useScanner } from '../../layouts/ScannerLayout';
import { EventPoster } from '../../components/event/EventPoster';
import { Switch } from '../../components/ui/Field';
import { LoadingBlock, StateBlock } from '../../components/ui/Feedback';
import { buttonClass } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { formatDate } from '../../lib/format';
import { cn } from '../../lib/cn';

export default function EventSelect() {
  const { selectedEvent, setSelectedEvent, online, setOnline } = useScanner();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    listAssignedEvents()
      .then((e) => active && setEvents(e))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="stack" style={{ ['--gap' as string]: 'var(--space-5)', paddingTop: 'var(--space-4)' }}>
      <div>
        <p className="eyebrow">Gate</p>
        <h2 style={{ fontSize: 'var(--fs-h3)', marginTop: 'var(--space-2)' }}>Select event</h2>
      </div>

      <div className="card card--pad-sm" style={{ background: 'var(--ink-850)' }}>
        <div className="row row--between">
          <div>
            <div className="t-1" style={{ fontSize: 'var(--fs-sm)' }}>Work offline</div>
            <div className="meta" style={{ fontSize: 'var(--fs-xs)' }}>Validate from a cached guest list</div>
          </div>
          <Switch checked={!online} onChange={() => setOnline(!online)} aria-label="Work offline" />
        </div>
        <hr className="divider" style={{ margin: 'var(--space-4) 0' }} />
        <button
          className={buttonClass('ghost', 'sm', 'btn--block')}
          onClick={() => toast({ tone: 'success', title: 'Ticket cache downloaded', body: 'You can now validate offline.' })}
        >
          <Download size={15} /> Download ticket cache
        </button>
      </div>

      {error ? (
        <StateBlock title="Couldn't load events" body="Check your connection and retry." />
      ) : events === null ? (
        <LoadingBlock label="Loading events…" />
      ) : events.length === 0 ? (
        <StateBlock icon={<CalendarX />} title="No events assigned" body="Ask an organiser to assign this gate to an event." />
      ) : (
        <div className="stack" style={{ ['--gap' as string]: 'var(--space-3)' }}>
          {events.map((e) => {
            const active = selectedEvent?.id === e.id;
            return (
              <button
                key={e.id}
                className={cn('sc-event', active && 'is-active')}
                onClick={() => setSelectedEvent(e)}
                aria-pressed={active}
              >
                <EventPoster tone={e.tone} className="sc-event__poster" />
                <div style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
                  <div className="t-1 truncate" style={{ fontSize: 'var(--fs-sm)', fontWeight: 500 }}>{e.title}</div>
                  <div className="meta truncate" style={{ fontSize: 'var(--fs-xs)', marginTop: 2 }}>{e.venue} · {formatDate(e.eventDate)}</div>
                </div>
                {active && (
                  <span style={{ color: 'var(--gold-400)', flexShrink: 0 }}><Check size={20} /></span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {selectedEvent && (
        <button className={buttonClass('gold', 'lg', 'btn--block')} onClick={() => navigate('/scanner')}>
          Start scanning <ScanLine size={18} />
        </button>
      )}
    </div>
  );
}
