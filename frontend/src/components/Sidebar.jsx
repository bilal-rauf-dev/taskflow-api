import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Squares2X2Icon,
  ViewColumnsIcon,
  CalendarIcon,
  ClockIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  BoltIcon,
  ArrowLeftOnRectangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import NotificationInbox from './NotificationInbox';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, isAdmin, isGuest, logout } = useAuth();

  const handleLinkClick = () => {
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    handleLinkClick();
    logout();
  };

  const links = [
    { name: 'Dashboard', to: '/dashboard', icon: Squares2X2Icon },
    { name: 'Boards', to: '/boards', icon: ViewColumnsIcon },
    { name: 'Calendar', to: '/calendar', icon: CalendarIcon },
    { name: 'Timer', to: '/timer', icon: ClockIcon },
    { name: 'Settings', to: '/settings', icon: Cog6ToothIcon }
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r-2 border-foreground bg-surface shadow-[6px_0_0_#F3E8FF] transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } h-full flex-shrink-0`}
    >
      {/* Sidebar Branding Header */}
      <div className="flex h-16 flex-shrink-0 items-center justify-between border-b-2 border-foreground p-4">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-full border-2 border-foreground bg-accent text-xs text-white shadow-xs">
            <BoltIcon className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <span className="font-heading text-lg tracking-tight text-foreground">TaskFlow</span>
        </div>

        {/* Close Button on Mobile Drawer */}
        <button
          onClick={() => setMobileOpen(false)}
          className="rounded-full border-2 border-transparent p-2 text-foreground-muted transition hover:border-foreground hover:bg-tertiary hover:text-foreground lg:hidden"
          aria-label="Close menu"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Options List */}
      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-5">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.to}
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `wiggle-hover flex min-h-12 items-center gap-3 rounded-full border-2 px-3 py-2.5 text-sm font-bold transition ${
                isActive
                  ? 'border-foreground bg-accent text-white shadow-xs'
                  : 'border-transparent text-foreground-muted hover:border-foreground hover:bg-tertiary hover:text-foreground'
              }`
            }
          >
            <link.icon className="w-5 h-5 flex-shrink-0" />
            <span>{link.name}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="border-t-2 border-dashed border-border-strong pb-2 pt-5">
              <span className="px-3 text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">Admin</span>
            </div>
            <NavLink
              to="/admin"
              onClick={handleLinkClick}
              className={({ isActive }) =>
                `wiggle-hover flex min-h-12 items-center gap-3 rounded-full border-2 px-3 py-2.5 text-sm font-bold transition ${
                  isActive
                    ? 'border-foreground bg-secondary text-white shadow-xs'
                    : 'border-transparent text-foreground-muted hover:border-foreground hover:bg-accent-muted hover:text-foreground'
                }`
              }
            >
              <ShieldCheckIcon className="w-5 h-5 flex-shrink-0" />
              <span>Admin Panel</span>
            </NavLink>
            <NavLink
              to="/admin/productivity"
              onClick={handleLinkClick}
              className={({ isActive }) =>
                `wiggle-hover flex min-h-12 items-center gap-3 rounded-full border-2 px-3 py-2.5 text-sm font-bold transition ${
                  isActive
                    ? 'border-foreground bg-quaternary text-foreground shadow-xs'
                    : 'border-transparent text-foreground-muted hover:border-foreground hover:bg-accent-muted hover:text-foreground'
                }`
              }
            >
              <BoltIcon className="w-5 h-5 flex-shrink-0" />
              <span>Velocity Reports</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* User Session Footer */}
      <div className="flex-shrink-0 border-t-2 border-foreground bg-tertiary/25 p-4">
        <div className="flex items-center gap-3 justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground truncate">
              {user?.name}
              {isGuest && (
                <span className="flex-shrink-0 rounded-full border border-foreground bg-tertiary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-foreground">
                  Guest
                </span>
              )}
            </p>
            <p className="text-[10px] text-foreground-muted truncate">
              {isGuest ? 'Saved on this device only' : user?.email}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <NotificationInbox />
            <button
              onClick={handleLogout}
              className="rounded-full border-2 border-transparent p-2 text-danger transition hover:border-foreground hover:bg-secondary hover:text-white"
              aria-label="Logout"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
