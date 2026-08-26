process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'taskflow-test-secret';
process.env.JWT_EXPIRES_IN = '1h';

const bcrypt = require('bcryptjs');
const http = require('http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const os = require('os');
const path = require('path');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../src/app');
const User = require('../src/models/User');
const Board = require('../src/models/Board');
const Column = require('../src/models/Column');
const Task = require('../src/models/Task');
const { initSocket } = require('../src/config/socket');

let mongoServer;
let io;
let userCounter = 0;

const createUser = async (role = 'user') => {
  userCounter += 1;
  return User.create({
    name: `${role} ${userCounter}`,
    email: `${role}${userCounter}@example.com`,
    password: await bcrypt.hash('password123', 10),
    role
  });
};

const tokenFor = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

const asUser = (user) => `Bearer ${tokenFor(user)}`;

const createBoardWithColumns = async (owner) => {
  const response = await request(app)
    .post('/api/v1/boards')
    .set('Authorization', asUser(owner))
    .send({ name: 'Sprint Board', description: 'Test board' })
    .expect(201);

  return {
    board: response.body.data.board,
    columns: response.body.data.columns
  };
};

beforeAll(async () => {
  io = initSocket(http.createServer(app));
  mongoServer = await MongoMemoryServer.create({
    binary: {
      downloadDir: path.join(os.tmpdir(), 'taskflow-mongodb-binaries')
    }
  });
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 1) return;

  await Promise.all([
    User.deleteMany({}),
    Board.deleteMany({}),
    Column.deleteMany({}),
    Task.deleteMany({})
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
  if (io) io.close();
});

describe('board CRUD', () => {
  test('creates a board with 3 default columns and lists it for the owner', async () => {
    const owner = await createUser();
    const { board, columns } = await createBoardWithColumns(owner);

    expect(board.name).toBe('Sprint Board');
    expect(columns.map((c) => c.name)).toEqual(['To Do', 'In Progress', 'Completed']);
    expect(columns.map((c) => c.order)).toEqual([0, 1, 2]);

    const listResponse = await request(app)
      .get('/api/v1/boards')
      .set('Authorization', asUser(owner))
      .expect(200);

    expect(listResponse.body.data.boards).toHaveLength(1);
  });

  test('blocks non-members from reading a board while allowing admins', async () => {
    const owner = await createUser();
    const outsider = await createUser();
    const admin = await createUser('admin');
    const { board } = await createBoardWithColumns(owner);

    await request(app)
      .get(`/api/v1/boards/${board._id}`)
      .set('Authorization', asUser(outsider))
      .expect(403);

    await request(app)
      .get(`/api/v1/boards/${board._id}`)
      .set('Authorization', asUser(admin))
      .expect(200);
  });

  test('rejects deleting a board that still has tasks, allows it once empty', async () => {
    const owner = await createUser();
    const { board, columns } = await createBoardWithColumns(owner);
    const task = await Task.create({
      title: 'Blocking task',
      owner: owner._id,
      board: board._id,
      column: columns[0]._id,
      position: 0
    });

    await request(app)
      .delete(`/api/v1/boards/${board._id}`)
      .set('Authorization', asUser(owner))
      .expect(400);

    await Task.deleteOne({ _id: task._id });

    await request(app)
      .delete(`/api/v1/boards/${board._id}`)
      .set('Authorization', asUser(owner))
      .expect(200);
  });
});

describe('board membership', () => {
  test('owner can add a member by email, change their role, and remove them', async () => {
    const owner = await createUser();
    const member = await createUser();
    const { board } = await createBoardWithColumns(owner);

    await request(app)
      .post(`/api/v1/boards/${board._id}/members`)
      .set('Authorization', asUser(owner))
      .send({ email: member.email, role: 'viewer' })
      .expect(201);

    await request(app)
      .put(`/api/v1/boards/${board._id}/members/${member._id}`)
      .set('Authorization', asUser(owner))
      .send({ role: 'editor' })
      .expect(200);

    const updated = await Board.findById(board._id);
    expect(updated.members.find((m) => m.user.toString() === member._id.toString()).role).toBe('editor');

    await request(app)
      .delete(`/api/v1/boards/${board._id}/members/${member._id}`)
      .set('Authorization', asUser(owner))
      .expect(200);

    const afterRemoval = await Board.findById(board._id);
    expect(afterRemoval.members).toHaveLength(1);
  });

  test('rejects membership changes from a non-owner and protects the founding owner', async () => {
    const owner = await createUser();
    const editor = await createUser();
    const outsider = await createUser();
    const { board } = await createBoardWithColumns(owner);

    await request(app)
      .post(`/api/v1/boards/${board._id}/members`)
      .set('Authorization', asUser(owner))
      .send({ email: editor.email, role: 'editor' })
      .expect(201);

    // An editor is a member but not an owner, so membership management stays forbidden.
    await request(app)
      .post(`/api/v1/boards/${board._id}/members`)
      .set('Authorization', asUser(editor))
      .send({ email: outsider.email, role: 'viewer' })
      .expect(403);

    await request(app)
      .delete(`/api/v1/boards/${board._id}/members/${owner._id}`)
      .set('Authorization', asUser(owner))
      .expect(400);
  });
});

describe('column CRUD and reordering', () => {
  test('adds a column at the end, reorders columns, and rejects deleting a non-empty one', async () => {
    const owner = await createUser();
    const { board, columns } = await createBoardWithColumns(owner);

    const createResponse = await request(app)
      .post(`/api/v1/boards/${board._id}/columns`)
      .set('Authorization', asUser(owner))
      .send({ name: 'Blocked', wipLimit: 2 })
      .expect(201);

    expect(createResponse.body.data.column.order).toBe(3);

    const allColumnIds = [...columns.map((c) => c._id), createResponse.body.data.column._id];
    const reversedIds = [...allColumnIds].reverse();

    const reorderResponse = await request(app)
      .put(`/api/v1/boards/${board._id}/columns/reorder`)
      .set('Authorization', asUser(owner))
      .send({ orderedColumnIds: reversedIds })
      .expect(200);

    expect(reorderResponse.body.data.columns.map((c) => c._id)).toEqual(reversedIds);

    await Task.create({
      title: 'Occupant',
      owner: owner._id,
      board: board._id,
      column: columns[0]._id,
      position: 0
    });

    await request(app)
      .delete(`/api/v1/boards/${board._id}/columns/${columns[0]._id}`)
      .set('Authorization', asUser(owner))
      .expect(400);
  });

  test('viewers cannot create or reorder columns', async () => {
    const owner = await createUser();
    const viewer = await createUser();
    const { board } = await createBoardWithColumns(owner);

    await request(app)
      .post(`/api/v1/boards/${board._id}/members`)
      .set('Authorization', asUser(owner))
      .send({ email: viewer.email, role: 'viewer' })
      .expect(201);

    await request(app)
      .post(`/api/v1/boards/${board._id}/columns`)
      .set('Authorization', asUser(viewer))
      .send({ name: 'Should fail' })
      .expect(403);
  });
});

describe('moving tasks between columns', () => {
  test('moves a task into a new column and renumbers siblings on both ends', async () => {
    const owner = await createUser();
    const { board, columns } = await createBoardWithColumns(owner);
    const [todo, inProgress] = columns;

    const [taskA, taskB, taskC] = await Task.create([
      { title: 'A', owner: owner._id, board: board._id, column: todo._id, position: 0 },
      { title: 'B', owner: owner._id, board: board._id, column: todo._id, position: 1 },
      { title: 'C', owner: owner._id, board: board._id, column: inProgress._id, position: 0 }
    ]);

    await request(app)
      .put(`/api/v1/boards/${board._id}/tasks/${taskA._id}/move`)
      .set('Authorization', asUser(owner))
      .send({ columnId: inProgress._id.toString(), position: 0 })
      .expect(200);

    const refreshedB = await Task.findById(taskB._id);
    expect(refreshedB.position).toBe(0);

    const refreshedA = await Task.findById(taskA._id);
    expect(refreshedA.column.toString()).toBe(inProgress._id.toString());
    expect(refreshedA.position).toBe(0);

    const refreshedC = await Task.findById(taskC._id);
    expect(refreshedC.position).toBe(1);
  });

  test('rejects a move once the target column is at its WIP limit', async () => {
    const owner = await createUser();
    const { board, columns } = await createBoardWithColumns(owner);
    const [todo] = columns;

    await request(app)
      .put(`/api/v1/boards/${board._id}/columns/${columns[1]._id}`)
      .set('Authorization', asUser(owner))
      .send({ wipLimit: 1 })
      .expect(200);

    await Task.create({
      title: 'Already in progress',
      owner: owner._id,
      board: board._id,
      column: columns[1]._id,
      position: 0
    });

    const task = await Task.create({
      title: 'Wants to move',
      owner: owner._id,
      board: board._id,
      column: todo._id,
      position: 0
    });

    await request(app)
      .put(`/api/v1/boards/${board._id}/tasks/${task._id}/move`)
      .set('Authorization', asUser(owner))
      .send({ columnId: columns[1]._id.toString(), position: 0 })
      .expect(400);
  });

  test('viewers cannot move tasks, and cross-board moves are rejected', async () => {
    const owner = await createUser();
    const viewer = await createUser();
    const { board: boardA, columns: columnsA } = await createBoardWithColumns(owner);
    const { board: boardB } = await createBoardWithColumns(owner);

    await request(app)
      .post(`/api/v1/boards/${boardA._id}/members`)
      .set('Authorization', asUser(owner))
      .send({ email: viewer.email, role: 'viewer' })
      .expect(201);

    const task = await Task.create({
      title: 'Task on board A',
      owner: owner._id,
      board: boardA._id,
      column: columnsA[0]._id,
      position: 0
    });

    await request(app)
      .put(`/api/v1/boards/${boardA._id}/tasks/${task._id}/move`)
      .set('Authorization', asUser(viewer))
      .send({ columnId: columnsA[1]._id.toString(), position: 0 })
      .expect(403);

    await request(app)
      .put(`/api/v1/boards/${boardB._id}/tasks/${task._id}/move`)
      .set('Authorization', asUser(owner))
      .send({ columnId: columnsA[1]._id.toString(), position: 0 })
      .expect(400);
  });
});
