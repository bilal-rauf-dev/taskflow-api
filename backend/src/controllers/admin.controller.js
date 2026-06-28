const ActivityLog = require('../models/ActivityLog');

const getProductivityReport = async (req, res, next) => {
  try {
    const reportData = await ActivityLog.aggregate([
      {
        $match: {
          action: 'status_changed',
          'details.newValue': 'completed'
        }
      },
      {
        $group: {
          _id: { $week: '$createdAt' },
          completions: { $sum: 1 },
          weekDate: { $min: '$createdAt' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return res.status(200).json({
      success: true,
      data: { report: reportData },
      message: 'Productivity report fetched successfully'
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getProductivityReport
};
