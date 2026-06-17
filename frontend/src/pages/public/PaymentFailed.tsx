import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, RotateCcw } from 'lucide-react';
import { Button, buttonClass } from '../../components/ui/Button';

export default function PaymentFailed() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const ref = params.get('ref') ?? '';

  function retry() {
    // Prefer returning to the checkout the buyer came from; fall back to a fresh one.
    if (window.history.length > 1) navigate(-1);
    else navigate('/checkout');
  }

  return (
    <div className="centered-wrap">
      <div className="status-card">
        <div className="status-mark status-mark--failed">
          <XCircle aria-hidden />
        </div>

        <p className="eyebrow eyebrow--plain" style={{ color: 'var(--gold-500)', justifyContent: 'center' }}>
          Payment
        </p>
        <h2 style={{ marginTop: 'var(--space-4)' }}>Payment didn't go through</h2>
        <p className="lead" style={{ marginTop: 'var(--space-4)', color: 'var(--text-3)' }}>
          No charge was made and your spot isn't held yet. This usually clears on a second attempt —
          give it another go.
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
          className="stack"
          style={{ ['--gap' as string]: 'var(--space-3)', marginTop: 'var(--space-8)' }}
        >
          <Button variant="gold" size="lg" block onClick={retry}>
            <RotateCcw size={16} /> Retry checkout
          </Button>
          <Link to="/events" className={buttonClass('ghost', 'md', 'btn--block')}>
            Back to events
          </Link>
        </div>
      </div>
    </div>
  );
}
