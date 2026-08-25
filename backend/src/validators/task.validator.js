const { body, param, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => err.msg)
    });
  }

  return next();
};

const createTaskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .toDate()
    .withMessage('Due date must be a valid date'),
  body('assignees')
    .optional()
    .isArray()
    .withMessage('Assignees must be an array'),
  body('assignees.*')
    .optional()
    .isMongoId()
    .withMessage('Each assignee must be a valid user id'),
  validate
];

const updateTaskValidation = [
  param('id').isMongoId().withMessage('Invalid task id'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .toDate()
    .withMessage('Due date must be a valid date'),
  body('assignees')
    .optional()
    .isArray()
    .withMessage('Assignees must be an array'),
  body('assignees.*')
    .optional()
    .isMongoId()
    .withMessage('Each assignee must be a valid user id'),
  validate
];

const taskIdValidation = [
  param('id').isMongoId().withMessage('Invalid task id'),
  validate
];

module.exports = {
  createTaskValidation,
  updateTaskValidation,
  taskIdValidation
};
