import { describe, test, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { useBoardDnd } from './useBoardDnd';
import api from '../api/axios';

vi.mock('../api/axios', () => ({
  default: { put: vi.fn() }
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() }
}));

const COLUMN_A = '507f1f77bcf86cd799439011';
const COLUMN_B = '507f1f77bcf86cd799439012';

const taskFixture = (id, column, position) => ({ _id: id, title: id, column, position });

// Drives useBoardDnd through a small stateful harness so result.current always
// reflects the latest tasks/columns after a drag handler updates them -
// mirrors how BoardView actually wires the hook up to its own state.
function useHarness(initial) {
  const [tasks, setTasks] = useState(initial.tasks);
  const [columns, setColumns] = useState(initial.columns);
  const dnd = useBoardDnd({ boardId: 'board-1', columns, setColumns, tasks, setTasks, enabled: true });
  return { ...dnd, tasks, columns };
}

const taskDragEvents = (activeTask, overId, overData) => ({
  start: { active: { id: activeTask._id, data: { current: { type: 'task', task: activeTask } } } },
  end: {
    active: { id: activeTask._id, data: { current: { type: 'task', columnId: activeTask.column, task: activeTask } } },
    over: { id: overId, data: { current: overData } }
  }
});

const columnDragEvents = (activeColumn, overId, overColumn) => ({
  start: { active: { id: activeColumn._id, data: { current: { type: 'column', column: activeColumn } } } },
  end: {
    active: { id: activeColumn._id, data: { current: { type: 'column', column: activeColumn } } },
    over: { id: overId, data: { current: { type: 'column', column: overColumn } } }
  }
});

beforeEach(() => {
  api.put.mockReset();
});

describe('useBoardDnd - task moves', () => {
  test('reorders two tasks within the same column', async () => {
    const taskA = taskFixture('task-a', COLUMN_A, 0);
    const taskB = taskFixture('task-b', COLUMN_A, 1);
    api.put.mockResolvedValueOnce({ data: { data: { task: { ...taskB, position: 0 } } } });

    const { result } = renderHook(() => useHarness({ tasks: [taskA, taskB], columns: [] }));
    // Drag taskB (currently second) onto taskA's slot - it should become first.
    const { start, end } = taskDragEvents(taskB, taskA._id, { type: 'task', columnId: COLUMN_A, task: taskA });

    await act(async () => {
      result.current.handleDragStart(start);
    });
    await act(async () => {
      await result.current.handleDragEnd(end);
    });

    const byId = Object.fromEntries(result.current.tasks.map((t) => [t._id, t]));
    expect(byId['task-b'].position).toBe(0);
    expect(byId['task-a'].position).toBe(1);
    expect(api.put).toHaveBeenCalledWith('/boards/board-1/tasks/task-b/move', {
      columnId: COLUMN_A,
      position: 0
    });
  });

  test('moves a task into a different column, appending it and renumbering both columns', async () => {
    const taskA = taskFixture('task-a', COLUMN_A, 0);
    const taskB = taskFixture('task-b', COLUMN_A, 1);
    const taskC = taskFixture('task-c', COLUMN_B, 0);
    const movedTask = { ...taskA, column: COLUMN_B, position: 1 };
    api.put.mockResolvedValueOnce({ data: { data: { task: movedTask } } });

    const { result } = renderHook(() => useHarness({ tasks: [taskA, taskB, taskC], columns: [] }));
    // Drop taskA on column B's empty area (not on a specific task) - it
    // should append after taskC, the only card already there.
    const { start, end } = taskDragEvents(taskA, `column-drop:${COLUMN_B}`, {
      type: 'column-drop-zone',
      columnId: COLUMN_B
    });

    await act(async () => {
      result.current.handleDragStart(start);
    });
    await act(async () => {
      await result.current.handleDragEnd(end);
    });

    expect(api.put).toHaveBeenCalledWith('/boards/board-1/tasks/task-a/move', {
      columnId: COLUMN_B,
      position: 1
    });

    const byId = Object.fromEntries(result.current.tasks.map((t) => [t._id, t]));
    // taskB is now alone in column A and should have shifted down to position 0.
    expect(byId['task-b'].column).toBe(COLUMN_A);
    expect(byId['task-b'].position).toBe(0);
    // taskA landed in column B after taskC.
    expect(byId['task-c'].position).toBe(0);
    expect(byId['task-a'].column).toBe(COLUMN_B);
    expect(byId['task-a'].position).toBe(1);
  });

  test('rolls back to the pre-drag snapshot when the move API call fails', async () => {
    const taskA = taskFixture('task-a', COLUMN_A, 0);
    const taskC = taskFixture('task-c', COLUMN_B, 0);
    api.put.mockRejectedValueOnce({ response: { data: { message: 'WIP limit reached' } } });

    const { result } = renderHook(() => useHarness({ tasks: [taskA, taskC], columns: [] }));
    const { start, end } = taskDragEvents(taskA, `column-drop:${COLUMN_B}`, {
      type: 'column-drop-zone',
      columnId: COLUMN_B
    });

    await act(async () => {
      result.current.handleDragStart(start);
    });
    await act(async () => {
      await result.current.handleDragEnd(end);
    });

    // Should be back to exactly where it started, not left in the optimistic
    // (but never confirmed) moved state.
    const byId = Object.fromEntries(result.current.tasks.map((t) => [t._id, t]));
    expect(byId['task-a'].column).toBe(COLUMN_A);
    expect(byId['task-a'].position).toBe(0);
    expect(byId['task-c'].column).toBe(COLUMN_B);
    expect(byId['task-c'].position).toBe(0);
  });

  test('does nothing when dropped back on its own current slot', async () => {
    const taskA = taskFixture('task-a', COLUMN_A, 0);

    const { result } = renderHook(() => useHarness({ tasks: [taskA], columns: [] }));
    const { start, end } = taskDragEvents(taskA, `column-drop:${COLUMN_A}`, {
      type: 'column-drop-zone',
      columnId: COLUMN_A
    });

    await act(async () => {
      result.current.handleDragStart(start);
    });
    await act(async () => {
      await result.current.handleDragEnd(end);
    });

    expect(api.put).not.toHaveBeenCalled();
    expect(result.current.tasks).toEqual([taskA]);
  });
});

describe('useBoardDnd - column reorder', () => {
  test('reorders columns optimistically and persists the new order', async () => {
    const columnA = { _id: 'col-a', order: 0 };
    const columnB = { _id: 'col-b', order: 1 };
    api.put.mockResolvedValueOnce({ data: { data: { columns: [] } } });

    const { result } = renderHook(() => useHarness({ tasks: [], columns: [columnA, columnB] }));
    const { start, end } = columnDragEvents(columnB, 'col-a', columnA);

    await act(async () => {
      result.current.handleDragStart(start);
    });
    await act(async () => {
      await result.current.handleDragEnd(end);
    });

    expect(result.current.columns.map((c) => c._id)).toEqual(['col-b', 'col-a']);
    expect(api.put).toHaveBeenCalledWith('/boards/board-1/columns/reorder', {
      orderedColumnIds: ['col-b', 'col-a']
    });
  });

  test('rolls back column order when persisting the reorder fails', async () => {
    const columnA = { _id: 'col-a', order: 0 };
    const columnB = { _id: 'col-b', order: 1 };
    api.put.mockRejectedValueOnce(new Error('network error'));

    const { result } = renderHook(() => useHarness({ tasks: [], columns: [columnA, columnB] }));
    const { start, end } = columnDragEvents(columnB, 'col-a', columnA);

    await act(async () => {
      result.current.handleDragStart(start);
    });
    await act(async () => {
      await result.current.handleDragEnd(end);
    });

    expect(result.current.columns.map((c) => c._id)).toEqual(['col-a', 'col-b']);
  });
});
