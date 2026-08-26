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

const boardIdValidation = [
  param('boardId').isMongoId().withMessage('Invalid board id'),
  validate
];

const createBoardValidation = [
  body('name').trim().notEmpty().withMessage('Board name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  validate
];

const updateBoardValidation = [
  param('boardId').isMongoId().withMessage('Invalid board id'),
  body('name').optional().trim().notEmpty().withMessage('Board name cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  validate
];

const createColumnValidation = [
  param('boardId').isMongoId().withMessage('Invalid board id'),
  body('name').trim().notEmpty().withMessage('Column name is required'),
  body('wipLimit')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('WIP limit must be a positive integer'),
  validate
];

const updateColumnValidation = [
  param('boardId').isMongoId().withMessage('Invalid board id'),
  param('columnId').isMongoId().withMessage('Invalid column id'),
  body('name').optional().trim().notEmpty().withMessage('Column name cannot be empty'),
  body('wipLimit')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('WIP limit must be a positive integer'),
  validate
];

const columnIdValidation = [
  param('boardId').isMongoId().withMessage('Invalid board id'),
  param('columnId').isMongoId().withMessage('Invalid column id'),
  validate
];

const reorderColumnsValidation = [
  param('boardId').isMongoId().withMessage('Invalid board id'),
  body('orderedColumnIds')
    .isArray({ min: 1 })
    .withMessage('orderedColumnIds must be a non-empty array'),
  body('orderedColumnIds.*').isMongoId().withMessage('Each column id must be valid'),
  validate
];

const moveTaskValidation = [
  param('boardId').isMongoId().withMessage('Invalid board id'),
  param('taskId').isMongoId().withMessage('Invalid task id'),
  body('columnId').isMongoId().withMessage('A valid columnId is required'),
  body('position').isInt({ min: 0 }).withMessage('Position must be a non-negative integer'),
  validate
];

const addMemberValidation = [
  param('boardId').isMongoId().withMessage('Invalid board id'),
  body('email').optional().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('userId').optional().isMongoId().withMessage('Invalid user id'),
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.userId) {
      throw new Error('Either email or userId is required');
    }
    return true;
  }),
  body('role').isIn(['editor', 'viewer']).withMessage('Role must be editor or viewer'),
  validate
];

const memberRoleValidation = [
  param('boardId').isMongoId().withMessage('Invalid board id'),
  param('userId').isMongoId().withMessage('Invalid user id'),
  body('role').isIn(['owner', 'editor', 'viewer']).withMessage('Role must be owner, editor, or viewer'),
  validate
];

const memberIdValidation = [
  param('boardId').isMongoId().withMessage('Invalid board id'),
  param('userId').isMongoId().withMessage('Invalid user id'),
  validate
];

module.exports = {
  boardIdValidation,
  createBoardValidation,
  updateBoardValidation,
  createColumnValidation,
  updateColumnValidation,
  columnIdValidation,
  reorderColumnsValidation,
  moveTaskValidation,
  addMemberValidation,
  memberRoleValidation,
  memberIdValidation
};
