import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search } from 'lucide-react';
import type { Order, OrderStatus, PaymentProvider } from '../../types';
import { listOrders } from '../../services/ordersService';
import { StatusBadge } from '../../components/ui/Badge';
import { Input, Select } from '../../components/ui/Field';
import { Skeleton, StateBlock } from '../../components/ui/Feedback';
import { Pagination } from '../../components/ui/Pagination';
import { formatDate, formatLkr } from '../../lib/format';

type StatusFilter = OrderStatus | 'all';
type ProviderFilter = PaymentProvider | 'all';

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PROVIDER_OPTIONS: { value: ProviderFilter; label: string }[] = [
  { value: 'all', label: 'All providers' },
  { value: 'payhere', label: 'PayHere' },
  { value: 'koko', label: 'Koko' },
];

const PROVIDER_LABEL: Record<PaymentProvider, string> = {
  payhere: 'PayHere',
  koko: 'Koko',
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [provider, setProvider] = useState<ProviderFilter>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    setOrders(null);
    setError(false);
    setPage(1); // new filter set → back to the first page
    listOrders({ search, status, provider })
      .then((rows) => active && setOrders(rows))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [search, status, provider]);

  const pageCount = orders ? Math.max(1, Math.ceil(orders.length / PAGE_SIZE)) : 1;
  const pageRows = useMemo(() => {
    if (!orders) return [];
    const start = (page - 1) * PAGE_SIZE;
    return orders.slice(start, start + PAGE_SIZE);
  }, [orders, page]);

  return (
    <>
      <div className="adminhead">
        <div>
          <h1 className="adminhead__title">Orders</h1>
          <p className="adminhead__sub">Every purchase across the door — search, filter, and open any order to dig in.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar__search">
          <Input
            icon={<Search size={16} />}
            placeholder="Search buyer, email, reference, or event"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search orders"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
        <Select
          value={provider}
          onChange={(e) => setProvider(e.target.value as ProviderFilter)}
          aria-label="Filter by provider"
        >
          {PROVIDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </div>

      {error ? (
        <StateBlock
          title="We couldn't load orders"
          body="Something went wrong fetching orders. Refresh to try again."
        />
      ) : (
        <>
          <div className="table-wrap">
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Buyer</th>
                    <th>Event</th>
                    <th className="cell-num">Amount</th>
                    <th>Provider</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th className="cell-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders === null ? (
                    Array.from({ length: PAGE_SIZE }).map((_, i) => (
                      <tr key={i}>
                        <td><Skeleton w={96} h={13} /></td>
                        <td>
                          <Skeleton w="70%" h={13} />
                          <Skeleton w="50%" h={11} style={{ marginTop: 8 }} />
                        </td>
                        <td><Skeleton w={140} h={13} /></td>
                        <td className="cell-num"><Skeleton w={80} h={13} /></td>
                        <td><Skeleton w={70} h={13} /></td>
                        <td><Skeleton w={76} h={20} radius={999} /></td>
                        <td><Skeleton w={110} h={13} /></td>
                        <td className="cell-actions"><Skeleton w={64} h={28} /></td>
                      </tr>
                    ))
                  ) : pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: 0 }}>
                        <StateBlock
                          title="No orders match"
                          body="Adjust your search or clear the filters to see more."
                        />
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((o) => (
                      <tr key={o.id}>
                        <td className="cell-mono">{o.reference}</td>
                        <td>
                          <div className="cell-strong">{o.buyerName}</div>
                          <div className="meta truncate" style={{ marginTop: 2, maxWidth: 220 }}>{o.buyerEmail}</div>
                        </td>
                        <td>
                          <div className="truncate" style={{ maxWidth: 200 }}>{o.eventTitle}</div>
                        </td>
                        <td className="cell-num mono" style={{ whiteSpace: 'nowrap' }}>{formatLkr(o.totalLkr)}</td>
                        <td>{PROVIDER_LABEL[o.provider]}</td>
                        <td><StatusBadge kind="order" value={o.status} /></td>
                        <td className="mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-3)' }}>{formatDate(o.createdAt)}</td>
                        <td className="cell-actions">
                          <Link
                            to={`/admin/orders/${o.id}`}
                            className="row"
                            style={{ gap: 4, justifyContent: 'flex-end', color: 'var(--text-2)', fontSize: 'var(--fs-sm)' }}
                          >
                            View <ArrowUpRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {orders && orders.length > PAGE_SIZE && (
            <div className="row row--between" style={{ marginTop: 'var(--space-5)' }}>
              <span className="meta">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, orders.length)} of {orders.length}
              </span>
              <Pagination page={page} pageCount={pageCount} onChange={setPage} />
            </div>
          )}
        </>
      )}
    </>
  );
}
