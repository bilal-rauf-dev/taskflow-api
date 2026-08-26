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
  pending: 'bg-tertiary/35 text-foreground',
  'in-progress': 'bg-accent-muted text-accent',
  completed: 'bg-emerald-100 text-emerald-700'
};

function TaskCard({ task, onEdit, onDelete, draggable, onDragStart, onKeyDown }) {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = dueDate ? dueDate.getTime() <= today.getTime() : false;

  return (
    <article
      tabIndex={0}
      onKeyDown={onKeyDown}
      draggable={draggable}
      onDragStart={onDragStart}
      className={`animate-rise w-full rounded-md border-2 border-foreground border-l-[8px] bg-surface p-5 shadow-[4px_4px_0_#E2E8F0] transition duration-300 hover:-translate-y-1 hover:rotate-[-0.4deg] hover:shadow-[6px_6px_0_#F3E8FF] focus-visible:outline-none ${priorityBorders[task.priority]} ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <div className="mb-2 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="line-clamp-1 font-heading text-xl font-extrabold text-foreground">{task.title}</h3>
          {dueDate && (
            <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${isOverdue ? 'text-danger' : 'text-foreground-muted'}`}>
              {isOverdue ? (
                <ExclamationTriangleIcon className="h-4 w-4" strokeWidth={2.5} />
              ) : (
                <CalendarDaysIcon className="h-4 w-4" strokeWidth={2.5} />
              )}
              Due: {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>
        <span className={`rounded-full border border-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${statusStyles[task.status]}`}>
          {task.status.replace('-', ' ')}
        </span>
      </div>

      <p className="mb-4 min-h-12 text-sm leading-6 text-foreground-muted">{task.description || 'No description provided.'}</p>

      <div className="mb-5 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 rounded-full border border-foreground px-3 py-1 text-xs font-semibold ${priorityStyles[task.priority]}`}>
          <FlagIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
          {task.priority} priority
        </span>
        {task.status === 'completed' && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
            <CheckCircleIcon className="h-4 w-4" strokeWidth={2.5} />
            Done
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="qp-button-secondary flex-1 gap-2 px-3 py-2 text-sm"
        >
          <PencilSquareIcon className="h-4 w-4" strokeWidth={2.5} />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(task._id)}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border-2 border-foreground bg-white px-3 py-2 font-heading text-sm font-bold text-danger transition hover:bg-secondary hover:text-white"
        >
          <TrashIcon className="h-4 w-4" strokeWidth={2.5} />
          Delete
        </button>
      </div>
    </article>
  );
}

export default TaskCard;
