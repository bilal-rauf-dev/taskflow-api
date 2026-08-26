const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const { getIO, userRoom, taskRoom } = require('../config/socket');
const { canAccessTask } = require('../utils/taskAccess');

// Add comment to a task
const addComment = async (req, res, next) => {
  try {
    const { id: taskId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (!canAccessTask(task, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        errors: ['You are not allowed to comment on this task']
      });
    }

    const comment = await Comment.create({
      task: taskId,
      author: userId,
      content
    });

    await comment.populate('author', 'name email');

    // 1. Log Activity
    await ActivityLog.create({
      task: taskId,
      user: userId,
      action: 'comment_added',
      details: { newValue: content }
    });

    // 2. Alert Task Owner (if commenter is not owner)
    if (task.owner.toString() !== userId) {
      const notification = await Notification.create({
        recipient: task.owner,
        sender: userId,
        type: 'comment_added',
        task: taskId
      });
      
      // Populate notification before sending
      await notification.populate('sender', 'name');
      await notification.populate('task', 'title');

      // Push real-time notification to the owner
      try {
        const io = getIO();
        io.to(userRoom(task.owner)).emit('new_notification', notification);
      } catch (ioErr) {
        console.error('Socket notification emit failed:', ioErr.message);
      }
    }

    // 3. Emit real-time comment to other users in the task room
    try {
      const io = getIO();
      io.to(taskRoom(taskId)).emit('comment_received', comment);
    } catch (ioErr) {
      console.error('Socket comment emit failed:', ioErr.message);
    }

    return res.status(201).json({
      success: true,
      data: { comment },
      message: 'Comment added successfully'
    });
  } catch (error) {
    return next(error);
  }
};

// Get comments for a task
const getComments = async (req, res, next) => {
  try {
    const { id: taskId } = req.params;

    const task = await Task.findById(taskId).select('owner assignees');
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (!canAccessTask(task, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        errors: ['You are not allowed to view comments on this task']
      });
    }

    const comments = await Comment.find({ task: taskId })
      .populate('author', 'name email')
      .sort({ createdAt: 1 }); // Oldest first

    return res.status(200).json({
      success: true,
      data: { comments },
      message: 'Comments fetched successfully'
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  addComment,
  getComments
};
