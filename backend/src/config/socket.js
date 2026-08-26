const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Task = require('../models/Task');
const { canAccessTask } = require('../utils/taskAccess');

let io;

const userRoom = (userId) => `user:${userId}`;
const taskRoom = (taskId) => `task:${taskId}`;
const adminRoom = 'role:admin';

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const normalizedToken = token?.startsWith('Bearer ') ? token.slice(7) : token;

      if (!normalizedToken) {
        return next(new Error('Authentication token missing'));
      }

      const decoded = jwt.verify(normalizedToken, process.env.JWT_SECRET);
      socket.user = {
        id: decoded.id,
        role: decoded.role,
        email: decoded.email,
        name: decoded.name
      };

      return next();
    } catch (error) {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(userRoom(socket.user.id));
    if (socket.user.role === 'admin') {
      socket.join(adminRoom);
    }

    // Retained for compatibility; clients can only ever join their own user room.
    socket.on('join_user_room', () => {
      socket.join(userRoom(socket.user.id));
    });

    socket.on('join_task_room', async (taskId, callback) => {
      try {
        const task = await Task.findById(taskId).select('owner assignees');
        if (!task || !canAccessTask(task, socket.user)) {
          callback?.({ success: false, message: 'Forbidden' });
          return;
        }

        socket.join(taskRoom(taskId));
        callback?.({ success: true });
      } catch (error) {
        callback?.({ success: false, message: 'Invalid task room' });
      }
    });

    socket.on('leave_task_room', (taskId) => {
      socket.leave(taskRoom(taskId));
    });

    socket.on('disconnect', () => {
      // socket disconnect log or cleanup if necessary
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIO, userRoom, taskRoom, adminRoom };
