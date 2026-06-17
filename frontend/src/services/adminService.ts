/* =========================================================================
   ARCANE — Admin service (mock). Dashboard stats, console/gate user lists,
   attendee export (derived from tickets), and placeholder settings.
   ========================================================================= */

import type { AdminUser, DashboardStats, ScannerUser } from '../types';
import { ADMIN_USERS, DASHBOARD_STATS, ORDERS, SCANNER_USERS, TICKETS } from '../data';
import { clone, delay } from './_mock';

export async function getDashboardStats(): Promise<DashboardStats> {
  await delay();
  return clone(DASHBOARD_STATS);
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  await delay();
  return clone(ADMIN_USERS);
}

export async function listScannerUsers(): Promise<ScannerUser[]> {
  await delay();
  return clone(SCANNER_USERS);
}

export interface AttendeeRow {
  name: string;
  email: string;
  phone: string;
  ticketType: string;
  ticketId: string;
  status: string;
  checkedIn: boolean;
}

/** Build an attendee manifest for one event from its issued tickets. */
export async function exportAttendees(eventId: string): Promise<AttendeeRow[]> {
  await delay();
  // Phone lives on the order, not the ticket — index it for the join.
  const phoneByOrderId = new Map(ORDERS.map((o) => [o.id, o.buyerPhone]));
  const rows: AttendeeRow[] = TICKETS.filter((t) => t.eventId === eventId).map((t) => ({
    name: t.buyerName,
    email: t.buyerEmail,
    phone: phoneByOrderId.get(t.orderId) ?? '',
    ticketType: t.ticketTypeName,
    ticketId: t.id,
    status: t.status,
    checkedIn: t.status === 'used',
  }));
  rows.sort((a, b) => a.name.localeCompare(b.name));
  return clone(rows);
}

export async function getSettings(): Promise<{
  payments: { payhereMerchantId: string; kokoMerchantId: string; sandbox: boolean };
  email: { fromName: string; fromEmail: string; replyTo: string };
  cloudinary: { cloudName: string; uploadPreset: string };
}> {
  await delay();
  return {
    payments: {
      payhereMerchantId: '1226789',
      kokoMerchantId: 'KOKO-ARC-4417',
      sandbox: true,
    },
    email: {
      fromName: 'Arcane',
      fromEmail: 'tickets@arcane.lk',
      replyTo: 'concierge@arcane.lk',
    },
    cloudinary: {
      cloudName: 'arcane-events',
      uploadPreset: 'arcane_unsigned',
    },
  };
}
