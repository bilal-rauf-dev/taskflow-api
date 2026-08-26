import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

function CreateBoardModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() });
      setName('');
      setDescription('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

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

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Transition.Child
          as={Dialog.Panel}
          enter="transform transition duration-300 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transform transition duration-200 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
          className="playful-panel w-full max-w-md p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="qp-heading text-2xl">New Board</Dialog.Title>
            <button type="button" onClick={onClose} className="rounded-full border-2 border-foreground bg-tertiary p-2 text-foreground shadow-xs">
              <XMarkIcon className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-foreground">Name</span>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product Launch"
                className="qp-input w-full px-4 py-3 text-sm"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-foreground">
                Description <span className="normal-case text-foreground-muted">(optional)</span>
              </span>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="qp-input w-full px-4 py-3 text-sm"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="qp-button w-full gap-2 px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Creating...' : 'Create board'}
            </button>
          </form>
        </Transition.Child>
      </div>
    </Transition>
  );
}

export default CreateBoardModal;
