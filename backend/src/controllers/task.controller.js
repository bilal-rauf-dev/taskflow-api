const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const { getIO } = require('../config/socket');

const canAccessTask = (task, user) => {
  if (user.role === 'admin') {
    return true;
  }

  return task.owner.toString() === user.id;
};

const getTasks = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { owner: req.user.id };
    const tasks = await Task.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { tasks },
      message: 'Tasks fetched successfully'
    });
  } catch (error) {
    return next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      owner: req.user.id
    });

    // Log Activity
    await ActivityLog.create({
      task: task._id,
      user: req.user.id,
      action: 'task_created',
      details: { newValue: title }
    });

    // Broadcast update
    try {
      const io = getIO();
      io.emit('task_created', task);
    } catch (socketErr) {
      console.error('Socket task_created emit failed:', socketErr.message);
    }

    return res.status(201).json({
      success: true,
      data: { task },
      message: 'Task created successfully'
    });
  } catch (error) {
    return next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
        errors: ['Task with provided id does not exist']
      });
    }

    if (!canAccessTask(task, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        errors: ['You are not allowed to view this task']
      });
    }

    return res.status(200).json({
      success: true,
      data: { task },
      message: 'Task fetched successfully'
    });
  } catch (error) {
    return next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
        errors: ['Task with provided id does not exist']
      });
    }

    if (!canAccessTask(task, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        errors: ['You are not allowed to update this task']
      });
    }

    const allowedFields = ['title', 'description', 'status', 'priority'];
    if (req.body.dueDate !== undefined) {
      allowedFields.push('dueDate');
    }

    const changes = [];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        let oldValue = task[field];
        let newValue = req.body[field];

        // Format dates for comparison if necessary
        if (field === 'dueDate') {
          oldValue = oldValue ? new Date(oldValue).toISOString() : null;
          newValue = newValue ? new Date(newValue).toISOString() : null;
        }

        if (oldValue !== newValue) {
          changes.push({
            field,
            oldValue: task[field],
            newValue: req.body[field]
          });
          task[field] = req.body[field];
        }
      }
    });

    await task.save();

    // Log activities for each changed field that needs auditing
    for (const change of changes) {
      let action = null;
      if (change.field === 'status') action = 'status_changed';
      else if (change.field === 'priority') action = 'priority_changed';
      else if (change.field === 'dueDate') action = 'dueDate_changed';

      if (action) {
        await ActivityLog.create({
          task: task._id,
          user: req.user.id,
          action,
          details: {
            oldValue: change.oldValue,
            newValue: change.newValue
          }
        });
      }
    }

    // Emit real-time task update to current users watching the board/modal
    try {
      const io = getIO();
      // Emit to task modal room
      io.to(`task_${task._id}`).emit('task_updated', task);
      // Emit to all users for board/list update
      io.emit('task_updated', task);
    } catch (socketErr) {
      console.error('Socket task_updated emit failed:', socketErr.message);
    }

    return res.status(200).json({
      success: true,
      data: { task },
      message: 'Task updated successfully'
    });
  } catch (error) {
    return next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
        errors: ['Task with provided id does not exist']
      });
    }

    if (!canAccessTask(task, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        errors: ['You are not allowed to delete this task']
      });
    }

    await task.deleteOne();

    return res.status(200).json({
      success: true,
      data: { taskId: req.params.id },
      message: 'Task deleted successfully'
    });
  } catch (error) {
    return next(error);
  }
};

const getAllTasksForAdmin = async (req, res, next) => {
  try {
    const tasks = await Task.find({})
      .populate('owner', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { tasks },
      message: 'All tasks fetched successfully for admin'
    });
  } catch (error) {
    return next(error);
  }
};

const getTaskActivity = async (req, res, next) => {
  try {
    const { id: taskId } = req.params;
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
        errors: ['You are not allowed to view this task activity']
      });
    }

    const activity = await ActivityLog.find({ task: taskId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { activity },
      message: 'Task activity fetched successfully'
    });
  } catch (error) {
    return next(error);
  }
};

const getSmartSortedTasks = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { owner: req.user.id };
    const tasks = await Task.find(query);

    const sorted = tasks
      .map((task) => {
        if (task.status === 'completed') {
          return { task, score: -9999 }; // Completed tasks go to the bottom
        }

        const priorityWeight = { high: 3, medium: 2, low: 1 }[task.priority] || 1;
        let daysRemaining = 7; // Default baseline if no due date

        if (task.dueDate) {
          const diffTime = new Date(task.dueDate) - new Date();
          daysRemaining = diffTime / (1000 * 60 * 60 * 24);
          if (daysRemaining < 0) daysRemaining = 0.1; // Overdue tasks get highest rank
        }

        const score = priorityWeight * 10 - daysRemaining * 5;
        return { task, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((item) => item.task);

    return res.status(200).json({
      success: true,
      data: { tasks: sorted },
      message: 'Tasks smart-sorted successfully'
    });
  } catch (error) {
    return next(error);
  }
};

const logTimeSpent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { durationSeconds } = req.body;

    const task = await Task.findById(id);
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
        errors: ['You are not allowed to log time on this task']
      });
    }

    task.timeLog.push({ durationSeconds });
    await task.save();

    return res.status(200).json({
      success: true,
      data: { task },
      message: 'Focus session logged successfully'
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  getAllTasksForAdmin,
  getTaskActivity,
  getSmartSortedTasks,
  logTimeSpent
};
