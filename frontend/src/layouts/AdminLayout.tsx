import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Tags,
  Receipt,
  QrCode,
  ScanLine,
  Download,
  Settings,
  Menu,
  X,
  LogOut,
  ArrowUpRight,
} from 'lucide-react';
import { Wordmark } from '../components/brand/Wordmark';
import { Avatar } from '../components/ui/Avatar';
import { getCurrentAdmin, logoutAdmin } from '../services/authService';
import { cn } from '../lib/cn';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/events', label: 'Events', icon: CalendarDays, end: false },
  { to: '/admin/ticket-types', label: 'Ticket Types', icon: Tags, end: false },
  { to: '/admin/orders', label: 'Orders', icon: Receipt, end: false },
  { to: '/admin/tickets', label: 'Tickets', icon: QrCode, end: false },
  { to: '/admin/scan-logs', label: 'Scan Logs', icon: ScanLine, end: false },
  { to: '/admin/export', label: 'Export', icon: Download, end: false },
  { to: '/admin/settings', label: 'Settings', icon: Settings, end: false },
];

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentAdmin() ?? { name: 'Imran Wickrama', role: 'owner', email: 'imran@arcane.lk' };

  function signOut() {
    logoutAdmin();
    navigate('/admin/login');
  }

  return (
    <div className="admin">
      {open && <div className="scrim" style={{ zIndex: 'var(--z-drawer)' }} onClick={() => setOpen(false)} />}

      <aside className={cn('sidebar', open && 'is-open')}>
        <div className="sidebar__brand">
          <Link to="/admin" aria-label="Arcane Admin">
            <Wordmark suffix="Admin" />
          </Link>
        </div>

        <nav className="sidebar__nav" aria-label="Admin">
          <p className="sidebar__group-label">Operate</p>
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) => cn('sidebar__link', isActive && 'is-active')}
              >
                <Icon />
                {n.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar__foot">
          <div className="sidebar__user">
            <Avatar name={user.name} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="sidebar__user-name truncate">{user.name}</div>
              <div className="sidebar__user-role">{user.role}</div>
            </div>
            <button className="icon-btn icon-btn--plain" onClick={signOut} aria-label="Sign out" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="admin-main">
        <header className="topbar">
          <div className="row">
            <button className="icon-btn icon-btn--plain topbar__menu" aria-label="Open menu" onClick={() => setOpen(true)}>
              {open ? <X /> : <Menu />}
            </button>
            <span className="topbar__title">Control Room</span>
          </div>
          <Link to="/" className="row" style={{ color: 'var(--text-3)', fontSize: 'var(--fs-sm)', gap: 6 }}>
            View site <ArrowUpRight size={14} />
          </Link>
        </header>

        <div className="admin-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
