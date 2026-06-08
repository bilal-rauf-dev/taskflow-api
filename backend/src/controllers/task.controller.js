const Task = require('../models/Task');

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
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();

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

module.exports = {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  getAllTasksForAdmin
};
