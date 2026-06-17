/* =========================================================================
   ARCANE — Domain types (the data contract shared by data, services, pages)
   ========================================================================= */

export type EventStatus = 'draft' | 'published' | 'paused' | 'unpublished';
export type TicketTypeStatus = 'active' | 'paused' | 'sold_out' | 'scheduled';
export type OrderStatus = 'paid' | 'pending' | 'failed' | 'refunded' | 'cancelled';
export type PaymentProvider = 'payhere' | 'koko';
export type PaymentStatus = 'pending' | 'success' | 'failed';
export type TicketStatus = 'valid' | 'used' | 'void';
export type AdminRole = 'owner' | 'manager' | 'staff';
export type ScannerRole = 'gate_lead' | 'scanner';
export type AccountStatus = 'active' | 'invited' | 'disabled';

/** Outcome codes for a gate scan. */
export type ScanResultStatus =
  | 'VALID'
  | 'ALREADY_USED'
  | 'INVALID'
  | 'WRONG_EVENT'
  | 'VOID'
  | 'OFFLINE_VALID';

/** A muted, dark duotone for an event's poster placeholder (no bright colours). */
export type EventTone = 'amber' | 'emerald' | 'slate' | 'crimson' | 'violet' | 'mono';

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  venue: string;
  city: string;
  category: string;
  tone: EventTone;
  status: EventStatus;
  featured: boolean;
  eventDate: string; // ISO date
  startTime: string; // "21:00"
  endTime: string; // "04:00"
  doorsTime?: string; // "20:00"
  agePolicy?: string; // "21+"
  dressCode?: string;
  lineup?: string[];
  priceFromLkr: number;
  ticketsSold: number;
  capacity: number;
}

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  description: string;
  priceLkr: number;
  totalQty: number;
  soldQty: number;
  heldQty: number;
  perOrderLimit: number;
  saleStartAt: string; // ISO
  saleEndAt: string; // ISO
  status: TicketTypeStatus;
}

/** available = totalQty - soldQty - heldQty */
export function ticketsAvailable(t: TicketType): number {
  return Math.max(0, t.totalQty - t.soldQty - t.heldQty);
}

export interface EventWithTickets extends EventItem {
  ticketTypes: TicketType[];
}

export interface OrderItem {
  ticketTypeId: string;
  ticketTypeName: string;
  qty: number;
  unitPriceLkr: number;
}

export interface Order {
  id: string;
  reference: string; // "ARC-7F3K2D"
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  eventId: string;
  eventTitle: string;
  items: OrderItem[];
  subtotalLkr: number;
  feesLkr: number;
  totalLkr: number;
  provider: PaymentProvider;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string; // ISO
  ticketIds: string[];
}

export interface Ticket {
  id: string; // "ARC-T-90D4A1"
  token: string; // opaque QR token
  orderId: string;
  orderRef: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  ticketTypeId: string;
  ticketTypeName: string;
  buyerName: string;
  buyerEmail: string;
  status: TicketStatus;
  usedAt?: string | null;
  gate?: string | null;
  seat?: string | null;
  issuedAt: string;
}

export interface ScanLog {
  id: string;
  eventId: string;
  eventTitle: string;
  ticketId: string;
  result: ScanResultStatus;
  gate: string;
  device: string;
  operator: string;
  scannedAt: string; // ISO
}

export interface ScanResult {
  status: ScanResultStatus;
  ticket?: Ticket;
  message: string;
  scannedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  lastActiveAt: string;
  status: AccountStatus;
}

export interface ScannerUser {
  id: string;
  name: string;
  email: string;
  role: ScannerRole;
  assignedEventIds: string[];
  lastActiveAt: string;
  status: AccountStatus;
}

export interface PaymentMethod {
  id: PaymentProvider;
  name: string;
  blurb: string;
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface DashboardStats {
  revenueLkr: number;
  revenueTrend: number; // % vs previous period
  orders: number;
  ordersTrend: number;
  ticketsSold: number;
  ticketsSoldTrend: number;
  remainingTickets: number;
  checkedIn: number;
  checkedInRate: number; // 0–100
  failedPayments: number;
  revenueSeries: TrendPoint[];
  recentOrders: Order[];
  recentScans: ScanLog[];
}

/** Filters used by list services. */
export interface EventFilters {
  search?: string;
  category?: string;
  when?: 'all' | 'this-week' | 'this-month' | 'later';
  maxPriceLkr?: number;
  status?: EventStatus | 'all';
}
