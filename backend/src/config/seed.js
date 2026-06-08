const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('./db');
const User = require('../models/User');
const Task = require('../models/Task');

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    const adminEmail = 'admin@admin.com';
    const userEmail = 'test@test.com';

    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      adminUser = await User.create({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    let testUser = await User.findOne({ email: userEmail });
    if (!testUser) {
      const hashedPassword = await bcrypt.hash('test123', 12);
      testUser = await User.create({
        name: 'Test User',
        email: userEmail,
        password: hashedPassword,
        role: 'user'
      });
      console.log('Test user created successfully');
    } else {
      console.log('Test user already exists');
    }

    const existingTasksCount = await Task.countDocuments({ owner: testUser._id });
    if (existingTasksCount === 0) {
      const sampleTasks = [
        {
          title: 'Finalize API documentation',
          description: 'Complete the backend documentation and verify all routes.',
          status: 'completed',
          priority: 'high',
          dueDate: new Date('2026-06-05')
        },
        {
          title: 'Implement JWT login flow',
          description: 'Test auth endpoints and confirm token behavior.',
          status: 'in-progress',
          priority: 'high',
          dueDate: new Date('2026-06-10')
        },
        {
          title: 'Design dashboard cards',
          description: 'Refine the summary cards and visual hierarchy.',
          status: 'pending',
          priority: 'medium',
          dueDate: new Date('2026-06-14')
        },
        {
          title: 'Prepare admin panel review',
          description: 'Ensure admin-only actions behave as expected.',
          status: 'pending',
          priority: 'low',
          dueDate: new Date('2026-06-18')
        },
        {
          title: 'Add mobile responsive polish',
          description: 'Adjust layouts for phones and smaller tablets.',
          status: 'completed',
          priority: 'medium',
          dueDate: new Date('2026-06-07')
        }
      ];

      await Task.insertMany(
        sampleTasks.map((task) => ({
          ...task,
          owner: testUser._id
        }))
      );
      console.log('Sample tasks created successfully');
    } else {
      console.log('Sample tasks already exist for test user');
    }

    console.log('Seed process completed successfully');
  } catch (error) {
    console.error('Seed process failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seed();
