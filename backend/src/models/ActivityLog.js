const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      enum: ['task_created', 'status_changed', 'priority_changed', 'dueDate_changed', 'comment_added'],
      required: true
    },
    details: {
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
