import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Squares2X2Icon,
  CalendarIcon,
  ClockIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  BoltIcon,
  ArrowLeftOnRectangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, isAdmin, logout } = useAuth();

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
    { name: 'Calendar', to: '/calendar', icon: CalendarIcon },
    { name: 'Timer', to: '/timer', icon: ClockIcon },
    { name: 'Settings', to: '/settings', icon: Cog6ToothIcon }
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-surface border-r border-border transition-transform duration-300 ease-out w-64 lg:static lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } h-full flex-shrink-0`}
    >
      {/* Sidebar Branding Header */}
      <div className="p-4 flex items-center justify-between border-b border-border h-16 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-sm bg-accent text-xs text-white shadow-xs">
            <BoltIcon className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <span className="font-heading text-lg tracking-tight text-foreground">TaskFlow</span>
        </div>

        {/* Close Button on Mobile Drawer */}
        <button
          onClick={() => setMobileOpen(false)}
          className="rounded-sm p-2 text-foreground-muted transition hover:bg-accent-muted hover:text-accent lg:hidden"
          aria-label="Close menu"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Options List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.to}
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-foreground-muted hover:bg-accent-muted hover:text-foreground'
              }`
            }
          >
            <link.icon className="w-5 h-5 flex-shrink-0" />
            <span>{link.name}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2 border-t border-border">
              <span className="px-3 text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">Admin</span>
            </div>
            <NavLink
              to="/admin"
              onClick={handleLinkClick}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-foreground-muted hover:bg-accent-muted hover:text-foreground'
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
                `flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-foreground-muted hover:bg-accent-muted hover:text-foreground'
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
      <div className="p-4 border-t border-border flex-shrink-0">
        <div className="flex items-center gap-3 justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
            <p className="text-[10px] text-foreground-muted truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-sm p-2 text-danger transition hover:bg-red-50 hover:text-red-700"
            aria-label="Logout"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
