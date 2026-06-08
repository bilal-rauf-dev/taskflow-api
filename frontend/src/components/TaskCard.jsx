import React from 'react';
import {
  PencilSquareIcon,
  TrashIcon,
  FlagIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const priorityStyles = {
  low: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-rose-100 text-rose-700'
};

const priorityBorders = {
  low: 'border-l-emerald-500',
  medium: 'border-l-amber-500',
  high: 'border-l-rose-500'
};

const statusStyles = {
  pending: 'bg-slate-100 text-slate-700',
  'in-progress': 'bg-slate-100 text-slate-700',
  completed: 'bg-green-100 text-green-700'
};

function TaskCard({ task, onEdit, onDelete }) {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = dueDate ? dueDate.getTime() <= today.getTime() : false;

  return (
    <article className={`animate-rise w-full rounded-2xl border border-gray-200 border-l-4 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-xl ${priorityBorders[task.priority]}`}>
      <div className="mb-2 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="line-clamp-1 text-lg font-semibold text-gray-900">{task.title}</h3>
          {dueDate && (
            <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
              {isOverdue ? (
                <ExclamationTriangleIcon className="h-4 w-4" />
              ) : (
                <CalendarDaysIcon className="h-4 w-4" />
              )}
              Due: {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[task.status]}`}>
          {task.status}
        </span>
      </div>

      <p className="mb-4 min-h-12 text-sm text-gray-600">{task.description || 'No description provided.'}</p>

      <div className="mb-5 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[task.priority]}`}>
          <FlagIcon className="h-3.5 w-3.5" />
          {task.priority} priority
        </span>
        {task.status === 'completed' && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
            <CheckCircleIcon className="h-4 w-4" />
            Done
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <PencilSquareIcon className="h-4 w-4" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(task._id)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <TrashIcon className="h-4 w-4" />
          Delete
        </button>
      </div>
    </article>
  );
}

export default TaskCard;
