const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema(
  {
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    order: {
      type: Number,
      required: true,
      default: 0
    },
    wipLimit: {
      type: Number,
      default: null,
      min: 1
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Column', columnSchema);
