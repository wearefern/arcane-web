/* =========================================================================
   ARCANE — Payments service (mock). No real gateway. startPayment returns a
   placeholder redirect; getPaymentStatus is deterministic by reference.
   ========================================================================= */

import type { PaymentMethod, PaymentProvider, PaymentStatus } from '../types';
import { ORDERS, PAYMENT_METHODS } from '../data';
import { clone, delay } from './_mock';

export async function listMethods(): Promise<PaymentMethod[]> {
  await delay();
  return clone(PAYMENT_METHODS);
}

/** Placeholder: hand back a fake provider redirect URL for the reference. */
export async function startPayment(
  reference: string,
  provider: PaymentProvider,
): Promise<{ status: 'pending'; redirectUrl: string }> {
  await delay();
  console.info('[paymentsService.startPayment] placeholder — no real gateway', reference, provider);
  const redirectUrl = `https://sandbox.${provider}.lk/pay/${encodeURIComponent(reference)}`;
  return { status: 'pending', redirectUrl };
}

/**
 * Deterministic payment status by reference. Known orders mirror their stored
 * status; unknown references resolve stably from the reference characters.
 */
export async function getPaymentStatus(reference: string): Promise<PaymentStatus> {
  await delay();
  const ref = reference.trim().toUpperCase();
  const order = ORDERS.find((o) => o.reference.toUpperCase() === ref);
  if (order) return order.paymentStatus;

  // Stable hash → bias heavily toward success, with occasional pending/failed.
  let hash = 0;
  for (let i = 0; i < ref.length; i += 1) {
    hash = (hash * 31 + ref.charCodeAt(i)) >>> 0;
  }
  const bucket = hash % 10;
  if (bucket < 7) return 'success';
  if (bucket < 9) return 'pending';
  return 'failed';
}
