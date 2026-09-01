import { GUEST_USER_ID } from './guestSession';

// Everything Guest Mode saves lives in one versioned localStorage blob. This
// module owns reading/writing it and every entity operation the guest
// adapter needs; the adapter's only job is translating REST calls into
// calls on this file. Kept storage-shape-compatible with the real Mongoose
// documents (same field names) so components never need to know which
// source their data came from.
const STORAGE_KEY = 'taskflow_guest_data_v1';

const DEFAULT_COLUMN_NAMES = ['To Do', 'In Progress', 'Completed'];

const genId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

const nowIso = () => new Date().toISOString();

const guestMember = () => ({
  user: { _id: GUEST_USER_ID, name: 'Guest', email: null },
  role: 'owner'
});

const emptyData = () => ({
  version: 1,
  boards: [],
  columns: [],
  tasks: [],
  comments: [],
  activity: []
});

const seedData = () => {
  const data = emptyData();
  const boardId = genId();
  const now = nowIso();

  data.boards.push({
    _id: boardId,
    name: 'Personal Board',
    description: 'Your local Guest Mode board. Nothing here leaves this device.',
    owner: GUEST_USER_ID,
    members: [guestMember()],
    isDefault: true,
    createdAt: now,
    updatedAt: now
  });

  const columns = DEFAULT_COLUMN_NAMES.map((name, order) => ({
    _id: genId(),
    board: boardId,
    name,
    order,
    wipLimit: null,
    createdAt: now,
    updatedAt: now
  }));
  data.columns.push(...columns);

  const sampleTasks = [
    {
      title: 'Explore TaskFlow',
      description: 'Try creating a task, dragging it across columns, and checking Smart Suggest on the Dashboard.',
      status: 'pending',
      priority: 'medium',
      column: columns[0]._id
    },
    {
      title: 'Drag a task to In Progress',
      description: 'Guest Mode saves everything to this browser only - nothing is sent anywhere.',
      status: 'in-progress',
      priority: 'high',
      column: columns[1]._id
    },
    {
      title: 'You did it!',
      description: 'When you are ready to keep this for good, create an account from Settings.',
      status: 'completed',
      priority: 'low',
      column: columns[2]._id
    }
  ];

  sampleTasks.forEach((task, index) => {
    const taskId = genId();
    data.tasks.push({
      _id: taskId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: null,
      owner: GUEST_USER_ID,
      board: boardId,
      column: task.column,
      position: 0,
      assignees: [],
      timeLog: [],
      createdAt: now,
      updatedAt: now
    });
    data.activity.push({
      _id: genId(),
      task: taskId,
      user: { _id: GUEST_USER_ID, name: 'Guest' },
      action: 'task_created',
      details: { newValue: task.title },
      createdAt: now
    });
    void index;
  });

  return data;
};

let cache = null;

const load = () => {
  if (cache) return cache;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cache = JSON.parse(raw);
      return cache;
    }
  } catch {
    // Corrupt or inaccessible storage - fall through and reseed.
  }

  cache = seedData();
  persist();
  return cache;
};

const persist = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Storage full/unavailable (private browsing, quota) - guest mode
    // degrades to "works for this render" rather than throwing.
  }
};

export const resetGuestData = () => {
  cache = seedData();
  persist();
  return cache;
};

export const clearGuestData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  cache = null;
};

// ---- Tasks ----------------------------------------------------------------

export const listTasks = () => {
  const data = load();
  return [...data.tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getTask = (id) => load().tasks.find((task) => task._id === id) || null;

export const createTask = ({ title, description, status, priority, dueDate }) => {
  const data = load();
  const now = nowIso();
  const task = {
    _id: genId(),
    title,
    description: description || '',
    status: status || 'pending',
    priority: priority || 'medium',
    dueDate: dueDate || null,
    owner: GUEST_USER_ID,
    board: null,
    column: null,
    position: 0,
    assignees: [],
    timeLog: [],
    createdAt: now,
    updatedAt: now
  };
  data.tasks.push(task);
  data.activity.push({
    _id: genId(),
    task: task._id,
    user: { _id: GUEST_USER_ID, name: 'Guest' },
    action: 'task_created',
    details: { newValue: title },
    createdAt: now
  });
  persist();
  return task;
};

const ACTION_BY_FIELD = {
  status: 'status_changed',
  priority: 'priority_changed',
  dueDate: 'dueDate_changed'
};

export const updateTask = (id, patch) => {
  const data = load();
  const task = data.tasks.find((t) => t._id === id);
  if (!task) return null;

  const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate'];
  const now = nowIso();

  allowedFields.forEach((field) => {
    if (patch[field] === undefined) return;
    const oldValue = task[field];
    const newValue = patch[field];
    if (oldValue === newValue) return;

    const action = ACTION_BY_FIELD[field];
    if (action) {
      data.activity.push({
        _id: genId(),
        task: id,
        user: { _id: GUEST_USER_ID, name: 'Guest' },
        action,
        details: { oldValue, newValue },
        createdAt: now
      });
    }
    task[field] = newValue;
  });

  task.updatedAt = now;
  persist();
  return task;
};

export const deleteTask = (id) => {
  const data = load();
  const existed = data.tasks.some((task) => task._id === id);
  data.tasks = data.tasks.filter((task) => task._id !== id);
  data.comments = data.comments.filter((comment) => comment.task !== id);
  data.activity = data.activity.filter((entry) => entry.task !== id);
  persist();
  return existed;
};

export const logTimeSpent = (id, durationSeconds) => {
  const data = load();
  const task = data.tasks.find((t) => t._id === id);
  if (!task) return null;
  task.timeLog.push({ durationSeconds, createdAt: nowIso() });
  task.updatedAt = nowIso();
  persist();
  return task;
};

export const getSmartSortedTasks = () => {
  // Mirrors backend/src/controllers/task.controller.js#getSmartSortedTasks
  // exactly, so Guest Mode ranks tasks the same way a real account would.
  const tasks = listTasks();

  return tasks
    .map((task) => {
      if (task.status === 'completed') {
        return { task, score: -9999 };
      }

      const priorityWeight = { high: 3, medium: 2, low: 1 }[task.priority] || 1;
      let daysRemaining = 7;

      if (task.dueDate) {
        const diffTime = new Date(task.dueDate) - new Date();
        daysRemaining = diffTime / (1000 * 60 * 60 * 24);
        if (daysRemaining < 0) daysRemaining = 0.1;
      }

      const score = priorityWeight * 10 - daysRemaining * 5;
      return { task, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.task);
};

// ---- Comments / activity ---------------------------------------------------

export const listComments = (taskId) =>
  load()
    .comments.filter((comment) => comment.task === taskId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

export const addComment = (taskId, content) => {
  const data = load();
  const now = nowIso();
  const comment = {
    _id: genId(),
    task: taskId,
    author: { _id: GUEST_USER_ID, name: 'Guest', email: null },
    content,
    createdAt: now
  };
  data.comments.push(comment);
  data.activity.push({
    _id: genId(),
    task: taskId,
    user: { _id: GUEST_USER_ID, name: 'Guest' },
    action: 'comment_added',
    details: { newValue: content },
    createdAt: now
  });
  persist();
  return comment;
};

export const listActivity = (taskId) =>
  load()
    .activity.filter((entry) => entry.task === taskId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

// ---- Boards -----------------------------------------------------------------

export const listBoards = () =>
  [...load().boards].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export const getBoard = (id) => load().boards.find((board) => board._id === id) || null;

export const createBoard = ({ name, description }) => {
  const data = load();
  const now = nowIso();
  const board = {
    _id: genId(),
    name,
    description: description || '',
    owner: GUEST_USER_ID,
    members: [guestMember()],
    isDefault: false,
    createdAt: now,
    updatedAt: now
  };
  data.boards.push(board);

  const columns = DEFAULT_COLUMN_NAMES.map((columnName, order) => ({
    _id: genId(),
    board: board._id,
    name: columnName,
    order,
    wipLimit: null,
    createdAt: now,
    updatedAt: now
  }));
  data.columns.push(...columns);

  persist();
  return { board, columns };
};

export const updateBoard = (id, patch) => {
  const data = load();
  const board = data.boards.find((b) => b._id === id);
  if (!board) return null;
  if (patch.name !== undefined) board.name = patch.name;
  if (patch.description !== undefined) board.description = patch.description;
  board.updatedAt = nowIso();
  persist();
  return board;
};

export const deleteBoard = (id) => {
  const data = load();
  const board = data.boards.find((b) => b._id === id);
  if (!board) return { status: 'not_found' };

  const hasTasks = data.tasks.some((task) => task.board === id);
  if (hasTasks) return { status: 'not_empty' };

  data.boards = data.boards.filter((b) => b._id !== id);
  data.columns = data.columns.filter((column) => column.board !== id);
  persist();
  return { status: 'ok' };
};

export const listColumns = (boardId) =>
  load()
    .columns.filter((column) => column.board === boardId)
    .sort((a, b) => a.order - b.order);

export const listBoardTasks = (boardId) =>
  load()
    .tasks.filter((task) => task.board === boardId)
    .sort((a, b) => a.position - b.position);

export const createColumn = (boardId, { name, wipLimit }) => {
  const data = load();
  const now = nowIso();
  const siblings = data.columns.filter((column) => column.board === boardId);
  const order = siblings.length ? Math.max(...siblings.map((c) => c.order)) + 1 : 0;

  const column = {
    _id: genId(),
    board: boardId,
    name,
    order,
    wipLimit: wipLimit ?? null,
    createdAt: now,
    updatedAt: now
  };
  data.columns.push(column);
  persist();
  return column;
};

export const updateColumn = (boardId, columnId, patch) => {
  const data = load();
  const column = data.columns.find((c) => c._id === columnId && c.board === boardId);
  if (!column) return null;
  if (patch.name !== undefined) column.name = patch.name;
  if (patch.wipLimit !== undefined) column.wipLimit = patch.wipLimit;
  column.updatedAt = nowIso();
  persist();
  return column;
};

export const deleteColumn = (boardId, columnId) => {
  const data = load();
  const column = data.columns.find((c) => c._id === columnId && c.board === boardId);
  if (!column) return { status: 'not_found' };

  const taskCount = data.tasks.filter((task) => task.column === columnId).length;
  if (taskCount > 0) return { status: 'not_empty' };

  data.columns = data.columns.filter((c) => c._id !== columnId);
  const remaining = data.columns.filter((c) => c.board === boardId).sort((a, b) => a.order - b.order);
  remaining.forEach((c, index) => {
    c.order = index;
  });
  persist();
  return { status: 'ok', columns: remaining };
};

export const reorderColumns = (boardId, orderedColumnIds) => {
  const data = load();
  const columns = data.columns.filter((column) => column.board === boardId);

  const isValidSet =
    columns.length === orderedColumnIds.length &&
    columns.every((column) => orderedColumnIds.includes(column._id));

  if (!isValidSet) return { status: 'invalid' };

  orderedColumnIds.forEach((columnId, index) => {
    const column = data.columns.find((c) => c._id === columnId);
    if (column) column.order = index;
  });

  persist();
  return { status: 'ok', columns: listColumns(boardId) };
};

// Mirrors backend/src/controllers/task.controller.js#moveTask: closes the
// gap left in the source column, then inserts the task into the destination
// column at the requested (clamped) position and renumbers its siblings.
export const moveTask = (boardId, taskId, { columnId, position }) => {
  const data = load();
  const board = data.boards.find((b) => b._id === boardId);
  if (!board) return { status: 'board_not_found' };

  const task = data.tasks.find((t) => t._id === taskId);
  if (!task) return { status: 'task_not_found' };

  if (task.board && task.board !== boardId) {
    return { status: 'wrong_board' };
  }

  const targetColumn = data.columns.find((c) => c._id === columnId && c.board === boardId);
  if (!targetColumn) return { status: 'column_not_found' };

  const previousColumnId = task.column || null;
  const movingColumns = previousColumnId !== columnId;

  if (movingColumns && targetColumn.wipLimit) {
    const currentCount = data.tasks.filter((t) => t.column === targetColumn._id).length;
    if (currentCount >= targetColumn.wipLimit) {
      return { status: 'wip_limit', columnName: targetColumn.name, wipLimit: targetColumn.wipLimit };
    }
  }

  if (movingColumns && previousColumnId) {
    const sourceSiblings = data.tasks
      .filter((t) => t.column === previousColumnId && t._id !== taskId)
      .sort((a, b) => a.position - b.position);
    sourceSiblings.forEach((sibling, index) => {
      sibling.position = index;
    });
  }

  const destinationSiblings = data.tasks
    .filter((t) => t.column === targetColumn._id && t._id !== taskId)
    .sort((a, b) => a.position - b.position);

  const clampedPosition = Math.max(0, Math.min(position, destinationSiblings.length));
  destinationSiblings.splice(clampedPosition, 0, task);
  destinationSiblings.forEach((sibling, index) => {
    if (sibling._id !== taskId) sibling.position = index;
  });

  task.board = boardId;
  task.column = targetColumn._id;
  task.position = clampedPosition;
  task.updatedAt = nowIso();

  persist();
  return { status: 'ok', task, previousColumnId };
};
