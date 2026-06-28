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
      className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-warm-surface border-r border-warm-surface transition-transform duration-300 ease-in-out w-64 lg:static lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } h-full flex-shrink-0`}
    >
      {/* Sidebar Branding Header */}
      <div className="p-4 flex items-center justify-between border-b border-warm-surface h-16 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-slate-950 via-gray-850 to-slate-900 text-xs font-bold text-white shadow-md">
            <BoltIcon className="h-4 w-4" />
          </div>
          <span className="font-black text-warm-ink tracking-tight text-sm">TaskFlow</span>
        </div>

        {/* Close Button on Mobile Drawer */}
        <button
          onClick={() => setMobileOpen(false)}
          className="p-2 rounded-xl hover:bg-white transition text-warm-muted lg:hidden"
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
              `flex items-center gap-3 px-3 py-2.5 rounded-soft-control text-sm font-semibold transition ${
                isActive
                  ? 'bg-slate-950 text-white shadow-warm-sm'
                  : 'text-warm-muted hover:bg-white hover:text-warm-ink'
              }`
            }
          >
            <link.icon className="w-5 h-5 flex-shrink-0" />
            <span>{link.name}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2 border-t border-warm-surface">
              <span className="px-3 text-[10px] font-bold text-warm-muted uppercase tracking-wider">Admin</span>
            </div>
            <NavLink
              to="/admin"
              onClick={handleLinkClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-soft-control text-sm font-semibold transition ${
                  isActive
                    ? 'bg-slate-950 text-white shadow-warm-sm'
                    : 'text-warm-muted hover:bg-white hover:text-warm-ink'
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
                `flex items-center gap-3 px-3 py-2.5 rounded-soft-control text-sm font-semibold transition ${
                  isActive
                    ? 'bg-slate-950 text-white shadow-warm-sm'
                    : 'text-warm-muted hover:bg-white hover:text-warm-ink'
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
      <div className="p-4 border-t border-warm-surface flex-shrink-0">
        <div className="flex items-center gap-3 justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold text-warm-ink truncate">{user?.name}</p>
            <p className="text-[10px] text-warm-muted truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 transition"
            aria-label="Logout"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
