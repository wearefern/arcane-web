/* =========================================================================
   ARCANE — Mock data barrel. Re-exports every dataset and assembles the
   composite DASHBOARD_STATS (headline figures + live recent feeds).
   All data is deterministic literals; the sorting below uses Date.parse on
   literal ISO strings (never Date.now()/new Date() with no args).
   ========================================================================= */

import type { DashboardStats, Order, ScanLog } from '../types';

import { EVENTS } from './events';
import { TICKET_TYPES } from './ticketTypes';
import { ORDERS } from './orders';
import { TICKETS } from './tickets';
import { SCAN_LOGS } from './scanLogs';
import { ADMIN_USERS, SCANNER_USERS } from './users';
import { PAYMENT_METHODS } from './paymentMethods';
import { DASHBOARD_STATS_BASE, REVENUE_SERIES } from './stats';

// Re-export the imported datasets as the public surface of the barrel.
export {
  EVENTS,
  TICKET_TYPES,
  ORDERS,
  TICKETS,
  SCAN_LOGS,
  ADMIN_USERS,
  SCANNER_USERS,
  PAYMENT_METHODS,
  DASHBOARD_STATS_BASE,
  REVENUE_SERIES,
};

/** Most-recent N records by an ISO-string timestamp field (desc). */
function mostRecent<T>(rows: readonly T[], key: (row: T) => string, n: number): T[] {
  return [...rows].sort((a, b) => Date.parse(key(b)) - Date.parse(key(a))).slice(0, n);
}

const recentOrders: Order[] = mostRecent(ORDERS, (o) => o.createdAt, 6);
const recentScans: ScanLog[] = mostRecent(SCAN_LOGS, (s) => s.scannedAt, 6);

/** Composite dashboard stats: headline figures + the 6 most-recent feeds. */
export const DASHBOARD_STATS: DashboardStats = {
  ...DASHBOARD_STATS_BASE,
  revenueSeries: REVENUE_SERIES,
  recentOrders,
  recentScans,
};
