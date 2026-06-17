import { useEffect, useState } from 'react';
import { CloudOff, RefreshCw, Wifi, WifiOff, CheckCircle2, Ticket } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Switch } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { Spinner, StateBlock, LoadingBlock } from '../../components/ui/Feedback';
import { useToast } from '../../components/ui/Toast';
import { useScanner } from '../../layouts/ScannerLayout';
import { getPendingSync, syncNow } from '../../services/scannerService';
import type { ScanResultStatus } from '../../types';
import { formatRelative, formatDateTime } from '../../lib/format';
import { cn } from '../../lib/cn';

interface PendingItem {
  id: string;
  ticketId: string;
  eventTitle: string;
  result: ScanResultStatus;
  capturedAt: string;
}

/** Map a captured scan outcome to a Badge tone + short label. */
const RESULT_BADGE: Record<ScanResultStatus, { tone: 'emerald' | 'amber' | 'oxblood' | 'slate'; label: string }> = {
  VALID: { tone: 'emerald', label: 'Valid' },
  OFFLINE_VALID: { tone: 'emerald', label: 'Offline valid' },
  ALREADY_USED: { tone: 'amber', label: 'Already used' },
  WRONG_EVENT: { tone: 'amber', label: 'Wrong event' },
  VOID: { tone: 'oxblood', label: 'Void' },
  INVALID: { tone: 'oxblood', label: 'Invalid' },
};

/**
 * /scanner/sync — operations view for the offline scan queue. Shows connection
 * state, last sync, a large pending count, and the captured-offline scans.
 */
export default function SyncStatus() {
  const { online, setOnline } = useScanner();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [items, setItems] = useState<PendingItem[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let active = true;
    getPendingSync()
      .then((data) => {
        if (!active) return;
        setItems(data.items);
        setLastSyncedAt(data.lastSyncedAt);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const pending = items.length;

  async function onSync() {
    if (syncing || pending === 0) return;
    setSyncing(true);
    try {
      const { synced } = await syncNow();
      setItems([]);
      setLastSyncedAt(new Date().toISOString());
      toast({
        tone: 'success',
        title: 'Sync complete',
        body: `${synced} offline ${synced === 1 ? 'scan' : 'scans'} flushed to the server.`,
      });
    } catch {
      toast({ tone: 'error', title: 'Sync failed', body: 'Could not reach the server. Try again.' });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <p className="eyebrow">Operations</p>
        <h2 className="display" style={{ fontSize: 'var(--fs-h2)', marginTop: 'var(--space-3)' }}>
          Sync status
        </h2>
      </div>

      {loading ? (
        <LoadingBlock label="Checking the queue…" />
      ) : error ? (
        <StateBlock
          icon={<CloudOff />}
          title="Couldn't read the sync queue"
          body="Refresh to try again."
        />
      ) : (
        <div className="stack" style={{ ['--gap' as string]: 'var(--space-6)' }}>
          {/* ---- Status overview ---- */}
          <Card pad="lg">
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 'var(--space-4)',
              }}
            >
              <div>
                <span className={cn('conn', online ? 'conn--online' : 'conn--offline')}>
                  <span className="dot" aria-hidden />
                  {online ? 'Online' : 'Offline'}
                </span>
                <p className="meta" style={{ marginTop: 'var(--space-4)' }}>
                  Last synced{' '}
                  <span className="mono" style={{ color: 'var(--text-2)' }}>
                    {lastSyncedAt ? formatRelative(lastSyncedAt) : '—'}
                  </span>
                </p>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div
                  className="mono display"
                  style={{
                    fontSize: 'clamp(2.4rem, 12vw, 3.4rem)',
                    lineHeight: 1,
                    color: pending > 0 ? 'var(--text-1)' : 'var(--text-3)',
                  }}
                >
                  {pending}
                </div>
                <p
                  className="mono"
                  style={{
                    fontSize: 'var(--fs-2xs)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--text-4)',
                    marginTop: 'var(--space-2)',
                  }}
                >
                  Pending
                </p>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-6)' }}>
              <Button variant="gold" size="lg" block onClick={onSync} loading={syncing} disabled={pending === 0}>
                {syncing ? (
                  <>
                    <Spinner /> Syncing…
                  </>
                ) : (
                  <>
                    <RefreshCw size={17} aria-hidden /> Sync now
                  </>
                )}
              </Button>
            </div>

            <div
              style={{
                marginTop: 'var(--space-5)',
                paddingTop: 'var(--space-5)',
                borderTop: '1px solid var(--line-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-4)',
              }}
            >
              <span
                className="meta"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-2)' }}
              >
                {online ? <Wifi size={15} aria-hidden /> : <WifiOff size={15} aria-hidden />}
                Simulate offline
              </span>
              <Switch
                id="sim-offline"
                checked={!online}
                onChange={() => setOnline(!online)}
                aria-label="Simulate offline mode"
              />
            </div>
          </Card>

          {/* ---- Pending queue ---- */}
          {pending === 0 ? (
            <StateBlock
              icon={<CheckCircle2 />}
              title="All caught up"
              body="Every scan has been synced. Nothing is waiting in the queue."
            />
          ) : (
            <div>
              <p
                className="eyebrow eyebrow--plain"
                style={{ color: 'var(--text-3)', marginBottom: 'var(--space-4)' }}
              >
                Captured offline
              </p>
              <div className="stack" style={{ ['--gap' as string]: 'var(--space-3)' }}>
                {items.map((it) => {
                  const badge = RESULT_BADGE[it.result];
                  return (
                    <div key={it.id} className="sync-row">
                      <span className="sync-row__icon" aria-hidden>
                        <Ticket size={16} />
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          className="mono t-1"
                          style={{ fontSize: 'var(--fs-sm)' }}
                        >
                          {it.ticketId}
                        </div>
                        <div className="meta truncate" style={{ marginTop: 2 }}>
                          {it.eventTitle} · {formatDateTime(it.capturedAt)}
                        </div>
                      </div>
                      <Badge tone={badge.tone}>{badge.label}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
