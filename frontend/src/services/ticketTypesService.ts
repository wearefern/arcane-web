/* =========================================================================
   ARCANE — Ticket types service (mock). Reads return deep copies; mutations
   are logged placeholders.
   ========================================================================= */

import type { TicketType } from '../types';
import { TICKET_TYPES } from '../data';
import { clone, delay } from './_mock';

export async function listByEvent(eventId: string): Promise<TicketType[]> {
  await delay();
  return clone(TICKET_TYPES.filter((t) => t.eventId === eventId));
}

export async function listAll(): Promise<TicketType[]> {
  await delay();
  return clone(TICKET_TYPES);
}

export async function getById(id: string): Promise<TicketType | undefined> {
  await delay();
  const found = TICKET_TYPES.find((t) => t.id === id);
  return found ? clone(found) : undefined;
}

/* ---- placeholder mutations (no persistence) ---- */

export async function createTicketType(input: Partial<TicketType>): Promise<TicketType> {
  await delay();
  console.info('[ticketTypesService.createTicketType] placeholder — not persisted', input);
  const created: TicketType = {
    id: `tt_${Math.random().toString(36).slice(2, 8)}`,
    eventId: input.eventId ?? '',
    name: input.name ?? 'New ticket',
    description: input.description ?? '',
    priceLkr: input.priceLkr ?? 0,
    totalQty: input.totalQty ?? 0,
    soldQty: input.soldQty ?? 0,
    heldQty: input.heldQty ?? 0,
    perOrderLimit: input.perOrderLimit ?? 6,
    saleStartAt: input.saleStartAt ?? '2025-01-01T00:00:00+05:30',
    saleEndAt: input.saleEndAt ?? '2025-12-31T23:59:00+05:30',
    status: input.status ?? 'active',
  };
  return clone(created);
}

export async function updateTicketType(id: string, input: Partial<TicketType>): Promise<TicketType> {
  await delay();
  console.info('[ticketTypesService.updateTicketType] placeholder — not persisted', id, input);
  const existing = TICKET_TYPES.find((t) => t.id === id);
  if (!existing) throw new Error(`Ticket type not found: ${id}`);
  return clone({ ...existing, ...input, id: existing.id });
}

export async function removeTicketType(id: string): Promise<void> {
  await delay();
  console.info('[ticketTypesService.removeTicketType] placeholder — not persisted', id);
}
