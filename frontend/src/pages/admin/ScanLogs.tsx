import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { EventItem, ScanLog, ScanResultStatus } from '../../types';
import { listScanLogs } from '../../services/scannerService';
import { listAllEvents } from '../../services/eventsService';
import { Badge } from '../../components/ui/Badge';
import { Input, Select } from '../../components/ui/Field';
import { Skeleton, StateBlock } from '../../components/ui/Feedback';
import { Pagination } from '../../components/ui/Pagination';
import { formatDateTime } from '../../lib/format';

type ResultFilter = ScanResultStatus | 'all';
type BadgeTone = 'emerald' | 'amber' | 'oxblood';

const PAGE_SIZE = 12;

const RESULT_META: Record<ScanResultStatus, { tone: BadgeTone; label: string }> = {
  VALID: { tone: 'emerald', label: 'Valid' },
  OFFLINE_VALID: { tone: 'emerald', label: 'Offline valid' },
  ALREADY_USED: { tone: 'amber', label: 'Already used' },
  INVALID: { tone: 'oxblood', label: 'Invalid' },
  WRONG_EVENT: { tone: 'oxblood', label: 'Wrong event' },
  VOID: { tone: 'oxblood', label: 'Void' },
};

const RESULT_OPTIONS: { value: ResultFilter; label: string }[] = [
  { value: 'all', label: 'All results' },
  { value: 'VALID', label: 'Valid' },
  { value: 'OFFLINE_VALID', label: 'Offline valid' },
  { value: 'ALREADY_USED', label: 'Already used' },
  { value: 'INVALID', label: 'Invalid' },
  { value: 'WRONG_EVENT', label: 'Wrong event' },
  { value: 'VOID', label: 'Void' },
];

export default function ScanLogs() {
  const [logs, setLogs] = useState<ScanLog[] | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [eventId, setEventId] = useState('all');
  const [result, setResult] = useState<ResultFilter>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    listAllEvents()
      .then((rows) => active && setEvents(rows))
      .catch(() => {
        /* non-fatal: the event filter simply stays empty */
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    /* eslint-disable react-hooks/set-state-in-effect -- intentional reset keyed on filters before fetch */
    setLogs(null);
    setError(false);
    setPage(1); // new filter set → back to the first page
    /* eslint-enable react-hooks/set-state-in-effect */
    listScanLogs({ search, eventId: eventId === 'all' ? undefined : eventId, result })
      .then((rows) => active && setLogs(rows))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [search, eventId, result]);

  const pageCount = logs ? Math.max(1, Math.ceil(logs.length / PAGE_SIZE)) : 1;
  const pageRows = useMemo(() => {
    if (!logs) return [];
    const start = (page - 1) * PAGE_SIZE;
    return logs.slice(start, start + PAGE_SIZE);
  }, [logs, page]);

  return (
    <>
      <div className="adminhead">
        <div>
          <h1 className="adminhead__title">Scan logs</h1>
          <p className="adminhead__sub">A full audit trail of every gate scan — who, where, and the outcome.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar__search">
          <Input
            icon={<Search size={16} />}
            placeholder="Search ticket ID, gate, or operator"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search scan logs"
          />
        </div>
        <Select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          aria-label="Filter by event"
        >
          <option value="all">All events</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.title}</option>
          ))}
        </Select>
        <Select
          value={result}
          onChange={(e) => setResult(e.target.value as ResultFilter)}
          aria-label="Filter by result"
        >
          {RESULT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </div>

      {error ? (
        <StateBlock
          title="We couldn't load scan logs"
          body="Something went wrong fetching the audit trail. Refresh to try again."
        />
      ) : (
        <>
          <div className="table-wrap">
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Event</th>
                    <th>Ticket ID</th>
                    <th>Gate</th>
                    <th>Device</th>
                    <th>Operator</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {logs === null ? (
                    Array.from({ length: PAGE_SIZE }).map((_, i) => (
                      <tr key={i}>
                        <td><Skeleton w={130} h={13} /></td>
                        <td><Skeleton w={150} h={13} /></td>
                        <td><Skeleton w={104} h={13} /></td>
                        <td><Skeleton w={60} h={13} /></td>
                        <td><Skeleton w={90} h={13} /></td>
                        <td><Skeleton w={100} h={13} /></td>
                        <td><Skeleton w={84} h={20} radius={999} /></td>
                      </tr>
                    ))
                  ) : pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: 0 }}>
                        <StateBlock
                          title="No scans match"
                          body="Adjust your search or clear the filters to see more."
                        />
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((s) => {
                      const meta = RESULT_META[s.result];
                      return (
                        <tr key={s.id}>
                          <td className="mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-2)' }}>
                            {formatDateTime(s.scannedAt)}
                          </td>
                          <td>
                            <div className="truncate" style={{ maxWidth: 180 }}>{s.eventTitle}</div>
                          </td>
                          <td className="cell-mono">{s.ticketId}</td>
                          <td>{s.gate}</td>
                          <td>{s.device}</td>
                          <td>{s.operator}</td>
                          <td>
                            <Badge tone={meta.tone} dot>{meta.label}</Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {logs && logs.length > PAGE_SIZE && (
            <div className="row row--between" style={{ marginTop: 'var(--space-5)' }}>
              <span className="meta">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, logs.length)} of {logs.length}
              </span>
              <Pagination page={page} pageCount={pageCount} onChange={setPage} />
            </div>
          )}
        </>
      )}
    </>
  );
}
