/* =========================================================================
   ARCANE — Scanner service (mock). Gate validation, scan history, and a
   simulated offline-sync queue. validateToken is the one place we mutate the
   in-memory store: a successful online scan flips its ticket to 'used'.
   ========================================================================= */

import type { EventItem, ScanLog, ScanResult, ScanResultStatus, Ticket } from '../types';
import { EVENTS, SCAN_LOGS, TICKETS } from '../data';
import { clone, delay } from './_mock';
import { formatTime } from '../lib/format';

/**
 * The event the bundled DEMO_TOKENS are keyed to. The scanner UI should select
 * this event when offering the "try these" sample tokens below.
 */
export const DEMO_EVENT_ID = 'evt_01';

/**
 * A sample token for every scan outcome, matching the mock tickets, so the UI
 * can offer a "try these" panel. All are evaluated against DEMO_EVENT_ID
 * (evt_01) except where the outcome itself is event-independent.
 *  • VALID / OFFLINE_VALID — a live valid ticket on evt_01 (same token).
 *  • ALREADY_USED — a ticket on evt_01 already checked in.
 *  • WRONG_EVENT — a valid ticket that belongs to a different event (evt_02).
 *  • VOID — a refunded/void ticket (returns VOID at any gate).
 *  • INVALID — a token that matches no ticket.
 */
export const DEMO_TOKENS: Record<ScanResultStatus, string> = {
  VALID: '997359860241c8c220ba',
  OFFLINE_VALID: '997359860241c8c220ba',
  ALREADY_USED: '88a8c09c8fa2b96c',
  WRONG_EVENT: '8dc91954b85b817d4bb',
  VOID: 'a0a47e14b4871a74c',
  INVALID: 'deadbeefdeadbeef0000',
};

/** Published events are the ones a gate can be assigned to scan. */
export async function listAssignedEvents(): Promise<EventItem[]> {
  await delay();
  const published = EVENTS.filter((e) => e.status === 'published').sort(
    (a, b) => Date.parse(a.eventDate) - Date.parse(b.eventDate),
  );
  return clone(published);
}

function nowIso(): string {
  return new Date().toISOString();
}

function result(status: ScanResultStatus, message: string, ticket?: Ticket): ScanResult {
  return {
    status,
    message,
    scannedAt: nowIso(),
    ticket: ticket ? clone(ticket) : undefined,
  };
}

/**
 * Validate a QR token against an event.
 *   unknown token              -> INVALID
 *   ticket is void             -> VOID
 *   ticket belongs elsewhere   -> WRONG_EVENT
 *   ticket already used        -> ALREADY_USED (with the prior usedAt)
 *   otherwise                  -> VALID (flips ticket to 'used')
 *                                 or OFFLINE_VALID when opts.offline (no flip)
 */
export async function validateToken(
  eventId: string,
  token: string,
  opts?: { offline?: boolean },
): Promise<ScanResult> {
  await delay(220);

  const ticket = TICKETS.find((t) => t.token === token.trim());
  if (!ticket) {
    return result('INVALID', 'Ticket not recognised. Check the code and try again.');
  }
  if (ticket.status === 'void') {
    return result('VOID', `Ticket ${ticket.id} has been voided and cannot be admitted.`, ticket);
  }
  if (ticket.eventId !== eventId) {
    return result(
      'WRONG_EVENT',
      `This ticket is for "${ticket.eventTitle}", not the event being scanned.`,
      ticket,
    );
  }
  if (ticket.status === 'used') {
    const when = ticket.usedAt ? ` at ${formatTime(ticket.usedAt)}` : '';
    return result('ALREADY_USED', `Already checked in${when}. No re-entry on a single scan.`, ticket);
  }

  // Valid for admission.
  if (opts?.offline) {
    // Offline: accept but do not consume — it syncs later.
    return result('OFFLINE_VALID', `Admit ${ticket.buyerName} — ${ticket.ticketTypeName} (offline).`, ticket);
  }

  // Online: consume the ticket in the in-memory store.
  ticket.status = 'used';
  ticket.usedAt = nowIso();
  ticket.gate = ticket.gate ?? 'Gate A';
  return result('VALID', `Admit ${ticket.buyerName} — ${ticket.ticketTypeName}.`, ticket);
}

interface ScanLogOptions {
  eventId?: string;
  result?: ScanResultStatus | 'all';
  search?: string;
}

export async function listScanLogs(opts?: ScanLogOptions): Promise<ScanLog[]> {
  await delay();
  let out = [...SCAN_LOGS];
  if (opts?.eventId) {
    out = out.filter((s) => s.eventId === opts.eventId);
  }
  if (opts?.result && opts.result !== 'all') {
    out = out.filter((s) => s.result === opts.result);
  }
  const search = opts?.search?.trim().toLowerCase();
  if (search) {
    out = out.filter(
      (s) =>
        s.ticketId.toLowerCase().includes(search) ||
        s.eventTitle.toLowerCase().includes(search) ||
        s.operator.toLowerCase().includes(search) ||
        s.gate.toLowerCase().includes(search),
    );
  }
  out.sort((a, b) => Date.parse(b.scannedAt) - Date.parse(a.scannedAt));
  return clone(out);
}

interface PendingItem {
  id: string;
  ticketId: string;
  eventTitle: string;
  result: ScanResultStatus;
  capturedAt: string;
}

/** A small simulated queue of scans captured offline, awaiting sync. */
export async function getPendingSync(): Promise<{
  count: number;
  lastSyncedAt: string;
  items: PendingItem[];
}> {
  await delay();
  const items: PendingItem[] = [
    {
      id: 'pend_01',
      ticketId: 'ARC-T-FEEA02',
      eventTitle: 'Solstice — Rooftop Sessions',
      result: 'OFFLINE_VALID',
      capturedAt: '2025-07-12T19:21:00+05:30',
    },
    {
      id: 'pend_02',
      ticketId: 'ARC-T-1C77B0',
      eventTitle: 'Solstice — Rooftop Sessions',
      result: 'OFFLINE_VALID',
      capturedAt: '2025-07-12T19:24:00+05:30',
    },
    {
      id: 'pend_03',
      ticketId: 'ARC-T-9771FF',
      eventTitle: 'Solstice — Rooftop Sessions',
      result: 'WRONG_EVENT',
      capturedAt: '2025-07-12T19:26:00+05:30',
    },
  ];
  return clone({
    count: items.length,
    lastSyncedAt: '2025-07-12T19:18:00+05:30',
    items,
  });
}

/** Placeholder: pretend to flush the offline queue. */
export async function syncNow(): Promise<{ synced: number }> {
  await delay(500);
  console.info('[scannerService.syncNow] placeholder — simulated offline flush');
  return { synced: 3 };
}
