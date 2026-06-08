import React from 'react';
import { useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CalendarDaysIcon, XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const statusOptions = [
  { label: 'Pending', value: 'pending', active: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  { label: 'In Progress', value: 'in-progress', active: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500' },
  { label: 'Completed', value: 'completed', active: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' }
];

const priorityOptions = [
  { label: 'Low', value: 'low', active: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  { label: 'Medium', value: 'medium', active: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  { label: 'High', value: 'high', active: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' }
];

const defaultForm = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  dueDate: ''
};

function TaskModal({ isOpen, onClose, onSubmit, initialTask }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setForm({
        title: initialTask.title || '',
        description: initialTask.description || '',
        status: initialTask.status || 'pending',
        priority: initialTask.priority || 'medium',
        dueDate: initialTask.dueDate ? new Date(initialTask.dueDate).toISOString().split('T')[0] : ''
      });
    } else {
      setForm(defaultForm);
    }
  }, [initialTask, isOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition show={isOpen} as={Dialog} onClose={onClose} className="relative z-50">
      <Transition.Child
        as="div"
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm"
      />

      <div className="fixed inset-0 flex justify-end">
        <Transition.Child
          as={Dialog.Panel}
          enter="transform transition duration-300 ease-out"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition duration-200 ease-in"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="flex h-full w-full max-w-full flex-col bg-white shadow-2xl sm:max-w-xl"
        >
          <div className="flex items-center justify-between bg-gradient-to-r from-slate-950 via-gray-850 to-slate-900 px-5 py-4 text-white sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Task Editor</p>
              <Dialog.Title className="mt-1 text-xl font-bold">{initialTask ? 'Edit Task' : 'New Task'}</Dialog.Title>
            </div>
            <button type="button" onClick={onClose} className="rounded-full bg-white/10 p-2 transition hover:bg-white/20">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6">
            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">Title</span>
                <div className="relative">
                  <PencilSquareIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="title"
                    required
                    value={form.title}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">Description</span>
                <textarea
                  name="description"
                  rows="4"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </label>

              <div>
                <span className="mb-2 block text-sm font-medium text-gray-700">Priority</span>
                <div className="grid grid-cols-3 gap-3">
                  {priorityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, priority: option.value }))}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                        form.priority === option.value
                          ? `${option.active} shadow-sm`
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${option.dot}`} />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-2 block text-sm font-medium text-gray-700">Status</span>
                <div className="grid gap-3 sm:grid-cols-3">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, status: option.value }))}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                        form.status === option.value
                          ? `${option.active} shadow-sm`
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${option.dot}`} />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">Due Date</span>
                <div className="relative">
                  <CalendarDaysIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </label>
            </div>
          </form>

          <div className="border-t border-gray-100 bg-white px-5 py-4 sm:px-6">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 via-gray-850 to-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </Transition.Child>
      </div>
    </Transition>
  );
}

export default TaskModal;
