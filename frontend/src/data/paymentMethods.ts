/* =========================================================================
   ARCANE — Payment methods (Sri Lankan providers).
   ========================================================================= */

import type { PaymentMethod } from '../types';

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'payhere',
    name: 'PayHere',
    blurb: 'Cards, eZ Cash, mobile & online banking',
  },
  {
    id: 'koko',
    name: 'Koko',
    blurb: 'Buy now, pay in 3 — interest free',
  },
];
