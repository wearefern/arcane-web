/* =========================================================================
   ARCANE — Auth service (mock). Accepts any non-empty credentials and
   persists a lightweight session to localStorage. No real auth/network.
   ========================================================================= */

import { ADMIN_USERS, SCANNER_USERS } from '../data';
import { delay } from './_mock';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  kind: 'admin' | 'scanner';
}

const ADMIN_KEY = 'arcane_admin';
const SCANNER_KEY = 'arcane_scanner';

function store(): Storage | null {
  return typeof localStorage !== 'undefined' ? localStorage : null;
}

function read(key: string): SessionUser | null {
  const raw = store()?.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

function write(key: string, user: SessionUser): void {
  store()?.setItem(key, JSON.stringify(user));
}

function nameFromEmail(email: string): string {
  const handle = email.split('@')[0] ?? 'member';
  return handle
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ') || 'Member';
}

/** Admin console login. Any non-empty email + password is accepted. */
export async function adminLogin(email: string, password: string): Promise<SessionUser> {
  await delay();
  if (!email.trim() || !password.trim()) {
    throw new Error('Email and password are required.');
  }
  const known = ADMIN_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  const user: SessionUser = {
    id: known?.id ?? 'adm_demo',
    name: known?.name ?? nameFromEmail(email),
    email: email.trim(),
    role: known?.role ?? 'owner',
    kind: 'admin',
  };
  write(ADMIN_KEY, user);
  return user;
}

/** Gate scanner login. Any non-empty email + password is accepted. */
export async function scannerLogin(email: string, password: string): Promise<SessionUser> {
  await delay();
  if (!email.trim() || !password.trim()) {
    throw new Error('Email and password are required.');
  }
  const known = SCANNER_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  const user: SessionUser = {
    id: known?.id ?? 'scu_demo',
    name: known?.name ?? nameFromEmail(email),
    email: email.trim(),
    role: known?.role ?? 'scanner',
    kind: 'scanner',
  };
  write(SCANNER_KEY, user);
  return user;
}

export function getCurrentAdmin(): SessionUser | null {
  const user = read(ADMIN_KEY);
  return user && user.kind === 'admin' ? user : null;
}

export function getCurrentScanner(): SessionUser | null {
  const user = read(SCANNER_KEY);
  return user && user.kind === 'scanner' ? user : null;
}

export function logoutAdmin(): void {
  store()?.removeItem(ADMIN_KEY);
}

export function logoutScanner(): void {
  store()?.removeItem(SCANNER_KEY);
}
