import { useEffect, useState } from 'react';
import { Download, Users } from 'lucide-react';
import type { EventItem } from '../../types';
import type { AttendeeRow } from '../../services/adminService';
import { listAllEvents } from '../../services/eventsService';
import { exportAttendees } from '../../services/adminService';
import { Card } from '../../components/ui/Card';
import { Field, Select } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingBlock, StateBlock } from '../../components/ui/Feedback';
import { useToast } from '../../components/ui/Toast';
import { plural } from '../../lib/format';

const COLUMNS = ['Name', 'Email', 'Phone', 'Ticket type', 'Ticket ID', 'Status', 'Checked in'];

/** Wrap a CSV cell, escaping quotes and forcing text for safety. */
function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function buildCsv(rows: AttendeeRow[]): string {
  const header = COLUMNS.map(csvCell).join(',');
  const body = rows.map((r) =>
    [
      r.name,
      r.email,
      r.phone,
      r.ticketType,
      r.ticketId,
      r.status,
      r.checkedIn ? 'Yes' : 'No',
    ]
      .map((v) => csvCell(String(v)))
      .join(','),
  );
  return [header, ...body].join('\r\n');
}

export default function Export() {
  const { toast } = useToast();

  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [eventId, setEventId] = useState('');
  const [eventsError, setEventsError] = useState(false);

  // `rows` belong to `loadedFor`; while it differs from `eventId` we're loading.
  const [rows, setRows] = useState<AttendeeRow[] | null>(null);
  const [loadedFor, setLoadedFor] = useState('');
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    let active = true;
    listAllEvents()
      .then((list) => {
        if (!active) return;
        setEvents(list);
        if (list.length) setEventId(list[0].id);
      })
      .catch(() => active && setEventsError(true));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!eventId) return;
    let active = true;
    exportAttendees(eventId)
      .then((list) => {
        if (!active) return;
        setRows(list);
        setLoadedFor(eventId);
        setPreviewError(false);
      })
      .catch(() => active && setPreviewError(true));
    return () => {
      active = false;
    };
  }, [eventId]);

  // While the loaded data is for a different event, treat the preview as loading.
  const loadingRows = !previewError && (rows === null || loadedFor !== eventId);

  function handleExport() {
    if (!rows || rows.length === 0) return;
    const csv = buildCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arcane-attendees-${eventId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      tone: 'success',
      title: 'Export ready',
      body: `${plural(rows.length, 'attendee')} downloaded as CSV.`,
    });
  }

  const showRows = rows !== null && loadedFor === eventId;
  const count = showRows ? rows.length : 0;
  const canExport = showRows && rows.length > 0;

  return (
    <>
      <div className="adminhead">
        <div>
          <p className="eyebrow">Reports</p>
          <h1 className="adminhead__title display">Attendee export</h1>
          <p className="adminhead__sub">
            Pull a full attendee manifest for any event as a CSV — names, contacts and check-in
            status.
          </p>
        </div>
      </div>

      <Card pad="lg">
        <div
          className="export-controls"
          style={{
            display: 'flex',
            gap: 'var(--space-5)',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1 1 280px', minWidth: 0 }}>
            <Field label="Event" htmlFor="export-event" helper="Choose which night to export.">
              <Select
                id="export-event"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                disabled={!events || events.length === 0}
              >
                {eventsError && <option value="">Couldn't load events</option>}
                {!events && !eventsError && <option value="">Loading…</option>}
                {events?.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Button variant="gold" onClick={handleExport} disabled={!canExport}>
            <Download size={16} /> Export CSV
          </Button>
        </div>
      </Card>

      <div style={{ marginTop: 'var(--space-6)' }}>
        {eventsError ? (
          <StateBlock
            icon={<Users />}
            title="We couldn't load events"
            body="Please refresh to try again."
          />
        ) : previewError ? (
          <StateBlock
            icon={<Users />}
            title="We couldn't build the manifest"
            body="Something went wrong. Please refresh to try again."
          />
        ) : loadingRows || !showRows ? (
          <LoadingBlock label="Building manifest…" />
        ) : rows.length === 0 ? (
          <StateBlock
            icon={<Users />}
            title="No attendees yet"
            body="No tickets have been issued for this event, so there's nothing to export."
          />
        ) : (
          <>
            <p className="meta" style={{ marginBottom: 'var(--space-4)' }} aria-live="polite">
              {plural(count, 'attendee')}
            </p>
            <div className="table-wrap">
              <div className="table-scroll">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Ticket type</th>
                      <th>Ticket ID</th>
                      <th>Status</th>
                      <th>Checked in</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.ticketId}>
                        <td className="cell-strong">{r.name}</td>
                        <td>{r.email}</td>
                        <td className="cell-mono">{r.phone}</td>
                        <td>{r.ticketType}</td>
                        <td className="cell-mono">{r.ticketId}</td>
                        <td style={{ textTransform: 'capitalize' }}>{r.status}</td>
                        <td>
                          <Badge tone={r.checkedIn ? 'emerald' : 'neutral'} dot>
                            {r.checkedIn ? 'Yes' : 'No'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
