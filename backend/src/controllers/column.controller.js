const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const { getIO, boardRoom } = require('../config/socket');
const { canAccessBoard } = require('../utils/boardAccess');

const createColumn = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
        errors: ['Board with provided id does not exist']
      });
    }

    if (!canAccessBoard(board, req.user, 'editor')) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        errors: ['You need editor access to add columns']
      });
    }

    const lastColumn = await Column.findOne({ board: board._id }).sort({ order: -1 });
    const order = lastColumn ? lastColumn.order + 1 : 0;

    const column = await Column.create({
      board: board._id,
      name: req.body.name,
      wipLimit: req.body.wipLimit ?? null,
      order
    });

    try {
      getIO().to(boardRoom(board._id)).emit('column_added', { column });
    } catch (socketErr) {
      console.error('Socket column_added emit failed:', socketErr.message);
    }

    return res.status(201).json({
      success: true,
      data: { column },
      message: 'Column created successfully'
    });
  } catch (error) {
    return next(error);
  }
};

const updateColumn = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
        errors: ['Board with provided id does not exist']
      });
    }

    if (!canAccessBoard(board, req.user, 'editor')) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        errors: ['You need editor access to update columns']
      });
    }

    const column = await Column.findOne({ _id: req.params.columnId, board: board._id });
    if (!column) {
      return res.status(404).json({
        success: false,
        message: 'Column not found',
        errors: ['Column with provided id does not exist on this board']
      });
    }

    if (req.body.name !== undefined) column.name = req.body.name;
    if (req.body.wipLimit !== undefined) column.wipLimit = req.body.wipLimit;
    await column.save();

    try {
      getIO().to(boardRoom(board._id)).emit('column_updated', { column });
    } catch (socketErr) {
      console.error('Socket column_updated emit failed:', socketErr.message);
    }

    return res.status(200).json({
      success: true,
      data: { column },
      message: 'Column updated successfully'
    });
  } catch (error) {
    return next(error);
  }
};

const deleteColumn = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
        errors: ['Board with provided id does not exist']
      });
    }

    if (!canAccessBoard(board, req.user, 'editor')) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        errors: ['You need editor access to delete columns']
      });
    }

    const column = await Column.findOne({ _id: req.params.columnId, board: board._id });
    if (!column) {
      return res.status(404).json({
        success: false,
        message: 'Column not found',
        errors: ['Column with provided id does not exist on this board']
      });
    }

    const taskCount = await Task.countDocuments({ column: column._id });
    if (taskCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Column is not empty',
        errors: ['Move or delete tasks in this column before deleting it']
      });
    }

    await column.deleteOne();

    const remaining = await Column.find({ board: board._id }).sort({ order: 1 });
    await Promise.all(
      remaining.map((remainingColumn, index) =>
        Column.updateOne({ _id: remainingColumn._id }, { order: index })
      )
    );

    const updatedColumns = await Column.find({ board: board._id }).sort({ order: 1 });

    try {
      getIO()
        .to(boardRoom(board._id))
        .emit('column_deleted', { columnId: req.params.columnId, columns: updatedColumns });
    } catch (socketErr) {
      console.error('Socket column_deleted emit failed:', socketErr.message);
    }

    return res.status(200).json({
      success: true,
      data: { columnId: req.params.columnId },
      message: 'Column deleted successfully'
    });
  } catch (error) {
    return next(error);
  }
};

const reorderColumns = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
        errors: ['Board with provided id does not exist']
      });
    }

    if (!canAccessBoard(board, req.user, 'editor')) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        errors: ['You need editor access to reorder columns']
      });
    }

    const { orderedColumnIds } = req.body;
    const columns = await Column.find({ board: board._id });

    const isValidSet =
      columns.length === orderedColumnIds.length &&
      columns.every((column) => orderedColumnIds.includes(column._id.toString()));

    if (!isValidSet) {
      return res.status(400).json({
        success: false,
        message: 'Invalid column set',
        errors: ['orderedColumnIds must include every column on this board exactly once']
      });
    }

    await Promise.all(
      orderedColumnIds.map((columnId, index) => Column.updateOne({ _id: columnId }, { order: index }))
    );

    const updatedColumns = await Column.find({ board: board._id }).sort({ order: 1 });

    try {
      getIO()
        .to(boardRoom(board._id))
        .emit('column_reordered', { columns: updatedColumns });
    } catch (socketErr) {
      console.error('Socket column_reordered emit failed:', socketErr.message);
    }

    return res.status(200).json({
      success: true,
      data: { columns: updatedColumns },
      message: 'Columns reordered successfully'
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns
};
