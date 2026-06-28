const cron = require('node-cron');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');

// Scans daily at 9:00 AM (0 9 * * *)
// You can use '*/5 * * * *' to run every 5 minutes during testing
const startDeadlineScan = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running background deadline analytics daemon...');
    try {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Find tasks not completed that are due in the next 24 hours
      const urgentTasks = await Task.find({
        status: { $ne: 'completed' },
        dueDate: { $gte: now, $lte: tomorrow }
      });

      for (const task of urgentTasks) {
        // Double-check if warning notification already exists to avoid spamming
        const existing = await Notification.findOne({
          recipient: task.owner,
          task: task._id,
          type: 'deadline_warning'
        });

        if (!existing) {
          const notification = await Notification.create({
            recipient: task.owner,
            sender: task.owner, // System-generated alert
            type: 'deadline_warning',
            task: task._id
          });

          await notification.populate('task', 'title');

          // Send WebSocket notification
          try {
            const io = getIO();
            io.to(task.owner.toString()).emit('new_notification', notification);
          } catch (socketErr) {
            console.error('Socket notification push failed in cron daemon:', socketErr.message);
          }
        }
      }
    } catch (err) {
      console.error('Deadline daemon scanning error:', err.message);
    }
  });
};

module.exports = startDeadlineScan;
