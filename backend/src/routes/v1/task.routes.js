const express = require('express');
const authenticate = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/role');
const {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  getAllTasksForAdmin,
  getTaskActivity,
  getSmartSortedTasks,
  logTimeSpent
} = require('../../controllers/task.controller');
const {
  addComment,
  getComments
} = require('../../controllers/comment.controller');
const {
  createTaskValidation,
  updateTaskValidation,
  taskIdValidation
} = require('../../validators/task.validator');

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   - name: Tasks
 *     description: Task management endpoints
 */

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get tasks for current user (or all tasks for admin)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tasks fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', getTasks);

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Prepare API report
 *               description:
 *                 type: string
 *                 example: Finalize endpoint health-check report
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', createTaskValidation, createTask);

/**
 * @swagger
 * /api/v1/tasks/admin/all:
 *   get:
 *     summary: Get all tasks with owner details (admin only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All tasks fetched successfully for admin
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/admin/all', authorizeRoles('admin'), getAllTasksForAdmin);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get a single task by id
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.get('/smart/suggest', getSmartSortedTasks);
router.get('/:id', taskIdValidation, getTaskById);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Update a task by id
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.put('/:id', updateTaskValidation, updateTask);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete a task by id
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', taskIdValidation, deleteTask);

router.get('/:id/comments', taskIdValidation, getComments);
router.post('/:id/comments', taskIdValidation, addComment);
router.get('/:id/activity', taskIdValidation, getTaskActivity);
router.post('/:id/time-log', taskIdValidation, logTimeSpent);

module.exports = router;
