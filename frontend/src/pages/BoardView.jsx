import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { ArrowLeftIcon, PlusIcon, UsersIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useBoardDnd } from '../hooks/useBoardDnd';
import BoardColumn from '../components/BoardColumn';
import BoardMembersPanel, { getMemberId } from '../components/BoardMembersPanel';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

function AddColumnButton({ onAdd }) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await onAdd(name.trim());
      setName('');
      setIsAdding(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        type="button"
        onClick={() => setIsAdding(true)}
        className="flex h-14 w-80 flex-shrink-0 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border-strong bg-surface/60 px-4 text-sm font-bold text-foreground-muted transition hover:border-foreground hover:text-foreground"
      >
        <PlusIcon className="h-4 w-4" /> Add column
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="w-80 flex-shrink-0 rounded-lg border-2 border-foreground bg-surface p-3 shadow-[5px_5px_0_#E2E8F0]"
    >
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Column name"
        className="qp-input w-full px-3 py-2 text-sm"
      />
      <div className="mt-2 flex gap-2">
        <button type="submit" disabled={submitting} className="qp-button flex-1 px-3 py-2 text-xs">
          Add
        </button>
        <button type="button" onClick={() => setIsAdding(false)} className="qp-button-secondary flex-1 px-3 py-2 text-xs">
          Cancel
        </button>
      </div>
    </form>
  );
}

function BoardView() {
  const { boardId } = useParams();
  const { user, isAdmin } = useAuth();
  const socket = useSocket();

  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [targetColumnId, setTargetColumnId] = useState(null);

  const fetchBoard = async () => {
    const response = await api.get(`/boards/${boardId}`);
    setBoard(response.data.data.board);
    setColumns(response.data.data.columns);
  };

  const fetchTasks = async () => {
    const response = await api.get(`/boards/${boardId}/tasks`);
    setTasks(response.data.data.tasks || []);
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setForbidden(false);
      try {
        await Promise.all([fetchBoard(), fetchTasks()]);
      } catch (error) {
        if (!cancelled) {
          setForbidden(true);
          toast.error(error.response?.data?.message || 'Unable to load this board');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [boardId]);

  useEffect(() => {
    if (!socket || !boardId) return;

    socket.emit('join_board_room', boardId);

    socket.on('task_moved', ({ task }) => {
      setTasks((prev) => {
        const exists = prev.some((t) => t._id === task._id);
        return exists ? prev.map((t) => (t._id === task._id ? task : t)) : [...prev, task];
      });
    });

    socket.on('column_added', ({ column }) => {
      setColumns((prev) => (prev.some((c) => c._id === column._id) ? prev : [...prev, column].sort((a, b) => a.order - b.order)));
    });

    socket.on('column_updated', ({ column }) => {
      setColumns((prev) => prev.map((c) => (c._id === column._id ? column : c)));
    });

    socket.on('column_deleted', ({ columns: updated }) => {
      setColumns(updated);
    });

    socket.on('column_reordered', ({ columns: updated }) => {
      setColumns(updated);
    });

    socket.on('membership_changed', () => {
      fetchBoard().catch(() => {});
    });

    return () => {
      socket.emit('leave_board_room', boardId);
      socket.off('task_moved');
      socket.off('column_added');
      socket.off('column_updated');
      socket.off('column_deleted');
      socket.off('column_reordered');
      socket.off('membership_changed');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, boardId]);

  const myRole = useMemo(() => {
    if (isAdmin) return 'owner';
    return board?.members?.find((member) => getMemberId(member) === user?.id)?.role || null;
  }, [board, user, isAdmin]);

  const canEdit = myRole === 'owner' || myRole === 'editor';
  const isOwner = myRole === 'owner';

  const tasksByColumn = (columnId) =>
    tasks.filter((task) => task.column === columnId).sort((a, b) => a.position - b.position);

  const { sensors, activeTask, activeColumn, handleDragStart, handleDragEnd, handleDragCancel } = useBoardDnd({
    boardId,
    columns,
    setColumns,
    tasks,
    setTasks,
    enabled: canEdit
  });

  const openCreateForColumn = (columnId) => {
    setEditingTask(null);
    setTargetColumnId(columnId);
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSubmitTask = async (payload) => {
    if (editingTask) {
      const response = await api.put(`/tasks/${editingTask._id}`, payload);
      const updated = response.data.data.task;
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? { ...t, ...updated } : t)));
      toast.success('Task updated');
      return;
    }

    let created;
    try {
      const response = await api.post('/tasks', payload);
      created = response.data.data.task;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create task');
      throw error;
    }

    try {
      const position = tasksByColumn(targetColumnId).length;
      const moveResponse = await api.put(`/boards/${boardId}/tasks/${created._id}/move`, {
        columnId: targetColumnId,
        position
      });
      // This board's own socket room echoes task_moved back to the sender,
      // so the socket handler above may already have appended this task by
      // the time this response resolves - dedupe instead of appending blindly.
      const movedTask = moveResponse.data.data.task;
      setTasks((prev) => {
        const exists = prev.some((t) => t._id === movedTask._id);
        return exists ? prev.map((t) => (t._id === movedTask._id ? movedTask : t)) : [...prev, movedTask];
      });
      toast.success('Task added to board');
    } catch (error) {
      // The task was created but couldn't be placed on this board (e.g. WIP
      // limit hit between opening the form and submitting) - clean it up
      // rather than leaving an orphaned, invisible task behind.
      try {
        await api.delete(`/tasks/${created._id}`);
      } catch {
        // best effort
      }
      toast.error(error.response?.data?.message || 'Unable to place task on this board');
      throw error;
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((task) => task._id !== id));
      toast.success('Task deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete task');
    }
  };

  const handleAddColumn = async (name) => {
    try {
      const response = await api.post(`/boards/${boardId}/columns`, { name });
      setColumns((prev) => [...prev, response.data.data.column]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to add column');
    }
  };

  const handleRenameColumn = async (columnId, name) => {
    try {
      const response = await api.put(`/boards/${boardId}/columns/${columnId}`, { name });
      setColumns((prev) => prev.map((c) => (c._id === columnId ? response.data.data.column : c)));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to rename column');
    }
  };

  const handleUpdateWipLimit = async (columnId, wipLimit) => {
    try {
      const response = await api.put(`/boards/${boardId}/columns/${columnId}`, { wipLimit });
      setColumns((prev) => prev.map((c) => (c._id === columnId ? response.data.data.column : c)));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update WIP limit');
    }
  };

  const handleDeleteColumn = async (columnId) => {
    if (tasksByColumn(columnId).length > 0) {
      toast.error('Move or delete tasks in this column first');
      return;
    }

    try {
      const response = await api.delete(`/boards/${boardId}/columns/${columnId}`);
      setColumns((prev) => prev.filter((c) => c._id !== response.data.data.columnId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete column');
    }
  };

  const handleInvite = async (email, role) => {
    try {
      const response = await api.post(`/boards/${boardId}/members`, { email, role });
      setBoard(response.data.data.board);
      toast.success('Member added');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to add member');
      throw error;
    }
  };

  const handleChangeRole = async (userId, role) => {
    try {
      const response = await api.put(`/boards/${boardId}/members/${userId}`, { role });
      setBoard(response.data.data.board);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to change role');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      const response = await api.delete(`/boards/${boardId}/members/${userId}`);
      setBoard(response.data.data.board);
      toast.success('Member removed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to remove member');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-24 animate-pulse rounded-lg border-2 border-foreground bg-surface" />
        <div className="mt-6 flex gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-96 w-80 flex-shrink-0 animate-pulse rounded-lg border-2 border-foreground bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  if (forbidden || !board) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="qp-heading text-3xl text-foreground">Can&apos;t open this board</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          You may not have access to it, or it no longer exists.
        </p>
        <Link to="/boards" className="qp-button mt-6 inline-flex gap-2 px-5 py-3 text-sm">
          <ArrowLeftIcon className="h-4 w-4" strokeWidth={2.5} />
          Back to boards
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link to="/boards" className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground-muted hover:text-accent">
              <ArrowLeftIcon className="h-3.5 w-3.5" /> All boards
            </Link>
            <h1 className="qp-heading mt-1 text-3xl text-foreground sm:text-4xl">{board.name}</h1>
            {board.description && <p className="mt-1 max-w-2xl text-sm text-foreground-muted">{board.description}</p>}
          </div>

          <button
            type="button"
            onClick={() => setMembersOpen(true)}
            className="qp-button-secondary gap-2 px-4 py-2.5 text-sm"
          >
            <UsersIcon className="h-4 w-4" />
            {board.members?.length || 1} member{board.members?.length === 1 ? '' : 's'}
          </button>
        </div>

        {!canEdit && myRole === 'viewer' && (
          <p className="mb-4 rounded-md border-2 border-dashed border-border-strong bg-surface px-4 py-2 text-xs font-semibold text-foreground-muted">
            You have viewer access to this board - drag-and-drop and edits are disabled.
          </p>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={columns.map((c) => c._id)} strategy={horizontalListSortingStrategy}>
            <div className="flex items-start gap-4 overflow-x-auto pb-4">
              {columns.map((column) => (
                <BoardColumn
                  key={column._id}
                  column={column}
                  tasks={tasksByColumn(column._id)}
                  canEdit={canEdit}
                  onEditTask={openEdit}
                  onDeleteTask={handleDeleteTask}
                  onAddTask={openCreateForColumn}
                  onRenameColumn={handleRenameColumn}
                  onUpdateWipLimit={handleUpdateWipLimit}
                  onDeleteColumn={handleDeleteColumn}
                />
              ))}
              {canEdit && <AddColumnButton onAdd={handleAddColumn} />}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeTask ? (
              <div className="w-80 rotate-2">
                <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} draggable={false} />
              </div>
            ) : null}
            {activeColumn ? (
              <div className="w-80 rounded-lg border-2 border-foreground bg-surface p-4 font-heading text-lg font-bold text-foreground shadow-pop">
                {activeColumn.name}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      <TaskModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmitTask} initialTask={editingTask} />

      <BoardMembersPanel
        isOpen={membersOpen}
        onClose={() => setMembersOpen(false)}
        board={board}
        isOwner={isOwner}
        onInvite={handleInvite}
        onChangeRole={handleChangeRole}
        onRemove={handleRemoveMember}
      />
    </div>
  );
}

export default BoardView;
