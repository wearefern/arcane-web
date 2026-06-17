/* =========================================================================
   ARCANE — People: admin console users and gate scanner users.
   Literal data only. assignedEventIds reference real events (events.ts).
   ========================================================================= */

import type { AdminUser, ScannerUser } from '../types';

/** Back-office / console operators. One owner, two managers, one staff. */
export const ADMIN_USERS: AdminUser[] = [
  {
    id: 'adm_01',
    name: 'Imran Wickramasinghe',
    email: 'imran@arcane.lk',
    role: 'owner',
    lastActiveAt: '2025-06-16T20:42:00+05:30',
    status: 'active',
  },
  {
    id: 'adm_02',
    name: 'Nethmi Fernando',
    email: 'nethmi@arcane.lk',
    role: 'manager',
    lastActiveAt: '2025-06-16T18:10:00+05:30',
    status: 'active',
  },
  {
    id: 'adm_03',
    name: 'Dilshan Jayawardena',
    email: 'dilshan@arcane.lk',
    role: 'manager',
    lastActiveAt: '2025-06-12T11:27:00+05:30',
    status: 'invited',
  },
  {
    id: 'adm_04',
    name: 'Aisha Mendis',
    email: 'aisha@arcane.lk',
    role: 'staff',
    lastActiveAt: '2025-05-29T09:05:00+05:30',
    status: 'disabled',
  },
];

/** Gate crew. Gate leads run a door; scanners work a single gate. */
export const SCANNER_USERS: ScannerUser[] = [
  {
    id: 'scu_01',
    name: 'Roshan Peris',
    email: 'roshan.gate@arcane.lk',
    role: 'gate_lead',
    assignedEventIds: ['evt_01', 'evt_02', 'evt_05'],
    lastActiveAt: '2025-06-15T22:48:00+05:30',
    status: 'active',
  },
  {
    id: 'scu_02',
    name: 'Nadeesha Silva',
    email: 'nadeesha.gate@arcane.lk',
    role: 'scanner',
    assignedEventIds: ['evt_01', 'evt_04'],
    lastActiveAt: '2025-06-15T21:15:00+05:30',
    status: 'active',
  },
  {
    id: 'scu_03',
    name: 'Kasun Bandara',
    email: 'kasun.gate@arcane.lk',
    role: 'scanner',
    assignedEventIds: ['evt_02', 'evt_06'],
    lastActiveAt: '2025-06-14T19:33:00+05:30',
    status: 'active',
  },
  {
    id: 'scu_04',
    name: 'Ishara Madushani',
    email: 'ishara.gate@arcane.lk',
    role: 'gate_lead',
    assignedEventIds: ['evt_03', 'evt_05'],
    lastActiveAt: '2025-06-10T16:02:00+05:30',
    status: 'invited',
  },
  {
    id: 'scu_05',
    name: 'Dinithi Rajapaksa',
    email: 'dinithi.gate@arcane.lk',
    role: 'scanner',
    assignedEventIds: ['evt_04'],
    lastActiveAt: '2025-05-30T13:20:00+05:30',
    status: 'disabled',
  },
];
