const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const User = require('../models/User');
const { canAccessBoard } = require('../utils/boardAccess');

const DEFAULT_COLUMNS = ['To Do', 'In Progress', 'Completed'];

const createBoard = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const board = await Board.create({
      name,
      description,
      owner: req.user.id,
      members: [{ user: req.user.id, role: 'owner' }]
    });

    const columns = await Column.insertMany(
      DEFAULT_COLUMNS.map((columnName, index) => ({
        board: board._id,
        name: columnName,
        order: index
      }))
    );

    return res.status(201).json({
      success: true,
      data: { board, columns },
      message: 'Board created successfully'
    });
  } catch (error) {
    return next(error);
  }
};

const getBoards = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { 'members.user': req.user.id };
    const boards = await Board.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { boards },
      message: 'Boards fetched successfully'
    });
  } catch (error) {
    return next(error);
  }
};

const getBoardById = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
        errors: ['Board with provided id does not exist']
      });
    }

    if (!canAccessBoard(board, req.user, 'viewer')) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        errors: ['You are not a member of this board']
      });
    }

    const columns = await Column.find({ board: board._id }).sort({ order: 1 });

    return res.status(200).json({
      success: true,
      data: { board, columns },
      message: 'Board fetched successfully'
    });
  } catch (error) {
    return next(error);
  }
};

const getBoardTasks = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
        errors: ['Board with provided id does not exist']
      });
    }

    if (!canAccessBoard(board, req.user, 'viewer')) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        errors: ['You are not a member of this board']
      });
    }

    const tasks = await Task.find({ board: board._id }).sort({ position: 1 });

    return res.status(200).json({
      success: true,
      data: { tasks },
      message: 'Board tasks fetched successfully'
    });
  } catch (error) {
    return next(error);
  }
};

const updateBoard = async (req, res, next) => {
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
        errors: ['You need editor access to update this board']
      });
    }

    if (req.body.name !== undefined) board.name = req.body.name;
    if (req.body.description !== undefined) board.description = req.body.description;
    await board.save();

    return res.status(200).json({
      success: true,
      data: { board },
      message: 'Board updated successfully'
    });
  } catch (error) {
    return next(error);
  }
};

const deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
        errors: ['Board with provided id does not exist']
      });
    }

    if (!canAccessBoard(board, req.user, 'owner')) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        errors: ['Only board owners can delete this board']
      });
    }

    const taskCount = await Task.countDocuments({ board: board._id });
    if (taskCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Board is not empty',
        errors: ['Move or delete all tasks on this board before deleting it']
      });
    }

    await Column.deleteMany({ board: board._id });
    await board.deleteOne();

    return res.status(200).json({
      success: true,
      data: { boardId: req.params.boardId },
      message: 'Board deleted successfully'
    });
  } catch (error) {
    return next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
        errors: ['Board with provided id does not exist']
      });
    }

    if (!canAccessBoard(board, req.user, 'owner')) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        errors: ['Only board owners can manage membership']
      });
    }

    const { email, userId, role } = req.body;
    const targetUser = userId ? await User.findById(userId) : await User.findOne({ email });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errors: ['No user matches the provided email or id']
      });
    }

    const alreadyMember = board.members.some(
      (member) => member.user.toString() === targetUser._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'Already a member',
        errors: ['This user is already a member of the board']
      });
    }

    board.members.push({ user: targetUser._id, role });
    await board.save();

    return res.status(201).json({
      success: true,
      data: { board },
      message: 'Member added successfully'
    });
  } catch (error) {
    return next(error);
  }
};

const changeMemberRole = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
        errors: ['Board with provided id does not exist']
      });
    }

    if (!canAccessBoard(board, req.user, 'owner')) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        errors: ['Only board owners can manage membership']
      });
    }

    const { userId } = req.params;
    if (userId === board.owner.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot change the founding owner's role",
        errors: ["The board owner's role is fixed"]
      });
    }

    const membership = board.members.find((member) => member.user.toString() === userId);
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
        errors: ['This user is not a member of the board']
      });
    }

    membership.role = req.body.role;
    await board.save();

    return res.status(200).json({
      success: true,
      data: { board },
      message: 'Member role updated successfully'
    });
  } catch (error) {
    return next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
        errors: ['Board with provided id does not exist']
      });
    }

    if (!canAccessBoard(board, req.user, 'owner')) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        errors: ['Only board owners can manage membership']
      });
    }

    const { userId } = req.params;
    if (userId === board.owner.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the board owner',
        errors: ['The founding owner cannot be removed']
      });
    }

    const initialLength = board.members.length;
    board.members = board.members.filter((member) => member.user.toString() !== userId);

    if (board.members.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
        errors: ['This user is not a member of the board']
      });
    }

    await board.save();

    return res.status(200).json({
      success: true,
      data: { board },
      message: 'Member removed successfully'
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createBoard,
  getBoards,
  getBoardById,
  getBoardTasks,
  updateBoard,
  deleteBoard,
  addMember,
  changeMemberRole,
  removeMember
};
