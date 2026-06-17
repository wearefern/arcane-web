/* =========================================================================
   ARCANE — Dashboard statistics (one DashboardStats object).
   Headline figures are platform-scale and mutually consistent:
     • ticketsSold (7,710) + remainingTickets (2,390) = published capacity 10,100
       (see events.ts: sum over the 6 published events).
     • checkedIn (3,118) / ticketsSold ≈ 40.4% → checkedInRate.
     • revenueSeries (12 weekly points) sums to revenueLkr.
   recentOrders / recentScans reference the real literal records and are
   filled by the data barrel (index.ts) to avoid duplicating rows here.
   ========================================================================= */

import type { DashboardStats, TrendPoint } from '../types';

/** 12 weekly revenue points (late Mar → mid Jun 2025). Sum = revenueLkr below. */
export const REVENUE_SERIES: TrendPoint[] = [
  { label: 'Mar 24', value: 3120000 },
  { label: 'Mar 31', value: 3680000 },
  { label: 'Apr 07', value: 4210000 },
  { label: 'Apr 14', value: 3950000 },
  { label: 'Apr 21', value: 4870000 },
  { label: 'Apr 28', value: 5320000 },
  { label: 'May 05', value: 5010000 },
  { label: 'May 12', value: 6240000 },
  { label: 'May 19', value: 6890000 },
  { label: 'May 26', value: 7460000 },
  { label: 'Jun 02', value: 8120000 },
  { label: 'Jun 09', value: 9050000 },
];

/**
 * Base dashboard stats WITHOUT the recent feeds. The data barrel (index.ts)
 * attaches `recentOrders` and `recentScans` from the canonical arrays so the
 * feeds stay in sync with orders.ts / scanLogs.ts.
 */
export const DASHBOARD_STATS_BASE: Omit<DashboardStats, 'recentOrders' | 'recentScans'> = {
  // Sum of REVENUE_SERIES (12 weeks).
  revenueLkr: 67920000,
  revenueTrend: 11.5,
  // Lifetime paid orders across all events.
  orders: 1184,
  ordersTrend: 8.2,
  // Sum of ticketsSold over the 6 published events (events.ts).
  ticketsSold: 7710,
  ticketsSoldTrend: 9.7,
  // Published capacity (10,100) − ticketsSold (7,710).
  remainingTickets: 2390,
  // Attendees through the gates so far.
  checkedIn: 3118,
  checkedInRate: 40.4,
  failedPayments: 37,
  revenueSeries: REVENUE_SERIES,
};
