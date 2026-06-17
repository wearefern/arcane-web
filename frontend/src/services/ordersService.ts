/* =========================================================================
   ARCANE — Orders service (mock). Reads return deep copies after a delay.
   createOrder builds a fresh 'pending' order (not persisted).
   ========================================================================= */

import type { Order, OrderItem, OrderStatus, PaymentProvider } from '../types';
import { EVENTS, ORDERS } from '../data';
import { clone, delay, matches, randomCode } from './_mock';

const FEE_RATE = 0.025;

interface ListOptions {
  search?: string;
  status?: OrderStatus | 'all';
  provider?: PaymentProvider | 'all';
}

export async function listOrders(opts?: ListOptions): Promise<Order[]> {
  await delay();
  let out = [...ORDERS];
  const search = opts?.search?.trim();
  if (search) {
    out = out.filter(
      (o) =>
        matches(o.reference, search) ||
        matches(o.buyerName, search) ||
        matches(o.buyerEmail, search) ||
        matches(o.eventTitle, search),
    );
  }
  if (opts?.status && opts.status !== 'all') {
    out = out.filter((o) => o.status === opts.status);
  }
  if (opts?.provider && opts.provider !== 'all') {
    out = out.filter((o) => o.provider === opts.provider);
  }
  out.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return clone(out);
}

export async function getOrder(id: string): Promise<Order | undefined> {
  await delay();
  const found = ORDERS.find((o) => o.id === id);
  return found ? clone(found) : undefined;
}

export async function getOrderByReference(reference: string): Promise<Order | undefined> {
  await delay();
  const ref = reference.trim().toUpperCase();
  const found = ORDERS.find((o) => o.reference.toUpperCase() === ref);
  return found ? clone(found) : undefined;
}

interface CreateOrderInput {
  eventId: string;
  items: OrderItem[];
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  provider: PaymentProvider;
}

/** Build a brand-new 'pending' order with a generated reference. Not persisted. */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  await delay();
  const event = EVENTS.find((e) => e.id === input.eventId);
  const subtotalLkr = input.items.reduce((sum, it) => sum + it.qty * it.unitPriceLkr, 0);
  const feesLkr = Math.round(subtotalLkr * FEE_RATE);
  const totalLkr = subtotalLkr + feesLkr;
  const reference = `ARC-${randomCode(6)}`;
  const order: Order = {
    id: `ord_${randomCode(6).toLowerCase()}`,
    reference,
    buyerName: input.buyerName,
    buyerEmail: input.buyerEmail,
    buyerPhone: input.buyerPhone,
    eventId: input.eventId,
    eventTitle: event?.title ?? 'Unknown event',
    items: input.items,
    subtotalLkr,
    feesLkr,
    totalLkr,
    provider: input.provider,
    paymentStatus: 'pending',
    status: 'pending',
    createdAt: new Date().toISOString(),
    ticketIds: [],
  };
  console.info('[ordersService.createOrder] placeholder — not persisted', reference);
  return clone(order);
}
