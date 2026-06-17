import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import type { Order, Ticket } from '../../types';
import { getOrder } from '../../services/ordersService';
import { getTicket } from '../../services/ticketsService';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { DefinitionList } from '../../components/ui/DefinitionList';
import { Skeleton, StateBlock, LoadingBlock } from '../../components/ui/Feedback';
import { buttonClass } from '../../components/ui/Button';
import { formatDateLong, formatDateTime, formatLkr } from '../../lib/format';

const PROVIDER_LABEL: Record<string, string> = {
  payhere: 'PayHere',
  koko: 'Koko',
};

export default function OrderDetail() {
  const { id = '' } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    setError(false);
    setOrder(null);
    setTickets(null);

    getOrder(id)
      .then(async (found) => {
        if (!active) return;
        if (!found) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setOrder(found);
        setLoading(false);
        // Fetch issued tickets in parallel; keep only the ones that resolve.
        const resolved = await Promise.all(found.ticketIds.map((tid) => getTicket(tid)));
        if (!active) return;
        setTickets(resolved.filter((t): t is Ticket => Boolean(t)));
      })
      .catch(() => {
        if (!active) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Link
          to="/admin/orders"
          className="row"
          style={{ gap: 6, color: 'var(--text-3)', fontSize: 'var(--fs-sm)' }}
        >
          <ArrowLeft size={15} /> Back to orders
        </Link>
      </div>

      {loading ? (
        <LoadingBlock label="Loading order…" />
      ) : notFound ? (
        <StateBlock
          title="Order not found"
          body="This order doesn't exist, or the reference has changed."
          action={
            <Link to="/admin/orders" className={buttonClass('outline', 'sm')}>
              Back to orders
            </Link>
          }
        />
      ) : error || !order ? (
        <StateBlock
          title="We couldn't load this order"
          body="Something went wrong. Refresh to try again."
        />
      ) : (
        <>
          <div className="adminhead">
            <div className="row" style={{ gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <h1 className="adminhead__title mono">{order.reference}</h1>
              <StatusBadge kind="order" value={order.status} />
            </div>
          </div>

          <div className="form-layout">
            {/* MAIN */}
            <div className="form-main">
              <Card>
                <h2 className="form-section-title">Buyer</h2>
                <DefinitionList
                  items={[
                    { key: 'Name', value: order.buyerName },
                    { key: 'Email', value: order.buyerEmail },
                    { key: 'Phone', value: order.buyerPhone, mono: true },
                  ]}
                />
              </Card>

              <Card>
                <h2 className="form-section-title">Event</h2>
                <DefinitionList
                  items={[
                    { key: 'Title', value: order.eventTitle },
                    { key: 'Date', value: formatDateLong(order.createdAt) },
                    {
                      key: 'Tickets',
                      value: order.items
                        .map((it) => `${it.qty} × ${it.ticketTypeName}`)
                        .join(', '),
                    },
                  ]}
                />
              </Card>

              <Card>
                <h2 className="form-section-title">Issued tickets</h2>
                {tickets === null ? (
                  <div className="stack" style={{ ['--gap' as string]: 'var(--space-3)' }}>
                    {order.ticketIds.map((tid) => (
                      <Skeleton key={tid} w="100%" h={48} radius={10} />
                    ))}
                  </div>
                ) : tickets.length === 0 ? (
                  <p className="meta">No tickets have been issued for this order yet.</p>
                ) : (
                  <div className="table-scroll">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Ticket ID</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th className="cell-actions">View</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.map((t) => (
                          <tr key={t.id}>
                            <td className="cell-mono">{t.id}</td>
                            <td>{t.ticketTypeName}</td>
                            <td><StatusBadge kind="ticket" value={t.status} /></td>
                            <td className="cell-actions">
                              <Link
                                to="/admin/tickets"
                                className="row"
                                style={{ gap: 4, justifyContent: 'flex-end', color: 'var(--text-2)', fontSize: 'var(--fs-sm)' }}
                                aria-label={`View ticket ${t.id}`}
                              >
                                Open <ArrowUpRight size={14} />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>

            {/* ASIDE */}
            <aside className="form-aside">
              <Card>
                <h2 className="form-section-title">Payment</h2>
                <DefinitionList
                  items={[
                    { key: 'Provider', value: PROVIDER_LABEL[order.provider] ?? order.provider },
                    { key: 'Payment', value: <StatusBadge kind="payment" value={order.paymentStatus} /> },
                    { key: 'Subtotal', value: formatLkr(order.subtotalLkr), mono: true },
                    { key: 'Fees', value: formatLkr(order.feesLkr), mono: true },
                  ]}
                />
                <div
                  className="row row--between"
                  style={{
                    marginTop: 'var(--space-5)',
                    paddingTop: 'var(--space-4)',
                    borderTop: '1px solid var(--line)',
                  }}
                >
                  <span className="t-3" style={{ fontSize: 'var(--fs-sm)' }}>Total</span>
                  <span className="mono t-1" style={{ fontSize: 'var(--fs-h4)' }}>{formatLkr(order.totalLkr)}</span>
                </div>
              </Card>

              <Card>
                <h2 className="form-section-title">Order placed</h2>
                <p className="mono t-2" style={{ fontSize: 'var(--fs-sm)' }}>{formatDateTime(order.createdAt)}</p>
              </Card>
            </aside>
          </div>
        </>
      )}
    </>
  );
}
