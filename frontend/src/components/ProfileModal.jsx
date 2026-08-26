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
          enter="transition-opacity duration-250 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-foreground/45 backdrop-blur-[2px]" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="transition duration-400 ease-out"
            enterFrom="opacity-0 translate-y-3"
            enterTo="opacity-100 translate-y-0"
            leave="transition duration-150 ease-in"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-2"
          >
            <Dialog.Panel className="w-full max-w-md rounded-lg border-2 border-foreground bg-surface p-6 shadow-[8px_8px_0_#FBBF24]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Profile</p>
                  <Dialog.Title className="qp-heading mt-2 text-3xl text-foreground">Account details</Dialog.Title>
                </div>
                <button type="button" onClick={onClose} className="rounded-sm p-2 text-foreground-muted transition hover:bg-background hover:text-foreground">
                  <XMarkIcon className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </div>

              <div className="mt-6 rounded-md border border-border bg-accent-muted p-5 text-foreground">
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-md bg-accent text-white shadow-xs">
                    <UserCircleIcon className="h-9 w-9" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-heading text-2xl">{user?.name || 'User'}</p>
                    <p className="truncate text-sm text-foreground-muted">{user?.email || 'No email available'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-md bg-background px-4 py-3">
                  <div className="flex items-center gap-3 text-sm font-medium text-foreground-muted">
                    <EnvelopeIcon className="h-5 w-5 text-accent" strokeWidth={1.5} />
                    Email
                  </div>
                  <p className="max-w-[60%] truncate text-sm font-semibold text-foreground">{user?.email || 'N/A'}</p>
                </div>
                <div className="flex items-center justify-between rounded-md bg-background px-4 py-3">
                  <div className="flex items-center gap-3 text-sm font-medium text-foreground-muted">
                    <ShieldCheckIcon className="h-5 w-5 text-accent" strokeWidth={1.5} />
                    Role
                  </div>
                  <span className="rounded-full bg-accent-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                    {user?.role || 'user'}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-background px-4 py-3">
                  <div className="flex items-center gap-3 text-sm font-medium text-foreground-muted">
                    <CalendarDaysIcon className="h-5 w-5 text-accent" strokeWidth={1.5} />
                    Member since
                  </div>
                  <p className="text-sm font-semibold text-foreground">
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
                className="qp-button mt-6 w-full px-4 py-3 text-sm"
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
