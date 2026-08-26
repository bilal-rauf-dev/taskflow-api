import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bars3Icon, PencilSquareIcon, TrashIcon, PlusIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import SortableTaskCard from './SortableTaskCard';

function BoardColumn({
  column,
  tasks,
  canEdit,
  onEditTask,
  onDeleteTask,
  onAddTask,
  onRenameColumn,
  onUpdateWipLimit,
  onDeleteColumn
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(column.name);
  const [isEditingWip, setIsEditingWip] = useState(false);
  const [wipDraft, setWipDraft] = useState(column.wipLimit ?? '');

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column._id,
    data: { type: 'column', column },
    disabled: !canEdit
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `column-drop:${column._id}`,
    data: { type: 'column-drop-zone', columnId: column._id }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const atWipLimit = column.wipLimit != null && tasks.length >= column.wipLimit;

  const submitRename = () => {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== column.name) {
      onRenameColumn(column._id, trimmed);
    }
    setIsRenaming(false);
  };

  const submitWip = () => {
    const value = wipDraft === '' ? null : Math.max(1, parseInt(wipDraft, 10) || 1);
    onUpdateWipLimit(column._id, value);
    setIsEditingWip(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex w-80 flex-shrink-0 flex-col rounded-lg border-2 border-foreground bg-background/60 shadow-[5px_5px_0_#E2E8F0]"
    >
      <div className="flex items-center gap-2 border-b-2 border-foreground px-4 py-3">
        {canEdit && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab text-foreground-muted hover:text-foreground active:cursor-grabbing"
            aria-label={`Drag column ${column.name}`}
          >
            <Bars3Icon className="h-4 w-4" />
          </button>
        )}

        {isRenaming ? (
          <div className="flex flex-1 items-center gap-1">
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitRename();
                if (e.key === 'Escape') setIsRenaming(false);
              }}
              className="qp-input min-w-0 flex-1 px-2 py-1 text-sm"
            />
            <button type="button" onClick={submitRename} className="text-success" aria-label="Save column name">
              <CheckIcon className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setIsRenaming(false)} className="text-danger" aria-label="Cancel rename">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <h3 className="flex-1 truncate font-heading text-lg font-bold text-foreground">{column.name}</h3>
        )}

        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            atWipLimit ? 'bg-danger text-white' : 'bg-surface text-foreground-muted'
          }`}
        >
          {column.wipLimit != null ? `${tasks.length}/${column.wipLimit}` : tasks.length}
        </span>

        {canEdit && !isRenaming && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setNameDraft(column.name);
                setIsRenaming(true);
              }}
              className="text-foreground-muted hover:text-foreground"
              aria-label="Rename column"
            >
              <PencilSquareIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDeleteColumn(column._id)}
              disabled={tasks.length > 0}
              className="text-foreground-muted hover:text-danger disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Delete column"
              title={tasks.length > 0 ? 'Move or delete tasks in this column first' : 'Delete column'}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {canEdit && (
        <div className="border-b border-dashed border-border-strong px-4 py-2">
          {isEditingWip ? (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-foreground-muted">WIP limit</span>
              <input
                type="number"
                min="1"
                autoFocus
                value={wipDraft}
                onChange={(e) => setWipDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitWip();
                  if (e.key === 'Escape') setIsEditingWip(false);
                }}
                className="qp-input w-16 px-2 py-1 text-xs"
              />
              <button type="button" onClick={submitWip} className="text-success" aria-label="Save WIP limit">
                <CheckIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setWipDraft(column.wipLimit ?? '');
                setIsEditingWip(true);
              }}
              className="text-xs font-medium text-foreground-muted hover:text-accent"
            >
              {column.wipLimit != null ? `WIP limit: ${column.wipLimit}` : 'Set WIP limit'}
            </button>
          )}
        </div>
      )}

      <div
        ref={setDropRef}
        className={`min-h-[120px] flex-1 space-y-3 overflow-y-auto p-3 transition-colors ${
          isOver ? 'bg-accent-muted/40' : ''
        }`}
      >
        <SortableContext items={tasks.map((task) => task._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task._id} task={task} onEdit={onEditTask} onDelete={onDeleteTask} disabled={!canEdit} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex h-20 items-center justify-center rounded-md border-2 border-dashed border-border-strong text-xs font-semibold text-foreground-muted">
            Drop tasks here
          </div>
        )}
      </div>

      {canEdit && (
        <button
          type="button"
          onClick={() => onAddTask(column._id)}
          disabled={atWipLimit}
          className="flex items-center justify-center gap-1.5 border-t-2 border-foreground px-4 py-2.5 text-xs font-bold text-foreground-muted transition hover:bg-accent-muted hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <PlusIcon className="h-3.5 w-3.5" /> Add task
        </button>
      )}
    </div>
  );
}

export default BoardColumn;
