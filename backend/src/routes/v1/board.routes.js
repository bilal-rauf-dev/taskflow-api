const express = require('express');
const authenticate = require('../../middleware/auth');
const {
  createBoard,
  getBoards,
  getBoardById,
  getBoardTasks,
  updateBoard,
  deleteBoard,
  addMember,
  changeMemberRole,
  removeMember
} = require('../../controllers/board.controller');
const {
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns
} = require('../../controllers/column.controller');
const { moveTask } = require('../../controllers/task.controller');
const {
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
} = require('../../validators/board.validator');

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   - name: Boards
 *     description: Kanban board, column, and membership management
 */

/**
 * @swagger
 * /api/v1/boards:
 *   get:
 *     summary: Get boards the current user is a member of (or all boards for admin)
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Boards fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', getBoards);

/**
 * @swagger
 * /api/v1/boards:
 *   post:
 *     summary: Create a new board with default To Do / In Progress / Completed columns
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Product Launch
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Board created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 */
router.post('/', createBoardValidation, createBoard);

/**
 * @swagger
 * /api/v1/boards/{boardId}:
 *   get:
 *     summary: Get a single board with its columns
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board fetched successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Board not found
 */
router.get('/:boardId', boardIdValidation, getBoardById);

/**
 * @swagger
 * /api/v1/boards/{boardId}:
 *   put:
 *     summary: Update a board's name or description
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Board not found
 */
router.put('/:boardId', updateBoardValidation, updateBoard);

/**
 * @swagger
 * /api/v1/boards/{boardId}:
 *   delete:
 *     summary: Delete an empty board (owner only)
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board deleted successfully
 *       400:
 *         description: Board still has tasks on it
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Board not found
 */
router.delete('/:boardId', boardIdValidation, deleteBoard);

/**
 * @swagger
 * /api/v1/boards/{boardId}/tasks:
 *   get:
 *     summary: Get all tasks placed on a board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board tasks fetched successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Board not found
 */
router.get('/:boardId/tasks', boardIdValidation, getBoardTasks);

/**
 * @swagger
 * /api/v1/boards/{boardId}/tasks/{taskId}/move:
 *   put:
 *     summary: Move a task to a column and position on this board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [columnId, position]
 *             properties:
 *               columnId:
 *                 type: string
 *               position:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Task moved successfully
 *       400:
 *         description: Validation failed, cross-board move, or WIP limit reached
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Board, task, or column not found
 */
router.put('/:boardId/tasks/:taskId/move', moveTaskValidation, moveTask);

/**
 * @swagger
 * /api/v1/boards/{boardId}/members:
 *   post:
 *     summary: Add a member to a board by email or user id (owner only)
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               email:
 *                 type: string
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [editor, viewer]
 *     responses:
 *       201:
 *         description: Member added successfully
 *       400:
 *         description: Validation failed or user already a member
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Board or user not found
 */
router.post('/:boardId/members', addMemberValidation, addMember);

/**
 * @swagger
 * /api/v1/boards/{boardId}/members/{userId}:
 *   put:
 *     summary: Change a board member's role (owner only)
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member role updated successfully
 *       400:
 *         description: Validation failed
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Board or member not found
 */
router.put('/:boardId/members/:userId', memberRoleValidation, changeMemberRole);

/**
 * @swagger
 * /api/v1/boards/{boardId}/members/{userId}:
 *   delete:
 *     summary: Remove a member from a board (owner only)
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       400:
 *         description: Cannot remove the founding owner
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Board or member not found
 */
router.delete('/:boardId/members/:userId', memberIdValidation, removeMember);

/**
 * @swagger
 * /api/v1/boards/{boardId}/columns:
 *   post:
 *     summary: Add a column to a board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               wipLimit:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Column created successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Board not found
 */
router.post('/:boardId/columns', createColumnValidation, createColumn);

/**
 * @swagger
 * /api/v1/boards/{boardId}/columns/reorder:
 *   put:
 *     summary: Reorder all columns on a board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderedColumnIds]
 *             properties:
 *               orderedColumnIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Columns reordered successfully
 *       400:
 *         description: orderedColumnIds does not match the board's columns
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Board not found
 */
router.put('/:boardId/columns/reorder', reorderColumnsValidation, reorderColumns);

/**
 * @swagger
 * /api/v1/boards/{boardId}/columns/{columnId}:
 *   put:
 *     summary: Rename a column or change its WIP limit
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: columnId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Column updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Board or column not found
 */
router.put('/:boardId/columns/:columnId', updateColumnValidation, updateColumn);

/**
 * @swagger
 * /api/v1/boards/{boardId}/columns/{columnId}:
 *   delete:
 *     summary: Delete an empty column
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: columnId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Column deleted successfully
 *       400:
 *         description: Column still has tasks on it
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Board or column not found
 */
router.delete('/:boardId/columns/:columnId', columnIdValidation, deleteColumn);

module.exports = router;
