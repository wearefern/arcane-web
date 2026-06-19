import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Ticket as TicketIcon, ArrowUpRight, Mail } from 'lucide-react';
import type { Ticket } from '../../types';
import { findTickets } from '../../services/ticketsService';
import { Card } from '../../components/ui/Card';
import { Field, Input } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { StateBlock, Spinner } from '../../components/ui/Feedback';
import { TicketCredential } from '../../components/ticket/TicketCredential';
import { plural } from '../../lib/format';
import { cn } from '../../lib/cn';

export default function MyTickets() {
  const [params] = useSearchParams();

  const [email, setEmail] = useState(params.get('email') ?? '');
  const [reference, setReference] = useState(params.get('ref') ?? '');
  const [results, setResults] = useState<Ticket[] | null>(null);
  // Start in the loading state when the URL already carries a lookup to run.
  const [loading, setLoading] = useState(() => Boolean(params.get('email') || params.get('ref')));
  const [error, setError] = useState(false);

  async function runSearch(emailValue: string, refValue: string) {
    const e = emailValue.trim();
    const r = refValue.trim();
    if (!e && !r) return;
    setLoading(true);
    setError(false);
    try {
      const found = await findTickets({ email: e || undefined, reference: r || undefined });
      setResults(found);
    } catch {
      setError(true);
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  // Auto-search on mount when a reference or email arrives via the URL. The
  // kickoff is deferred to a microtask so no state is set synchronously here.
  const auto = useRef(false);
  useEffect(() => {
    if (auto.current) return;
    auto.current = true;
    const e = params.get('email') ?? '';
    const r = params.get('ref') ?? '';
    if (!e && !r) return;
    let active = true;
    queueMicrotask(() => {
      if (active) void runSearch(e, r);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    void runSearch(email, reference);
  }

  const multi = (results?.length ?? 0) > 1;

  return (
    <section>
      <div className="container container--wide">
        <header className="pagehead">
          <p className="eyebrow">My tickets</p>
          <h1 className="pagehead__title display">Find your tickets</h1>
          <p className="pagehead__sub lead">
            Look up your tickets with the email you booked with, your order reference, or both.
          </p>
        </header>

        {/* ---- Lookup ---- */}
        <Card pad="lg" className="ticket-lookup">
          <form onSubmit={handleSubmit}>
            <div className="stack" style={{ ['--gap' as string]: 'var(--space-5)' }}>
              <Field label="Email" htmlFor="lookup-email" helper="The email used to book.">
                <Input
                  id="lookup-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  icon={<Mail size={16} aria-hidden />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field
                label="Order reference"
                htmlFor="lookup-ref"
                helper="Looks like ARC-7F3K2D. Found in your confirmation email."
              >
                <Input
                  id="lookup-ref"
                  className="mono"
                  placeholder="ARC-XXXXXX"
                  autoCapitalize="characters"
                  spellCheck={false}
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </Field>
              <div className="row">
                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  loading={loading}
                  disabled={!email.trim() && !reference.trim()}
                >
                  <Search size={16} /> Find tickets
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* ---- Results / states ---- */}
        <div style={{ marginTop: 'var(--space-8)' }}>
          {loading ? (
            <div
              className="row"
              style={{ gap: 8, justifyContent: 'center', padding: 'var(--space-8) 0' }}
              role="status"
              aria-live="polite"
            >
              <Spinner /> <span className="meta">Looking up your tickets…</span>
            </div>
          ) : error ? (
            <StateBlock
              title="We couldn't complete the search"
              body="Something went wrong on our side. Please try again in a moment."
            />
          ) : results === null ? (
            <StateBlock
              icon={<TicketIcon />}
              title="Your night, one search away"
              body="Enter the email or order reference from your confirmation and your passes will appear here."
            />
          ) : results.length === 0 ? (
            <StateBlock
              icon={<TicketIcon />}
              title="No tickets found"
              body="Double-check the email and reference match your confirmation. If you just paid, give it a minute and try again."
            />
          ) : (
            <>
              <p className="meta" style={{ marginBottom: 'var(--space-6)' }} aria-live="polite">
                {plural(results.length, 'ticket')} found
              </p>
              <div className={cn('ticket-results', multi && 'ticket-results--multi')}>
                {results.map((t) => (
                  <div key={t.id}>
                    <TicketCredential ticket={t} compact />
                    <div className="row row--end" style={{ marginTop: 'var(--space-3)' }}>
                      <Link
                        to={`/ticket/${t.id}`}
                        className="row"
                        style={{ gap: 6, color: 'var(--text-3)', fontSize: 'var(--fs-sm)' }}
                      >
                        View ticket <ArrowUpRight size={14} aria-hidden />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
