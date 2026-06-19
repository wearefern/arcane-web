import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CalendarDays, MapPin, ShieldCheck, Lock } from 'lucide-react';
import type {
  EventWithTickets,
  PaymentMethod,
  PaymentProvider,
  TicketType,
} from '../../types';
import { ticketsAvailable } from '../../types';
import { getEventBySlug, listEvents, getEventById } from '../../services/eventsService';
import { listMethods } from '../../services/paymentsService';
import { createOrder } from '../../services/ordersService';
import { Card } from '../../components/ui/Card';
import { Field, Input, Checkbox } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { Stepper } from '../../components/ui/Stepper';
import { Skeleton, StateBlock } from '../../components/ui/Feedback';
import { useToast } from '../../components/ui/Toast';
import { formatDate, formatLkr, formatTime, plural } from '../../lib/format';
import { cn } from '../../lib/cn';
import { ScrollGlowSection } from '../../components/motion/ScrollGlowSection';

const FEE_RATE = 0.025;

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  terms?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Checkout() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const slug = params.get('event');
  const ttParam = params.get('tt');
  const qtyParam = Number(params.get('qty'));

  const [event, setEvent] = useState<EventWithTickets | null>(null);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // form state
  const [ticketTypeId, setTicketTypeId] = useState<string | null>(null);
  const [qty, setQty] = useState(Number.isFinite(qtyParam) && qtyParam > 0 ? qtyParam : 1);
  const [provider, setProvider] = useState<PaymentProvider | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [ev, ms] = await Promise.all([
          slug ? getEventBySlug(slug) : Promise.resolve(undefined),
          listMethods(),
        ]);
        if (!active) return;
        // fall back to the first published event when no slug is supplied
        let resolved = ev;
        if (!resolved && !slug) {
          const list = await listEvents();
          if (!active) return;
          resolved = list[0] ? await getEventById(list[0].id) : undefined;
        }
        if (!resolved) {
          setNotFound(true);
          setMethods(ms);
          return;
        }
        setEvent(resolved);
        setMethods(ms);
        // pick the requested ticket type, else the first available, else the first
        const requested = resolved.ticketTypes.find((t) => t.id === ttParam);
        const firstSellable = resolved.ticketTypes.find((t) => ticketsAvailable(t) > 0);
        setTicketTypeId((requested ?? firstSellable ?? resolved.ticketTypes[0])?.id ?? null);
        setProvider(ms[0]?.id ?? null);
      } catch {
        if (active) setLoadError(true);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [slug, ttParam]);

  const ticket: TicketType | undefined = useMemo(
    () => event?.ticketTypes.find((t) => t.id === ticketTypeId),
    [event, ticketTypeId],
  );

  const available = ticket ? ticketsAvailable(ticket) : 0;
  const maxQty = ticket ? Math.max(1, Math.min(ticket.perOrderLimit, available)) : 1;

  // Derive the effective quantity so it always stays within the allowed range,
  // even right after the ticket type (and therefore maxQty) changes.
  const qtyClamped = Math.min(Math.max(1, qty), maxQty);

  const unitPrice = ticket?.priceLkr ?? 0;
  const subtotal = unitPrice * qtyClamped;
  const fees = Math.round(subtotal * FEE_RATE);
  const total = subtotal + fees;

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!name.trim()) next.name = 'Enter the name on the booking.';
    if (!email.trim()) next.email = 'Enter your email address.';
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!phone.trim()) next.phone = 'Enter a contact number.';
    if (!agreed) next.terms = 'Please accept the terms to continue.';
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!event || !ticket || !provider) return;
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const order = await createOrder({
        eventId: event.id,
        items: [
          {
            ticketTypeId: ticket.id,
            ticketTypeName: ticket.name,
            qty: qtyClamped,
            unitPriceLkr: unitPrice,
          },
        ],
        buyerName: name.trim(),
        buyerEmail: email.trim(),
        buyerPhone: phone.trim(),
        provider,
      });
      navigate(`/payment/pending?ref=${encodeURIComponent(order.reference)}`);
    } catch {
      setSubmitting(false);
      toast.toast({
        tone: 'error',
        title: "We couldn't start your order",
        body: 'Please try again in a moment.',
      });
    }
  }

  /* ---- Loading ---- */
  if (!event && !loadError && !notFound) {
    return (
      <section className="section">
        <div className="container container--wide">
          <div className="checkout-layout">
            <div className="stack" style={{ ['--gap' as string]: 'var(--space-6)' }}>
              <Skeleton w={180} h={13} />
              <Card>
                <Skeleton w="40%" h={14} />
                <Skeleton w="100%" h={46} style={{ marginTop: 'var(--space-5)' }} />
                <Skeleton w="100%" h={46} style={{ marginTop: 'var(--space-5)' }} />
                <Skeleton w="100%" h={46} style={{ marginTop: 'var(--space-5)' }} />
              </Card>
            </div>
            <Card className="checkout-summary">
              <Skeleton w="60%" h={16} />
              <Skeleton w="100%" h={120} style={{ marginTop: 'var(--space-5)' }} />
              <Skeleton w="100%" h={46} style={{ marginTop: 'var(--space-6)' }} />
            </Card>
          </div>
        </div>
      </section>
    );
  }

  /* ---- Error / not found ---- */
  if (loadError || notFound) {
    return (
      <section className="section">
        <div className="container container--wide">
          <StateBlock
            title={loadError ? "We couldn't load checkout" : 'Event unavailable'}
            body={
              loadError
                ? 'Something went wrong on our side. Please refresh to try again.'
                : "We couldn't find that event. It may have closed or moved."
            }
            action={
              <Link to="/events" className="btn btn--outline">
                Browse events
              </Link>
            }
          />
        </div>
      </section>
    );
  }

  const soldOut = !ticket || available <= 0;

  return (
    <section className="section">
      <div className="container container--wide">
        <Link
          to={`/events/${event!.slug}`}
          className="row"
          style={{
            gap: 6,
            color: 'var(--text-3)',
            fontSize: 'var(--fs-sm)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <ArrowLeft size={14} /> Back to event
        </Link>

        <header style={{ marginBottom: 'var(--space-8)' }}>
          <p className="eyebrow">Checkout</p>
          <h1 className="display" style={{ marginTop: 'var(--space-4)', fontSize: 'var(--fs-h1)' }}>
            Secure your spot
          </h1>
        </header>

        <form className="checkout-layout" onSubmit={handleSubmit} noValidate>
          {/* ---- LEFT: buyer + payment ---- */}
          <div className="stack" style={{ ['--gap' as string]: 'var(--space-7)' }}>
            <ScrollGlowSection className="checkout-glow" aria-labelledby="buyer-heading">
              <h2
                className="eyebrow eyebrow--plain"
                id="buyer-heading"
                style={{ color: 'var(--text-3)', marginBottom: 'var(--space-5)' }}
              >
                Your details
              </h2>
              <div className="stack" style={{ ['--gap' as string]: 'var(--space-5)' }}>
                <Field label="Full name" htmlFor="buyer-name" required error={errors.name}>
                  <Input
                    id="buyer-name"
                    autoComplete="name"
                    placeholder="Name on the booking"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
                <Field
                  label="Email"
                  htmlFor="buyer-email"
                  required
                  error={errors.email}
                  helper="Your tickets are sent here."
                >
                  <Input
                    id="buyer-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                <Field label="Phone" htmlFor="buyer-phone" required error={errors.phone}>
                  <Input
                    id="buyer-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+94 7X XXX XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Field>
              </div>
            </ScrollGlowSection>

            <ScrollGlowSection className="checkout-glow" aria-labelledby="pay-heading">
              <h2
                className="eyebrow eyebrow--plain"
                id="pay-heading"
                style={{ color: 'var(--text-3)', marginBottom: 'var(--space-5)' }}
              >
                Payment method
              </h2>
              <div
                className="stack"
                role="radiogroup"
                aria-label="Payment method"
                style={{ ['--gap' as string]: 'var(--space-3)' }}
              >
                {methods.map((m) => {
                  const selected = provider === m.id;
                  return (
                    <label key={m.id} className={cn('paymethod', selected && 'is-selected')}>
                      <input
                        type="radio"
                        name="provider"
                        value={m.id}
                        checked={selected}
                        onChange={() => setProvider(m.id)}
                        className="visually-hidden"
                      />
                      <span className="paymethod__radio" aria-hidden />
                      <span className="paymethod__logo" aria-hidden>
                        {m.name.charAt(0)}
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <span className="t-1" style={{ display: 'block', fontSize: 'var(--fs-sm)' }}>
                          {m.name}
                        </span>
                        <span className="meta">{m.blurb}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </ScrollGlowSection>

            <ScrollGlowSection className="checkout-glow checkout-glow--terms">
              <Field error={errors.terms}>
                <Checkbox
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  label={
                    <span className="meta" style={{ color: 'var(--text-2)' }}>
                      I agree to the{' '}
                      <Link to="/events" className="t-gold">
                        terms of sale
                      </Link>{' '}
                      and entry conditions.
                    </span>
                  }
                />
              </Field>
            </ScrollGlowSection>
          </div>

          {/* ---- RIGHT: summary ---- */}
          <ScrollGlowSection className="checkout-summary checkout-glow checkout-glow--summary">
          <Card pad="lg">
            <p className="eyebrow eyebrow--plain" style={{ color: 'var(--text-3)' }}>
              Order summary
            </p>
            <h2 style={{ marginTop: 'var(--space-3)', fontSize: 'var(--fs-h3)' }}>{event!.title}</h2>

            <div
              className="stack"
              style={{ ['--gap' as string]: 'var(--space-2)', marginTop: 'var(--space-4)' }}
            >
              <span className="meta row" style={{ gap: 8 }}>
                <CalendarDays size={14} aria-hidden /> {formatDate(event!.eventDate)} ·{' '}
                {formatTime(event!.eventDate)}
              </span>
              <span className="meta row" style={{ gap: 8 }}>
                <MapPin size={14} aria-hidden /> {event!.venue}, {event!.city}
              </span>
            </div>

            <hr className="divider" style={{ margin: 'var(--space-6) 0' }} />

            {ticket ? (
              <>
                <div className="row row--between" style={{ alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                  <div style={{ minWidth: 0 }}>
                    <p className="t-1" style={{ fontSize: 'var(--fs-sm)' }}>
                      {ticket.name}
                    </p>
                    <p className="meta" style={{ marginTop: 2 }}>
                      {formatLkr(unitPrice)} each
                    </p>
                  </div>
                  <Stepper value={qtyClamped} onChange={setQty} min={1} max={maxQty} label="Quantity" />
                </div>

                <p className="meta" style={{ marginTop: 'var(--space-3)' }}>
                  {available > 0
                    ? `${plural(available, 'ticket')} left · max ${maxQty} per order`
                    : 'Sold out'}
                </p>

                <hr className="divider" style={{ margin: 'var(--space-6) 0' }} />

                <div className="dl">
                  <div className="dl__row">
                    <span className="dl__key">Subtotal</span>
                    <span className="dl__val mono">{formatLkr(subtotal)}</span>
                  </div>
                  <div className="dl__row">
                    <span className="dl__key">Booking fee (2.5%)</span>
                    <span className="dl__val mono">{formatLkr(fees)}</span>
                  </div>
                </div>

                <div
                  className="row row--between"
                  style={{ marginTop: 'var(--space-5)', alignItems: 'baseline' }}
                >
                  <span className="t-1" style={{ fontSize: 'var(--fs-base)' }}>
                    Total
                  </span>
                  <span
                    className="mono t-1"
                    style={{ fontSize: 'var(--fs-h3)', letterSpacing: 0 }}
                  >
                    {formatLkr(total)}
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  block
                  loading={submitting}
                  disabled={soldOut}
                  style={{ marginTop: 'var(--space-6)' }}
                >
                  {soldOut ? 'Sold out' : 'Continue to payment'}
                  {!soldOut && !submitting && <ArrowRight size={17} />}
                </Button>

                <p
                  className="meta row"
                  style={{ gap: 8, justifyContent: 'center', marginTop: 'var(--space-5)' }}
                >
                  <Lock size={12} aria-hidden /> Encrypted checkout via{' '}
                  {methods.find((m) => m.id === provider)?.name ?? 'a secure gateway'}
                </p>
                <p
                  className="meta row"
                  style={{ gap: 8, justifyContent: 'center', marginTop: 'var(--space-2)' }}
                >
                  <ShieldCheck size={12} aria-hidden /> Tickets issued instantly to your email
                </p>
              </>
            ) : (
              <StateBlock
                title="No tickets available"
                body="This event has no tickets on sale right now."
              />
            )}
          </Card>
          </ScrollGlowSection>
        </form>
      </div>
    </section>
  );
}
