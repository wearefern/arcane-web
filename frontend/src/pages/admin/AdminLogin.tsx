import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Wordmark } from '../../components/brand/Wordmark';
import { Card } from '../../components/ui/Card';
import { Field, Input } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { adminLogin } from '../../services/authService';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      await adminLogin(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <Card pad="lg" className="auth-card">
        <Wordmark suffix="Admin" />

        <div className="auth-card__head" style={{ marginTop: 'var(--space-6)' }}>
          <p className="eyebrow">Control room</p>
          <h2 className="display" style={{ fontSize: 'var(--fs-h2)', marginTop: 'var(--space-3)' }}>
            Sign in
          </h2>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <Field label="Email" required htmlFor="admin-email" error={error || undefined}>
              <Input
                id="admin-email"
                type="email"
                name="email"
                autoComplete="username"
                placeholder="you@arcane.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>

            <Field label="Password" required htmlFor="admin-password">
              <span style={{ position: 'relative', display: 'block' }}>
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: 'var(--space-9)' }}
                />
                <button
                  type="button"
                  className="icon-btn icon-btn--plain"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  style={{
                    position: 'absolute',
                    right: 4,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 34,
                    height: 34,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </Field>

            <Button type="submit" variant="gold" block loading={loading} style={{ marginTop: 'var(--space-2)' }}>
              Sign in
            </Button>
          </div>
        </form>

        <p className="auth-foot">Authorised staff only.</p>
      </Card>
    </div>
  );
}
