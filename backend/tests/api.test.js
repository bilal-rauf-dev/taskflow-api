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
const Task = require('../src/models/Task');
const Comment = require('../src/models/Comment');
const Notification = require('../src/models/Notification');
const ActivityLog = require('../src/models/ActivityLog');
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

const tokenFor = (user) => jwt.sign(
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
    Task.deleteMany({}),
    Comment.deleteMany({}),
    Notification.deleteMany({}),
    ActivityLog.deleteMany({})
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
  if (io) io.close();
});

describe('authentication', () => {
  test('registers, logs in, and accepts the issued JWT', async () => {
    const registration = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Ada Lovelace', email: 'ada@example.com', password: 'password123' })
      .expect(201);

    expect(registration.body.data.token).toBeTruthy();

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ada@example.com', password: 'password123' })
      .expect(200);

    const profile = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${login.body.data.token}`)
      .expect(200);

    expect(profile.body.data.user.email).toBe('ada@example.com');
  });

  test('rejects an invalid JWT', async () => {
    await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });
});

describe('task and comment authorization', () => {
  test('blocks non-owners from accessing another user task while allowing admins', async () => {
    const owner = await createUser();
    const otherUser = await createUser();
    const admin = await createUser('admin');
    const task = await Task.create({ title: 'Private task', owner: owner._id });

    await request(app)
      .get(`/api/v1/tasks/${task._id}`)
      .set('Authorization', asUser(otherUser))
      .expect(403);

    await request(app)
      .put(`/api/v1/tasks/${task._id}`)
      .set('Authorization', asUser(otherUser))
      .send({ title: 'Attempted takeover' })
      .expect(403);

    const adminResponse = await request(app)
      .get(`/api/v1/tasks/${task._id}`)
      .set('Authorization', asUser(admin))
      .expect(200);

    expect(adminResponse.body.data.task.title).toBe('Private task');
  });

  test('allows assignees to comment, blocks outsiders, and delivers a notification to the owner', async () => {
    const owner = await createUser();
    const assignee = await createUser();
    const outsider = await createUser();
    const task = await Task.create({
      title: 'Shared task',
      owner: owner._id,
      assignees: [assignee._id]
    });

    await request(app)
      .get(`/api/v1/tasks/${task._id}/comments`)
      .set('Authorization', asUser(outsider))
      .expect(403);

    await request(app)
      .post(`/api/v1/tasks/${task._id}/comments`)
      .set('Authorization', asUser(outsider))
      .send({ content: 'I should not be able to add this.' })
      .expect(403);

    const commentResponse = await request(app)
      .post(`/api/v1/tasks/${task._id}/comments`)
      .set('Authorization', asUser(assignee))
      .send({ content: 'I can access this assigned task.' })
      .expect(201);

    expect(commentResponse.body.data.comment.content).toBe('I can access this assigned task.');

    const notifications = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', asUser(owner))
      .expect(200);

    expect(notifications.body.data.notifications).toHaveLength(1);
    expect(notifications.body.data.notifications[0].type).toBe('comment_added');

    await request(app)
      .put(`/api/v1/notifications/${notifications.body.data.notifications[0]._id}/read`)
      .set('Authorization', asUser(owner))
      .expect(200);
  });
});

describe('role enforcement', () => {
  test('restricts productivity reporting to admins', async () => {
    const user = await createUser();
    const admin = await createUser('admin');

    await request(app)
      .get('/api/v1/admin/productivity')
      .set('Authorization', asUser(user))
      .expect(403);

    const adminResponse = await request(app)
      .get('/api/v1/admin/productivity')
      .set('Authorization', asUser(admin))
      .expect(200);

    expect(adminResponse.body.success).toBe(true);
    expect(adminResponse.body.data.report).toEqual([]);
  });
});
