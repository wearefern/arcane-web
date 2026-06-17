import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Wordmark } from '../../components/brand/Wordmark';
import { Card } from '../../components/ui/Card';
import { Field, Input } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { scannerLogin } from '../../services/authService';

/**
 * /scanner/login — full-screen gate sign-in. Rendered outside ScannerLayout.
 * Purely functional: big, legible inputs for use on a phone at the door.
 */
export default function ScannerLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      await scannerLogin(email, password);
      navigate('/scanner/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Try again.');
      setLoading(false);
    }
  }

  return (
    <div className="scanner-auth">
      <Card pad="lg" style={{ width: '100%', maxWidth: 410 }}>
        <Wordmark suffix="Scan" size="sm" />

        <div style={{ marginTop: 'var(--space-6)' }}>
          <p className="eyebrow">Gate access</p>
          <h2 className="display" style={{ fontSize: 'var(--fs-h2)', marginTop: 'var(--space-3)' }}>
            Scanner sign in
          </h2>
        </div>

        <form onSubmit={onSubmit} noValidate style={{ marginTop: 'var(--space-7)' }}>
          <div className="stack" style={{ ['--gap' as string]: 'var(--space-5)' }}>
            <Field label="Email" htmlFor="scanner-email">
              <Input
                id="scanner-email"
                type="email"
                name="email"
                autoComplete="username"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="you@arcane.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>

            <Field label="Gate PIN / Password" htmlFor="scanner-password">
              <Input
                id="scanner-password"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>

            {error && (
              <p
                className="error-text"
                role="alert"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <AlertCircle size={14} aria-hidden /> {error}
              </p>
            )}

            <Button type="submit" variant="gold" size="lg" block loading={loading}>
              Sign in
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
