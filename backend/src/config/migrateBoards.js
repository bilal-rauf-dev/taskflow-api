const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./db');
const User = require('../models/User');
const Task = require('../models/Task');
const Board = require('../models/Board');
const Column = require('../models/Column');

dotenv.config();

// One-time backfill: gives every existing user a personal default board with
// 3 columns mirroring the old status values, then places their existing
// tasks into the matching column. Safe to re-run — already-migrated boards,
// columns, and tasks are detected and skipped.
const DEFAULT_COLUMNS = [
  { name: 'To Do', order: 0, status: 'pending' },
  { name: 'In Progress', order: 1, status: 'in-progress' },
  { name: 'Completed', order: 2, status: 'completed' }
];

const ensureDefaultBoard = async (user) => {
  let board = await Board.findOne({ owner: user._id, isDefault: true });

  if (!board) {
    board = await Board.create({
      name: 'Personal Board',
      description: 'Default board created automatically to hold your existing tasks.',
      owner: user._id,
      members: [{ user: user._id, role: 'owner' }],
      isDefault: true
    });
    console.log(`Created default board for ${user.email}`);
  }

  return board;
};

const ensureDefaultColumns = async (board) => {
  const existing = await Column.find({ board: board._id }).sort({ order: 1 });
  if (existing.length > 0) {
    return existing;
  }

  const columns = await Column.insertMany(
    DEFAULT_COLUMNS.map(({ name, order }) => ({ board: board._id, name, order }))
  );
  console.log(`Created ${columns.length} default columns for board "${board.name}"`);
  return columns;
};

const backfillTasks = async (user, board, columns) => {
  const columnByStatus = DEFAULT_COLUMNS.reduce((acc, { status }, index) => {
    acc[status] = columns[index];
    return acc;
  }, {});

  const positionCounters = {};
  for (const column of columns) {
    positionCounters[column._id.toString()] = await Task.countDocuments({ column: column._id });
  }

  const unmigratedTasks = await Task.find({ owner: user._id, board: null }).sort({ createdAt: 1 });

  for (const task of unmigratedTasks) {
    const column = columnByStatus[task.status] || columns[0];
    const key = column._id.toString();

    task.board = board._id;
    task.column = column._id;
    task.position = positionCounters[key];
    positionCounters[key] += 1;

    await task.save();
  }

  if (unmigratedTasks.length > 0) {
    console.log(`Backfilled ${unmigratedTasks.length} task(s) for ${user.email}`);
  }

  return unmigratedTasks.length;
};

const migrate = async () => {
  try {
    await connectDB();

    const users = await User.find({});
    let totalTasksMigrated = 0;

    for (const user of users) {
      const board = await ensureDefaultBoard(user);
      const columns = await ensureDefaultColumns(board);
      totalTasksMigrated += await backfillTasks(user, board, columns);
    }

    console.log(
      `Migration complete. ${users.length} user(s) processed, ${totalTasksMigrated} task(s) backfilled.`
    );
  } catch (error) {
    console.error('Board migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

migrate();
