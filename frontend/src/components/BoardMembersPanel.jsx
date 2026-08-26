import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, UserPlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getMemberId } from '../utils/boardMembers';

const ROLE_OPTIONS = ['viewer', 'editor'];

function BoardMembersPanel({ isOpen, onClose, board, isOwner, onInvite, onChangeRole, onRemove }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [submitting, setSubmitting] = useState(false);

  const handleInvite = async (event) => {
    event.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    try {
      await onInvite(email.trim(), role);
      setEmail('');
    } finally {
      setSubmitting(false);
    }
  };

  const members = board?.members || [];

  return (
    <Transition show={isOpen} as={Dialog} onClose={onClose} className="relative z-50">
      <Transition.Child
        as="div"
        enter="transition-opacity duration-300 ease-out"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="fixed inset-0 bg-foreground/45 backdrop-blur-[2px]"
      />

      <div className="fixed inset-0 flex justify-end">
        <Transition.Child
          as={Dialog.Panel}
          enter="transform transition duration-400 ease-out"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition duration-200 ease-in"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="flex h-full w-full max-w-full flex-col border-l-2 border-foreground bg-surface shadow-[-8px_0_0_#34D399] sm:max-w-md"
        >
          <div className="flex items-center justify-between border-b-2 border-foreground bg-accent px-5 py-4 text-white sm:px-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Board Access</p>
              <Dialog.Title className="qp-heading mt-1 text-3xl">Members</Dialog.Title>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border-2 border-foreground bg-tertiary p-2 text-foreground shadow-xs transition hover:-translate-y-0.5"
            >
              <XMarkIcon className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            <ul className="space-y-3">
              {members.map((member) => {
                const memberId = getMemberId(member);
                const isFoundingOwner = memberId === (board.owner?._id || board.owner);
                const name = member.user?.name || 'Unknown user';
                const email = member.user?.email || '';

                return (
                  <li
                    key={memberId}
                    className="flex items-center justify-between gap-3 rounded-md border-2 border-foreground bg-background/60 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{name}</p>
                      <p className="truncate text-xs text-foreground-muted">{email}</p>
                    </div>

                    {isOwner && !isFoundingOwner ? (
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <select
                          value={member.role}
                          onChange={(e) => onChangeRole(memberId, e.target.value)}
                          className="qp-input px-2 py-1 text-xs"
                        >
                          {['owner', ...ROLE_OPTIONS].map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => onRemove(memberId)}
                          className="rounded-full border-2 border-transparent p-1.5 text-danger transition hover:border-foreground hover:bg-secondary hover:text-white"
                          aria-label={`Remove ${name}`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="flex-shrink-0 rounded-full border border-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-foreground-muted">
                        {isFoundingOwner ? 'owner' : member.role}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {isOwner && (
            <form onSubmit={handleInvite} className="border-t-2 border-foreground bg-tertiary/20 px-5 py-4 sm:px-6">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-foreground">
                Add a member
              </span>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teammate@example.com"
                  className="qp-input min-w-0 flex-1 px-3 py-2.5 text-sm"
                />
                <select value={role} onChange={(e) => setRole(e.target.value)} className="qp-input px-2 py-2.5 text-sm">
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={submitting}
                  className="qp-button gap-1.5 px-3 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <UserPlusIcon className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>
            </form>
          )}
        </Transition.Child>
      </div>
    </Transition>
  );
}

export default BoardMembersPanel;
