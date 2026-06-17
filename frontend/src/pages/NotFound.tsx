import { Link } from 'react-router-dom';
import { buttonClass } from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="centered-wrap">
      <div className="status-card">
        <p className="eyebrow" style={{ justifyContent: 'center' }}>Error 404</p>
        <h1 className="display" style={{ fontSize: 'var(--fs-h1)', marginTop: 'var(--space-5)' }}>Lost the thread</h1>
        <p className="lead" style={{ marginTop: 'var(--space-4)', marginInline: 'auto', maxWidth: '38ch' }}>
          This page has slipped off the list. Let's get you back to the door.
        </p>
        <div className="row" style={{ justifyContent: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-7)' }}>
          <Link to="/" className={buttonClass('gold')}>Back to Arcane</Link>
          <Link to="/events" className={buttonClass('ghost')}>Browse events</Link>
        </div>
      </div>
    </div>
  );
}
