import * as store from './guestStore';
import { GUEST_TOKEN, createGuestUser } from './guestSession';

// A custom axios adapter (see api/axios.js) that stands in for the network
// when the app is running in Guest Mode. It reads the same method+URL+body
// every page already sends via the shared `api` instance and resolves with
// a response shaped exactly like the real backend's - { success, data,
// message } - so no page needs to know its data came from localStorage
// instead of a server. Route handlers below mirror the corresponding
// backend/src/controllers/*.js files as closely as practical.

const GUEST_UNAVAILABLE_MESSAGE = 'This needs a real account - create one from Settings to unlock it.';

const ok = (config, data, message, status = 200) =>
  Promise.resolve({
    data: { success: true, data, message },
    status,
    statusText: 'OK',
    headers: {},
    config,
    request: {}
  });

const fail = (config, status, message, errors) => {
  const error = new Error(message);
  error.isAxiosError = true;
  error.config = config;
  error.response = {
    data: { success: false, message, errors: errors || [message] },
    status,
    statusText: status === 404 ? 'Not Found' : status === 403 ? 'Forbidden' : 'Bad Request',
    headers: {},
    config
  };
  return Promise.reject(error);
};

const parseBody = (config) => {
  if (!config.data) return {};
  if (typeof config.data === 'string') {
    try {
      return JSON.parse(config.data);
    } catch {
      return {};
    }
  }
  return config.data;
};

// Every route param capture group is named so handlers can destructure by
// name instead of guessing array positions.
const routes = [
  // ---- Tasks --------------------------------------------------------------
  { method: 'get', pattern: /^\/tasks$/, handler: (config) => ok(config, { tasks: store.listTasks() }, 'Tasks fetched successfully') },
  {
    method: 'post',
    pattern: /^\/tasks$/,
    handler: (config) => {
      const body = parseBody(config);
      if (!body.title || !body.title.trim()) {
        return fail(config, 400, 'Validation failed', ['Title is required']);
      }
      const task = store.createTask(body);
      return ok(config, { task }, 'Task created successfully', 201);
    }
  },
  {
    method: 'get',
    pattern: /^\/tasks\/smart\/suggest$/,
    handler: (config) => ok(config, { tasks: store.getSmartSortedTasks() }, 'Tasks smart-sorted successfully')
  },
  {
    method: 'get',
    pattern: /^\/tasks\/(?<id>[^/]+)$/,
    handler: (config, params) => {
      const task = store.getTask(params.id);
      if (!task) return fail(config, 404, 'Task not found', ['Task with provided id does not exist']);
      return ok(config, { task }, 'Task fetched successfully');
    }
  },
  {
    method: 'put',
    pattern: /^\/tasks\/(?<id>[^/]+)$/,
    handler: (config, params) => {
      const task = store.updateTask(params.id, parseBody(config));
      if (!task) return fail(config, 404, 'Task not found', ['Task with provided id does not exist']);
      return ok(config, { task }, 'Task updated successfully');
    }
  },
  {
    method: 'delete',
    pattern: /^\/tasks\/(?<id>[^/]+)$/,
    handler: (config, params) => {
      const existed = store.deleteTask(params.id);
      if (!existed) return fail(config, 404, 'Task not found', ['Task with provided id does not exist']);
      return ok(config, { taskId: params.id }, 'Task deleted successfully');
    }
  },
  {
    method: 'get',
    pattern: /^\/tasks\/(?<id>[^/]+)\/comments$/,
    handler: (config, params) => ok(config, { comments: store.listComments(params.id) }, 'Comments fetched successfully')
  },
  {
    method: 'post',
    pattern: /^\/tasks\/(?<id>[^/]+)\/comments$/,
    handler: (config, params) => {
      const { content } = parseBody(config);
      if (!content || !content.trim()) {
        return fail(config, 400, 'Validation failed', ['Comment content is required']);
      }
      const comment = store.addComment(params.id, content);
      return ok(config, { comment }, 'Comment added successfully', 201);
    }
  },
  {
    method: 'get',
    pattern: /^\/tasks\/(?<id>[^/]+)\/activity$/,
    handler: (config, params) => ok(config, { activity: store.listActivity(params.id) }, 'Task activity fetched successfully')
  },
  {
    method: 'post',
    pattern: /^\/tasks\/(?<id>[^/]+)\/time-log$/,
    handler: (config, params) => {
      const { durationSeconds } = parseBody(config);
      const task = store.logTimeSpent(params.id, durationSeconds);
      if (!task) return fail(config, 404, 'Task not found', ['Task with provided id does not exist']);
      return ok(config, { task }, 'Focus session logged successfully');
    }
  },

  // ---- Boards ---------------------------------------------------------------
  { method: 'get', pattern: /^\/boards$/, handler: (config) => ok(config, { boards: store.listBoards() }, 'Boards fetched successfully') },
  {
    method: 'post',
    pattern: /^\/boards$/,
    handler: (config) => {
      const body = parseBody(config);
      if (!body.name || !body.name.trim()) {
        return fail(config, 400, 'Validation failed', ['Board name is required']);
      }
      const { board, columns } = store.createBoard(body);
      return ok(config, { board, columns }, 'Board created successfully', 201);
    }
  },
  {
    method: 'get',
    pattern: /^\/boards\/(?<boardId>[^/]+)$/,
    handler: (config, params) => {
      const board = store.getBoard(params.boardId);
      if (!board) return fail(config, 404, 'Board not found', ['Board with provided id does not exist']);
      return ok(config, { board, columns: store.listColumns(params.boardId) }, 'Board fetched successfully');
    }
  },
  {
    method: 'put',
    pattern: /^\/boards\/(?<boardId>[^/]+)$/,
    handler: (config, params) => {
      const board = store.updateBoard(params.boardId, parseBody(config));
      if (!board) return fail(config, 404, 'Board not found', ['Board with provided id does not exist']);
      return ok(config, { board }, 'Board updated successfully');
    }
  },
  {
    method: 'delete',
    pattern: /^\/boards\/(?<boardId>[^/]+)$/,
    handler: (config, params) => {
      const result = store.deleteBoard(params.boardId);
      if (result.status === 'not_found') return fail(config, 404, 'Board not found', ['Board with provided id does not exist']);
      if (result.status === 'not_empty') {
        return fail(config, 400, 'Board is not empty', ['Move or delete all tasks on this board before deleting it']);
      }
      return ok(config, { boardId: params.boardId }, 'Board deleted successfully');
    }
  },
  {
    method: 'get',
    pattern: /^\/boards\/(?<boardId>[^/]+)\/tasks$/,
    handler: (config, params) => ok(config, { tasks: store.listBoardTasks(params.boardId) }, 'Board tasks fetched successfully')
  },
  {
    method: 'put',
    pattern: /^\/boards\/(?<boardId>[^/]+)\/tasks\/(?<taskId>[^/]+)\/move$/,
    handler: (config, params) => {
      const { columnId, position } = parseBody(config);
      const result = store.moveTask(params.boardId, params.taskId, { columnId, position });

      if (result.status === 'board_not_found') return fail(config, 404, 'Board not found', ['Board with provided id does not exist']);
      if (result.status === 'task_not_found') return fail(config, 404, 'Task not found', ['Task with provided id does not exist']);
      if (result.status === 'wrong_board') return fail(config, 400, 'Task belongs to a different board', ['Cannot move a task across boards']);
      if (result.status === 'column_not_found') {
        return fail(config, 404, 'Column not found', ['Column with provided id does not exist on this board']);
      }
      if (result.status === 'wip_limit') {
        return fail(config, 400, 'WIP limit reached', [
          `Column "${result.columnName}" is at its WIP limit of ${result.wipLimit}`
        ]);
      }

      return ok(config, { task: result.task, previousColumnId: result.previousColumnId }, 'Task moved successfully');
    }
  },
  {
    method: 'post',
    pattern: /^\/boards\/(?<boardId>[^/]+)\/members$/,
    handler: (config) => fail(config, 403, GUEST_UNAVAILABLE_MESSAGE, [GUEST_UNAVAILABLE_MESSAGE])
  },
  {
    method: 'put',
    pattern: /^\/boards\/(?<boardId>[^/]+)\/members\/(?<userId>[^/]+)$/,
    handler: (config) => fail(config, 403, GUEST_UNAVAILABLE_MESSAGE, [GUEST_UNAVAILABLE_MESSAGE])
  },
  {
    method: 'delete',
    pattern: /^\/boards\/(?<boardId>[^/]+)\/members\/(?<userId>[^/]+)$/,
    handler: (config) => fail(config, 403, GUEST_UNAVAILABLE_MESSAGE, [GUEST_UNAVAILABLE_MESSAGE])
  },
  {
    method: 'post',
    pattern: /^\/boards\/(?<boardId>[^/]+)\/columns$/,
    handler: (config, params) => {
      const body = parseBody(config);
      if (!body.name || !body.name.trim()) {
        return fail(config, 400, 'Validation failed', ['Column name is required']);
      }
      const column = store.createColumn(params.boardId, body);
      return ok(config, { column }, 'Column created successfully', 201);
    }
  },
  {
    method: 'put',
    pattern: /^\/boards\/(?<boardId>[^/]+)\/columns\/reorder$/,
    handler: (config, params) => {
      const { orderedColumnIds } = parseBody(config);
      const result = store.reorderColumns(params.boardId, orderedColumnIds || []);
      if (result.status === 'invalid') {
        return fail(config, 400, 'Invalid column set', ['orderedColumnIds must include every column on this board exactly once']);
      }
      return ok(config, { columns: result.columns }, 'Columns reordered successfully');
    }
  },
  {
    method: 'put',
    pattern: /^\/boards\/(?<boardId>[^/]+)\/columns\/(?<columnId>[^/]+)$/,
    handler: (config, params) => {
      const column = store.updateColumn(params.boardId, params.columnId, parseBody(config));
      if (!column) return fail(config, 404, 'Column not found', ['Column with provided id does not exist on this board']);
      return ok(config, { column }, 'Column updated successfully');
    }
  },
  {
    method: 'delete',
    pattern: /^\/boards\/(?<boardId>[^/]+)\/columns\/(?<columnId>[^/]+)$/,
    handler: (config, params) => {
      const result = store.deleteColumn(params.boardId, params.columnId);
      if (result.status === 'not_found') {
        return fail(config, 404, 'Column not found', ['Column with provided id does not exist on this board']);
      }
      if (result.status === 'not_empty') {
        return fail(config, 400, 'Column is not empty', ['Move or delete tasks in this column before deleting it']);
      }
      return ok(config, { columnId: params.columnId }, 'Column deleted successfully');
    }
  },

  // ---- Notifications (a solo local guest has no one to be notified by) ----
  { method: 'get', pattern: /^\/notifications$/, handler: (config) => ok(config, { notifications: [] }, 'Notifications fetched successfully') },
  { method: 'put', pattern: /^\/notifications\/read-all$/, handler: (config) => ok(config, {}, 'All notifications marked as read') },
  {
    method: 'put',
    pattern: /^\/notifications\/(?<id>[^/]+)\/read$/,
    handler: (config) => fail(config, 404, 'Notification not found', ['Notification not found'])
  },

  // ---- Auth (profile display-name only - Guest Mode has no credentials) ---
  {
    method: 'get',
    pattern: /^\/auth\/me$/,
    handler: (config) => ok(config, { user: readGuestUser() }, 'Current user fetched successfully')
  },
  {
    method: 'put',
    pattern: /^\/auth\/me$/,
    handler: (config) => {
      const { name } = parseBody(config);
      const updated = writeGuestUser({ name });
      return ok(config, { token: GUEST_TOKEN, user: updated }, 'Profile updated successfully');
    }
  }
];

// The guest "user" record is the same object AuthContext already persists
// under the shared 'user' storage key (Guest Mode always uses localStorage -
// see enterGuestMode in AuthContext.jsx), so profile edits round-trip
// through the exact same session state real accounts use.
function readGuestUser() {
  try {
    const raw = localStorage.getItem('user');
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through
  }
  return createGuestUser();
}

function writeGuestUser(patch) {
  const current = readGuestUser();
  const updated = { ...current, ...patch, name: patch.name?.trim() || current.name || 'Guest' };
  try {
    localStorage.setItem('user', JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

const matchRoute = (method, url) => {
  for (const route of routes) {
    if (route.method !== method) continue;
    const match = route.pattern.exec(url);
    if (match) return { handler: route.handler, params: match.groups || {} };
  }
  return null;
};

export function guestAdapter(config) {
  const method = (config.method || 'get').toLowerCase();
  const url = (config.url || '').split('?')[0];

  const matched = matchRoute(method, url);
  if (!matched) {
    return fail(config, 404, 'Route not found', [`Cannot ${method.toUpperCase()} ${url} in Guest Mode`]);
  }

  try {
    return matched.handler(config, matched.params);
  } catch (error) {
    return fail(config, 500, 'Guest Mode error', [error.message || 'Unexpected local error']);
  }
}
