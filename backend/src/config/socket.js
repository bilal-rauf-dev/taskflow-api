const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // Join a room for personal notifications
    socket.on('join_user_room', (userId) => {
      socket.join(userId);
    });

    // Join a task room for collaborative comments and real-time updates
    socket.on('join_task_room', (taskId) => {
      socket.join(`task_${taskId}`);
    });

    socket.on('leave_task_room', (taskId) => {
      socket.leave(`task_${taskId}`);
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

module.exports = { initSocket, getIO };
