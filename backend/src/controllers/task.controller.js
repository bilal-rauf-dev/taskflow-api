const Task = require('../models/Task');
const Board = require('../models/Board');
const Column = require('../models/Column');
const ActivityLog = require('../models/ActivityLog');
const { getIO, userRoom, taskRoom, adminRoom } = require('../config/socket');
const { canAccessTask, getTaskParticipantIds } = require('../utils/taskAccess');
const { canAccessBoard } = require('../utils/boardAccess');

const emitTaskEvent = (eventName, task) => {
  const io = getIO();
  const rooms = [
    ...getTaskParticipantIds(task).map(userRoom),
    taskRoom(task._id),
    adminRoom
  ];

  io.to(rooms).emit(eventName, task);
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
    const { title, description, status, priority, dueDate, assignees } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      owner: req.user.id,
      assignees: req.user.role === 'admin' && Array.isArray(assignees) ? assignees : []
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
      emitTaskEvent('task_created', task);
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
    if (req.user.role === 'admin' && req.body.assignees !== undefined) {
      allowedFields.push('assignees');
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

      // Emit only to users allowed to access this task and its active task room.
      try {
      emitTaskEvent('task_updated', task);
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

    try {
      emitTaskEvent('task_deleted', task);
    } catch (socketErr) {
      console.error('Socket task_deleted emit failed:', socketErr.message);
    }

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

const moveTask = async (req, res, next) => {
  try {
    const { boardId, taskId } = req.params;
    const { columnId, position } = req.body;

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
        errors: ['Board with provided id does not exist']
      });
    }

    if (!canAccessBoard(board, req.user, 'editor')) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        errors: ['You need editor access to move tasks on this board']
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
        errors: ['Task with provided id does not exist']
      });
    }

    if (task.board && task.board.toString() !== boardId) {
      return res.status(400).json({
        success: false,
        message: 'Task belongs to a different board',
        errors: ['Cannot move a task across boards']
      });
    }

    const targetColumn = await Column.findOne({ _id: columnId, board: boardId });
    if (!targetColumn) {
      return res.status(404).json({
        success: false,
        message: 'Column not found',
        errors: ['Column with provided id does not exist on this board']
      });
    }

    const previousColumnId = task.column ? task.column.toString() : null;
    const movingColumns = previousColumnId !== columnId;

    if (movingColumns && targetColumn.wipLimit) {
      const currentCount = await Task.countDocuments({ column: targetColumn._id });
      if (currentCount >= targetColumn.wipLimit) {
        return res.status(400).json({
          success: false,
          message: 'WIP limit reached',
          errors: [`Column "${targetColumn.name}" is at its WIP limit of ${targetColumn.wipLimit}`]
        });
      }
    }

    // Close the gap left in the source column when the task is leaving it.
    if (movingColumns && previousColumnId) {
      const sourceSiblings = await Task.find({
        column: previousColumnId,
        _id: { $ne: task._id }
      }).sort({ position: 1 });

      await Promise.all(
        sourceSiblings.map((sibling, index) => Task.updateOne({ _id: sibling._id }, { position: index }))
      );
    }

    // Insert the task into the destination column at the requested position and
    // renumber its siblings around it.
    const destinationSiblings = await Task.find({
      column: targetColumn._id,
      _id: { $ne: task._id }
    }).sort({ position: 1 });

    const clampedPosition = Math.max(0, Math.min(position, destinationSiblings.length));
    destinationSiblings.splice(clampedPosition, 0, task);

    await Promise.all(
      destinationSiblings.map((sibling, index) =>
        sibling._id.equals(task._id) ? Promise.resolve() : Task.updateOne({ _id: sibling._id }, { position: index })
      )
    );

    task.board = boardId;
    task.column = targetColumn._id;
    task.position = clampedPosition;
    await task.save();

    return res.status(200).json({
      success: true,
      data: { task, previousColumnId },
      message: 'Task moved successfully'
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
  logTimeSpent,
  moveTask
};
