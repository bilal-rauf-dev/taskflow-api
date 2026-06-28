const express = require('express');
const authenticate = require('../../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead
} = require('../../controllers/notification.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

module.exports = router;
