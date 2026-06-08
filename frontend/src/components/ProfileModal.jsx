import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CalendarDaysIcon, EnvelopeIcon, ShieldCheckIcon, UserCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

function ProfileModal({ isOpen, onClose, user }) {
  const memberSince = user?.createdAt ? new Date(user.createdAt) : null;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[60]">
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="transition duration-200 ease-out"
            enterFrom="opacity-0 scale-95 translate-y-2"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="transition duration-150 ease-in"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-2"
          >
            <Dialog.Panel className="w-full max-w-md rounded-[0.5rem] border border-white/20 bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">Profile</p>
                  <Dialog.Title className="mt-2 text-2xl font-black text-gray-900">Account details</Dialog.Title>
                </div>
                <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 rounded-3xl bg-gradient-to-br from-slate-950 via-gray-850 to-slate-900 p-5 text-white shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 text-white">
                    <UserCircleIcon className="h-10 w-10" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xl font-bold">{user?.name || 'User'}</p>
                    <p className="truncate text-sm text-white/80">{user?.email || 'No email available'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <EnvelopeIcon className="h-5 w-5 text-slate-700" />
                    Email
                  </div>
                  <p className="max-w-[60%] truncate text-sm font-semibold text-gray-900">{user?.email || 'N/A'}</p>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <ShieldCheckIcon className="h-5 w-5 text-slate-700" />
                    Role
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-700">
                    {user?.role || 'user'}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <CalendarDaysIcon className="h-5 w-5 text-slate-700" />
                    Member since
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {memberSince
                      ? memberSince.toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                          day: 'numeric'
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-slate-950 via-gray-850 to-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.01]"
              >
                Close profile
              </button>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

export default ProfileModal;