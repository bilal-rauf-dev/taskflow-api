const Notification = require('../models/Notification');

// Get all notifications for current user
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name')
      .populate('task', 'title')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { notifications },
      message: 'Notifications fetched successfully'
    });
  } catch (error) {
    return next(error);
  }
};

// Mark a single notification as read
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: { notification },
      message: 'Notification marked as read'
    });
  } catch (error) {
    return next(error);
  }
};

// Mark all notifications for current user as read
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
