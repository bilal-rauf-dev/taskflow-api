const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['comment_added', 'task_assigned', 'status_changed', 'deadline_warning'],
      required: true
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
