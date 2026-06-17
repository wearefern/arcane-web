import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Banknote,
  Receipt,
  Ticket,
  PackageOpen,
  UserCheck,
  TriangleAlert,
  ArrowUpRight,
} from 'lucide-react';
import type { DashboardStats, ScanResultStatus } from '../../types';
import { getDashboardStats } from '../../services/adminService';
import { StatCard } from '../../components/ui/Stat';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton, StateBlock } from '../../components/ui/Feedback';
import { formatLkr, formatNumber, formatRelative, initials } from '../../lib/format';

type ScanTone = 'emerald' | 'amber' | 'oxblood';
const SCAN_META: Record<ScanResultStatus, { tone: ScanTone; label: string }> = {
  VALID: { tone: 'emerald', label: 'Valid' },
  OFFLINE_VALID: { tone: 'emerald', label: 'Offline valid' },
  ALREADY_USED: { tone: 'amber', label: 'Already used' },
  INVALID: { tone: 'oxblood', label: 'Invalid' },
  WRONG_EVENT: { tone: 'oxblood', label: 'Wrong event' },
  VOID: { tone: 'oxblood', label: 'Void' },
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getDashboardStats()
      .then((s) => active && setStats(s))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, []);

  if (error) return <StateBlock title="Couldn't load the dashboard" body="Please refresh to try again." />;

  const maxRev = stats ? Math.max(...stats.revenueSeries.map((p) => p.value)) : 1;

  return (
    <>
      <div className="adminhead">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 className="adminhead__title">Dashboard</h1>
          <p className="adminhead__sub">Performance across all live events.</p>
        </div>
      </div>

      {!stats ? (
        <div className="stat-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} h={132} radius={14} />
          ))}
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <StatCard accent label="Revenue" icon={<Banknote />} value={formatLkr(stats.revenueLkr)} trend={stats.revenueTrend} foot="vs last period" />
            <StatCard label="Orders" icon={<Receipt />} value={formatNumber(stats.orders)} trend={stats.ordersTrend} foot="paid" />
            <StatCard label="Tickets sold" icon={<Ticket />} value={formatNumber(stats.ticketsSold)} trend={stats.ticketsSoldTrend} foot="issued" />
            <StatCard label="Remaining" icon={<PackageOpen />} value={formatNumber(stats.remainingTickets)} foot="across events" />
            <StatCard label="Checked in" icon={<UserCheck />} value={formatNumber(stats.checkedIn)} foot={`${stats.checkedInRate}% of sold`} />
            <StatCard label="Failed payments" icon={<TriangleAlert />} value={formatNumber(stats.failedPayments)} foot="needs review" />
          </div>

          <div className="dash-split">
            {/* revenue + recent orders */}
            <div className="stack" style={{ ['--gap' as string]: 'var(--space-6)' }}>
              <div className="card card--pad">
                <div className="row row--between">
                  <div>
                    <p className="eyebrow eyebrow--plain" style={{ color: 'var(--text-3)' }}>Revenue · last 12 weeks</p>
                    <p className="mono" style={{ fontSize: 'var(--fs-h3)', color: 'var(--text-1)', marginTop: 6 }}>{formatLkr(stats.revenueLkr)}</p>
                  </div>
                  <Badge tone={stats.revenueTrend >= 0 ? 'emerald' : 'oxblood'} dot>{stats.revenueTrend >= 0 ? '+' : ''}{stats.revenueTrend}%</Badge>
                </div>
                <div className="spark" aria-hidden>
                  {stats.revenueSeries.map((p, i) => (
                    <div key={i} className="spark__bar" style={{ height: `${Math.max(6, (p.value / maxRev) * 100)}%` }} title={`${p.label}: ${formatLkr(p.value)}`} />
                  ))}
                </div>
                <div className="row row--between" style={{ marginTop: 'var(--space-3)' }}>
                  <span className="meta" style={{ fontSize: 'var(--fs-2xs)' }}>{stats.revenueSeries[0]?.label}</span>
                  <span className="meta" style={{ fontSize: 'var(--fs-2xs)' }}>{stats.revenueSeries[stats.revenueSeries.length - 1]?.label}</span>
                </div>
              </div>

              <div className="card card--pad">
                <div className="row row--between" style={{ marginBottom: 'var(--space-2)' }}>
                  <p className="eyebrow eyebrow--plain" style={{ color: 'var(--text-3)' }}>Recent orders</p>
                  <Link to="/admin/orders" className="row" style={{ gap: 6, color: 'var(--text-3)', fontSize: 'var(--fs-xs)' }}>All <ArrowUpRight size={13} /></Link>
                </div>
                <div className="feed">
                  {stats.recentOrders.map((o) => (
                    <Link key={o.id} to={`/admin/orders/${o.id}`} className="feed__row">
                      <Avatar name={o.buyerName} sm />
                      <div className="feed__main">
                        <div className="feed__title truncate">{o.buyerName}</div>
                        <div className="feed__meta truncate">{o.eventTitle}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="mono t-1" style={{ fontSize: 'var(--fs-sm)' }}>{formatLkr(o.totalLkr)}</div>
                        <div style={{ marginTop: 4 }}><StatusBadge kind="order" value={o.status} dot={false} /></div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* recent scans */}
            <div className="card card--pad">
              <div className="row row--between" style={{ marginBottom: 'var(--space-2)' }}>
                <p className="eyebrow eyebrow--plain" style={{ color: 'var(--text-3)' }}>Recent scans</p>
                <Link to="/admin/scan-logs" className="row" style={{ gap: 6, color: 'var(--text-3)', fontSize: 'var(--fs-xs)' }}>All <ArrowUpRight size={13} /></Link>
              </div>
              <div className="feed">
                {stats.recentScans.map((s) => {
                  const m = SCAN_META[s.result];
                  return (
                    <div key={s.id} className="feed__row">
                      <span className="avatar avatar--sm" aria-hidden style={{ fontSize: 'var(--fs-2xs)' }}>{initials(s.gate)}</span>
                      <div className="feed__main">
                        <div className="feed__title mono truncate" style={{ fontSize: 'var(--fs-xs)' }}>{s.ticketId}</div>
                        <div className="feed__meta truncate">{s.eventTitle} · {formatRelative(s.scannedAt)}</div>
                      </div>
                      <Badge tone={m.tone}>{m.label}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
