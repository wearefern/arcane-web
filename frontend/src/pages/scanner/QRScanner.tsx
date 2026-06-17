import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ScanLine, QrCode, Check, X, CloudOff, ChevronRight, CalendarX } from 'lucide-react';
import type { ScanResult, ScanResultStatus } from '../../types';
import { validateToken, DEMO_TOKENS } from '../../services/scannerService';
import { useScanner } from '../../layouts/ScannerLayout';
import { Spinner, StateBlock } from '../../components/ui/Feedback';
import { buttonClass } from '../../components/ui/Button';
import { formatTime } from '../../lib/format';
import { cn } from '../../lib/cn';

const VERDICT: Record<ScanResultStatus, { kind: 'valid' | 'reject' | 'offline'; verdict: string; sub: string }> = {
  VALID: { kind: 'valid', verdict: 'Admit', sub: 'Valid ticket' },
  OFFLINE_VALID: { kind: 'offline', verdict: 'Admit', sub: 'Valid · sync pending' },
  ALREADY_USED: { kind: 'reject', verdict: 'Reject', sub: 'Already used' },
  INVALID: { kind: 'reject', verdict: 'Reject', sub: 'Invalid ticket' },
  WRONG_EVENT: { kind: 'reject', verdict: 'Reject', sub: 'Wrong event' },
  VOID: { kind: 'reject', verdict: 'Reject', sub: 'Ticket void' },
};

const DEMO_LIST: { label: string; token: string }[] = [
  { label: 'Valid', token: DEMO_TOKENS.VALID },
  { label: 'Already used', token: DEMO_TOKENS.ALREADY_USED },
  { label: 'Wrong event', token: DEMO_TOKENS.WRONG_EVENT },
  { label: 'Void', token: DEMO_TOKENS.VOID },
  { label: 'Invalid', token: DEMO_TOKENS.INVALID },
];

export default function QRScanner() {
  const { selectedEvent, online } = useScanner();
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  async function check(value: string) {
    const t = value.trim();
    if (!t || !selectedEvent || busy) return;
    setBusy(true);
    try {
      const r = await validateToken(selectedEvent.id, t, { offline: !online });
      setResult(r);
    } finally {
      setBusy(false);
    }
  }

  if (!selectedEvent) {
    return (
      <StateBlock
        icon={<CalendarX />}
        title="No event selected"
        body="Choose the event this gate is scanning before you begin."
        action={<Link to="/scanner/events" className={buttonClass('gold')}>Select event</Link>}
      />
    );
  }

  return (
    <div className="stack" style={{ ['--gap' as string]: 'var(--space-5)', paddingTop: 'var(--space-4)' }}>
      <div>
        <p className="eyebrow">Gate · {online ? 'Online' : 'Offline'}</p>
        <h2 style={{ fontSize: 'var(--fs-h3)', marginTop: 'var(--space-2)' }}>Scan tickets</h2>
      </div>

      {/* camera viewport placeholder */}
      <div className="stage">
        <div className="stage__frame">
          <span /><span /><span /><span />
        </div>
        <div className="stage__scanline" />
        <div className="stage__hint">
          <QrCode />
          <span>Point at the guest's QR</span>
        </div>
      </div>

      {/* manual token */}
      <div>
        <label className="label" htmlFor="token" style={{ marginBottom: 'var(--space-2)' }}>Enter code manually</label>
        <div className="row" style={{ gap: 'var(--space-2)' }}>
          <input
            id="token"
            className="input mono"
            placeholder="Ticket token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && check(token)}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button className={buttonClass('gold', 'lg')} onClick={() => check(token)} disabled={busy || !token.trim()} aria-label="Validate ticket">
            {busy ? <Spinner /> : <ScanLine size={18} />}
          </button>
        </div>
      </div>

      {/* demo codes */}
      <div className="card card--pad-sm" style={{ background: 'var(--ink-850)' }}>
        <p className="cred-cell__label" style={{ marginBottom: 'var(--space-3)' }}>Sample codes — Solstice</p>
        <div className="row row--wrap" style={{ gap: 'var(--space-2)' }}>
          {DEMO_LIST.map((d) => (
            <button key={d.label} className="chip" onClick={() => check(d.token)} disabled={busy}>
              {d.label} <ChevronRight size={13} />
            </button>
          ))}
        </div>
      </div>

      {result && <ResultOverlay result={result} onNext={() => { setResult(null); setToken(''); }} />}
    </div>
  );
}

function ResultOverlay({ result, onNext }: { result: ScanResult; onNext: () => void }) {
  const v = VERDICT[result.status];
  const t = result.ticket;
  return createPortal(
    <div
      className={cn('scanresult', `scanresult--${v.kind}`)}
      style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-toast)' }}
      role="alertdialog"
      aria-label={`${v.verdict} — ${v.sub}`}
    >
      <div className="scanresult__icon">
        {v.kind === 'reject' ? <X strokeWidth={2.5} /> : <Check strokeWidth={2.5} />}
      </div>
      <div>
        <p className="scanresult__verdict">{v.verdict}</p>
        <p className="scanresult__reason" style={{ marginTop: 'var(--space-3)' }}>
          {v.kind === 'offline' && <CloudOff size={16} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />}
          {v.sub}
        </p>
      </div>

      {t && (
        <div className="scanresult__ticket">
          <div className="row"><span className="k">Holder</span><span className="v">{t.buyerName}</span></div>
          <div className="row"><span className="k">Ticket</span><span className="v">{t.ticketTypeName}</span></div>
          <div className="row"><span className="k">ID</span><span className="v mono">{t.id}</span></div>
          {result.status === 'ALREADY_USED' && t.usedAt && (
            <div className="row"><span className="k">Used</span><span className="v">{formatTime(t.usedAt)}</span></div>
          )}
        </div>
      )}
      {!t && <p className="scanresult__reason" style={{ fontSize: 'var(--fs-sm)', opacity: 0.8 }}>{result.message}</p>}

      <button className="btn--onfield" onClick={onNext} autoFocus>
        Scan next <ScanLine size={20} />
      </button>
    </div>,
    document.body,
  );
}
