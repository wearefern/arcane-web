import { useSearchParams, useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Feedback';

export default function PaymentPending() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const ref = params.get('ref') ?? '';
  const refQuery = ref ? `?ref=${encodeURIComponent(ref)}` : '';

  return (
    <div className="centered-wrap">
      <div className="status-card">
        <div className="status-mark status-mark--pending">
          <Clock aria-hidden />
        </div>

        <p className="eyebrow eyebrow--plain" style={{ color: 'var(--gold-500)', justifyContent: 'center' }}>
          Payment
        </p>
        <h2 style={{ marginTop: 'var(--space-4)' }}>Completing your payment</h2>
        <p className="lead" style={{ marginTop: 'var(--space-4)', color: 'var(--text-3)' }}>
          We've handed you to our secure payment provider. Keep this window open — you'll return
          here automatically once it's done.
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

        <div
          className="row"
          style={{
            gap: 8,
            justifyContent: 'center',
            color: 'var(--text-4)',
            marginTop: 'var(--space-6)',
          }}
          aria-live="polite"
        >
          <Spinner />
          <span className="meta">Waiting for confirmation…</span>
        </div>

        {/* Frontend-only: simulate the provider callback. */}
        <div
          className="stack"
          style={{ ['--gap' as string]: 'var(--space-3)', marginTop: 'var(--space-8)' }}
        >
          <Button
            variant="gold"
            size="lg"
            block
            onClick={() => navigate(`/payment/success${refQuery}`)}
          >
            I've completed payment
          </Button>
          <Button variant="quiet" block onClick={() => navigate(`/payment/failed${refQuery}`)}>
            Cancel payment
          </Button>
        </div>
      </div>
    </div>
  );
}
