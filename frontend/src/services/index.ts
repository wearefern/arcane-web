/* =========================================================================
   ARCANE — Services barrel. Each service is namespaced to avoid collisions
   between same-named functions (listX/getById/...). Import e.g.:
     import { eventsService, scannerService } from '../services';
   The SessionUser type is re-exported for convenience.
   ========================================================================= */

export * as authService from './authService';
export * as eventsService from './eventsService';
export * as ticketTypesService from './ticketTypesService';
export * as ordersService from './ordersService';
export * as ticketsService from './ticketsService';
export * as scannerService from './scannerService';
export * as paymentsService from './paymentsService';
export * as adminService from './adminService';

export type { SessionUser } from './authService';
export type { AttendeeRow } from './adminService';
