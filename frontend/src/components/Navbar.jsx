import React from 'react';
import { Fragment, useState } from 'react';
import { Menu, Transition, Dialog } from '@headlessui/react';
import {
  Bars3Icon,
  ChevronDownIcon,
  ArrowLeftOnRectangleIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  HomeIcon,
  XMarkIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';

function Navbar({ onToggleMobileMenu }) {
  const { user, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const initials =
    user?.name
      ?.split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
  };

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/20 bg-white/70 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (onToggleMobileMenu) onToggleMobileMenu();
              setMobileOpen((prev) => !prev);
            }}
            className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Open navigation"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-slate-950 via-gray-850 to-slate-900 text-sm font-bold text-white shadow-lg shadow-slate-950/25">
              <BoltIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">TaskFlow</p>
              <p className="text-xs text-gray-500">Premium dashboard</p>
            </div>
          </Link>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `rounded-xl px-3 py-2 text-sm font-semibold transition ${
                isActive ? 'bg-slate-950/10 text-slate-700' : 'text-gray-600 hover:bg-white/70'
              }`
            }
          >
            Dashboard
          </NavLink>
          {isAdmin && (
            <>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-slate-950/10 text-slate-700' : 'text-gray-600 hover:bg-white/70'
                  }`
                }
              >
                Admin
              </NavLink>
              <NavLink
                to="/admin/productivity"
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-slate-950/10 text-slate-700' : 'text-gray-600 hover:bg-white/70'
                  }`
                }
              >
                Velocity
              </NavLink>
            </>
          )}
        </div>

        <Menu as="div" className="relative hidden sm:block">
          <Menu.Button className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-3 py-2 shadow-lg shadow-slate-900/5 transition hover:border-white hover:bg-white">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-slate-950 via-gray-850 to-slate-900 text-xs font-bold text-white shadow-md">
              {initials}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${isAdmin ? 'bg-slate-100 text-slate-700' : 'bg-gray-100 text-gray-600'}`}>
                {user?.role}
              </span>
            </div>
            <ChevronDownIcon className="h-4 w-4 text-gray-500" />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl focus:outline-none">
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={() => setProfileOpen(true)}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                      active ? 'bg-gray-100' : ''
                    }`}
                  >
                    <UserCircleIcon className="h-4 w-4" />
                    Profile
                  </button>
                )}
              </Menu.Item>

              {isAdmin && (
                <>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/admin"
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                          active ? 'bg-gray-100' : ''
                        }`}
                      >
                        <ShieldCheckIcon className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/admin/productivity"
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                          active ? 'bg-gray-100' : ''
                        }`}
                      >
                        <BoltIcon className="h-4 w-4" />
                        Velocity Reports
                      </Link>
                    )}
                  </Menu.Item>
                </>
              )}

              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 ${
                      active ? 'bg-red-50' : ''
                    }`}
                  >
                    <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                    Logout
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      <Dialog open={mobileOpen} onClose={setMobileOpen} className="relative z-50 sm:hidden">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

        <div className="fixed inset-x-0 top-[4.5rem] rounded-t-3xl bg-white p-4 shadow-2xl animate-fade-in">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Menu</p>
            <button type="button" onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-2">
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <HomeIcon className="h-4 w-4" />
              Dashboard
            </Link>
             {isAdmin && (
               <>
                 <Link
                   to="/admin"
                   onClick={() => setMobileOpen(false)}
                   className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                 >
                   <ShieldCheckIcon className="h-4 w-4" />
                   Admin Panel
                 </Link>
                 <Link
                   to="/admin/productivity"
                   onClick={() => setMobileOpen(false)}
                   className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                 >
                   <BoltIcon className="h-4 w-4" />
                   Velocity Reports
                 </Link>
               </>
             )}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <ArrowLeftOnRectangleIcon className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </Dialog>
      </header>

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} user={user} />
    </>
  );
}

export default Navbar;
