import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import type { Order } from '../../types';
import { getOrderByReference } from '../../services/ordersService';
import { buttonClass } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Feedback';
import { formatLkr, plural } from '../../lib/format';

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const ref = params.get('ref') ?? '';
  const refQuery = ref ? `?ref=${encodeURIComponent(ref)}` : '';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(Boolean(ref));

  useEffect(() => {
    if (!ref) return;
    let active = true;
    // `loading` is initialised from the ref, so no synchronous flip is needed here.
    getOrderByReference(ref)
      .then((o) => active && setOrder(o ?? null))
      .catch(() => active && setOrder(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [ref]);

  const totalTickets = order?.items.reduce((sum, it) => sum + it.qty, 0) ?? 0;

  return (
    <div className="centered-wrap">
      <div className="status-card">
        <div className="status-mark status-mark--success">
          <CheckCircle2 aria-hidden />
        </div>

        <p className="eyebrow eyebrow--plain" style={{ color: 'var(--gold-500)', justifyContent: 'center' }}>
          Confirmed
        </p>
        <h2 style={{ marginTop: 'var(--space-4)' }}>You're in.</h2>
        <p className="lead" style={{ marginTop: 'var(--space-4)', color: 'var(--text-3)' }}>
          Your tickets are issued and sent to your email. Show the QR at the door — that's all you
          need.
        </p>

        {ref && (
          <div
            className="row"
            style={{
              gap: 'var(--space-3)',
              justifyContent: 'center',
              marginTop: 'var(--space-6)',
            }}
          >
            <span className="meta">Reference</span>
            <span className="mono t-1" style={{ fontSize: 'var(--fs-base)', letterSpacing: '0.04em' }}>
              {ref}
            </span>
          </div>
        )}

        {/* Compact order summary when the reference resolves to a known order. */}
        {loading ? (
          <div style={{ marginTop: 'var(--space-6)' }}>
            <Skeleton w="100%" h={92} radius={12} />
          </div>
        ) : order ? (
          <div
            className="card card--pad"
            style={{ marginTop: 'var(--space-6)', textAlign: 'left' }}
          >
            <div className="dl">
              <div className="dl__row">
                <span className="dl__key">Event</span>
                <span className="dl__val">{order.eventTitle}</span>
              </div>
              <div className="dl__row">
                <span className="dl__key">Tickets</span>
                <span className="dl__val">{plural(totalTickets, 'ticket')}</span>
              </div>
              <div className="dl__row">
                <span className="dl__key">Total paid</span>
                <span className="dl__val mono">{formatLkr(order.totalLkr)}</span>
              </div>
            </div>
          </div>
        ) : null}

        <div
          className="stack"
          style={{ ['--gap' as string]: 'var(--space-3)', marginTop: 'var(--space-8)' }}
        >
          <Link to={`/tickets${refQuery}`} className={buttonClass('gold', 'lg', 'btn--block')}>
            View tickets <ArrowRight size={17} />
          </Link>
          <Link to="/events" className={buttonClass('ghost', 'md', 'btn--block')}>
            Back to events
          </Link>
        </div>
      </div>
    </div>
  );
}
