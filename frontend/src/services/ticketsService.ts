/* =========================================================================
   ARCANE — Tickets service (mock). Reads return deep copies; the "My Tickets"
   lookup matches by buyer email and/or order reference.
   ========================================================================= */

import type { Ticket, TicketStatus } from '../types';
import { TICKETS } from '../data';
import { clone, delay, matches } from './_mock';

interface ListOptions {
  search?: string;
  eventId?: string;
  status?: TicketStatus | 'all';
}

export async function listTickets(opts?: ListOptions): Promise<Ticket[]> {
  await delay();
  let out = [...TICKETS];
  if (opts?.eventId) {
    out = out.filter((t) => t.eventId === opts.eventId);
  }
  if (opts?.status && opts.status !== 'all') {
    out = out.filter((t) => t.status === opts.status);
  }
  const search = opts?.search?.trim();
  if (search) {
    out = out.filter(
      (t) =>
        matches(t.id, search) ||
        matches(t.orderRef, search) ||
        matches(t.buyerName, search) ||
        matches(t.buyerEmail, search) ||
        matches(t.eventTitle, search) ||
        matches(t.ticketTypeName, search),
    );
  }
  out.sort((a, b) => Date.parse(b.issuedAt) - Date.parse(a.issuedAt));
  return clone(out);
}

export async function getTicket(id: string): Promise<Ticket | undefined> {
  await delay();
  const found = TICKETS.find((t) => t.id === id);
  return found ? clone(found) : undefined;
}

/**
 * "My Tickets" lookup. Matches by buyer email and/or order reference.
 * At least one parameter should be supplied; with both, both must match.
 */
export async function findTickets(params: { email?: string; reference?: string }): Promise<Ticket[]> {
  await delay();
  const email = params.email?.trim().toLowerCase();
  const reference = params.reference?.trim().toUpperCase();
  if (!email && !reference) return [];
  const out = TICKETS.filter((t) => {
    const emailOk = email ? t.buyerEmail.toLowerCase() === email : true;
    const refOk = reference ? t.orderRef.toUpperCase() === reference : true;
    return emailOk && refOk;
  });
  out.sort((a, b) => Date.parse(b.issuedAt) - Date.parse(a.issuedAt));
  return clone(out);
}

/* ---- placeholder mutations (no persistence) ---- */

export async function voidTicket(id: string): Promise<void> {
  await delay();
  console.info('[ticketsService.voidTicket] placeholder — not persisted', id);
}

export async function resendTicketEmail(id: string): Promise<void> {
  await delay();
  console.info('[ticketsService.resendTicketEmail] placeholder — not persisted', id);
}
