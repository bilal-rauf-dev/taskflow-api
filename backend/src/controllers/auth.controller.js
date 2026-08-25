const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt
});

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Registration failed',
        errors: ['Email is already in use']
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const token = signToken(user);

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: formatUser(user)
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Login failed',
        errors: ['Invalid email or password']
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Login failed',
        errors: ['Invalid email or password']
      });
    }

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: formatUser(user)
      },
      message: 'Login successful'
    });
  } catch (error) {
    return next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errors: ['Authenticated user does not exist']
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: formatUser(user)
      },
      message: 'Current user fetched successfully'
    });
  } catch (error) {
    return next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errors: ['Authenticated user does not exist']
      });
    }

    user.name = req.body.name;
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        token: signToken(user),
        user: formatUser(user)
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateMe
};
