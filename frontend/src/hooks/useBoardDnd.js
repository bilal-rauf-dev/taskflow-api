import { useCallback, useRef, useState } from 'react';
import { PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import toast from 'react-hot-toast';
import api from '../api/axios';

// Drives drag-and-drop for a single Kanban board: column reordering and
// moving tasks between/within columns. Rendering (DndContext, sortable
// items, DragOverlay) lives in BoardView/BoardColumn - this hook only owns
// the state transitions, so the move logic can be unit tested without
// simulating real pointer gestures.
export function useBoardDnd({ boardId, columns, setColumns, tasks, setTasks, enabled = true }) {
  const [activeTask, setActiveTask] = useState(null);
  const [activeColumn, setActiveColumn] = useState(null);
  const snapshotRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback(
    (event) => {
      const { active } = event;
      // Shallow-clone so later in-place position renumbering never mutates
      // the objects this snapshot is meant to restore on rollback.
      snapshotRef.current = {
        tasks: tasks.map((task) => ({ ...task })),
        columns: columns.map((column) => ({ ...column }))
      };

      if (active.data.current?.type === 'task') {
        setActiveTask(active.data.current.task);
      } else if (active.data.current?.type === 'column') {
        setActiveColumn(active.data.current.column);
      }
    },
    [tasks, columns]
  );

  const handleDragCancel = useCallback(() => {
    setActiveTask(null);
    setActiveColumn(null);
    snapshotRef.current = null;
  }, []);

  const handleDragEnd = useCallback(
    async (event) => {
      const { active, over } = event;
      const snapshot = snapshotRef.current;
      setActiveTask(null);
      setActiveColumn(null);
      snapshotRef.current = null;

      if (!enabled || !over) return;

      if (active.data.current?.type === 'column') {
        if (active.id === over.id) return;

        const oldIndex = columns.findIndex((column) => column._id === active.id);
        const newIndex = columns.findIndex((column) => column._id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(columns, oldIndex, newIndex);
        setColumns(reordered);

        try {
          await api.put(`/boards/${boardId}/columns/reorder`, {
            orderedColumnIds: reordered.map((column) => column._id)
          });
        } catch (error) {
          setColumns(snapshot?.columns || columns);
          toast.error(error.response?.data?.message || 'Failed to reorder columns');
        }
        return;
      }

      if (active.data.current?.type === 'task') {
        const activeTaskData = active.data.current.task;
        const overData = over.data.current;
        const targetColumnId = overData?.columnId;
        if (!targetColumnId) return;

        const destSiblings = tasks
          .filter((task) => task.column === targetColumnId && task._id !== activeTaskData._id)
          .sort((a, b) => a.position - b.position);

        let targetIndex = destSiblings.length;
        if (overData.type === 'task') {
          const overIndex = destSiblings.findIndex((task) => task._id === over.id);
          if (overIndex !== -1) targetIndex = overIndex;
        }

        const unchanged = activeTaskData.column === targetColumnId && activeTaskData.position === targetIndex;
        if (unchanged) return;

        // Optimistic local reorder: renumber the source column (if the task
        // is leaving it) and insert it into the destination column. Clone
        // every task object first so this never mutates the previous
        // render's state (which the rollback snapshot above still needs).
        const remaining = tasks
          .filter((task) => task._id !== activeTaskData._id)
          .map((task) => ({ ...task }));

        if (activeTaskData.column !== targetColumnId) {
          let sourceIndex = 0;
          remaining.forEach((task) => {
            if (task.column === activeTaskData.column) {
              task.position = sourceIndex;
              sourceIndex += 1;
            }
          });
        }

        const destination = remaining
          .filter((task) => task.column === targetColumnId)
          .sort((a, b) => a.position - b.position);
        const movedTask = { ...activeTaskData, column: targetColumnId };
        destination.splice(targetIndex, 0, movedTask);
        destination.forEach((task, index) => {
          task.position = index;
        });

        const finalTasks = [...remaining.filter((task) => task.column !== targetColumnId), ...destination];
        setTasks(finalTasks);

        try {
          const response = await api.put(`/boards/${boardId}/tasks/${activeTaskData._id}/move`, {
            columnId: targetColumnId,
            position: targetIndex
          });
          const confirmedTask = response.data.data.task;
          setTasks((prev) =>
            prev.map((task) => (task._id === confirmedTask._id ? { ...task, ...confirmedTask } : task))
          );
        } catch (error) {
          setTasks(snapshot?.tasks || tasks);
          toast.error(error.response?.data?.message || 'Failed to move task');
        }
      }
    },
    [enabled, tasks, columns, boardId, setTasks, setColumns]
  );

  return {
    sensors,
    activeTask,
    activeColumn,
    handleDragStart,
    handleDragEnd,
    handleDragCancel
  };
}
