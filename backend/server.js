const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/v1/auth.routes');
const taskRoutes = require('./src/routes/v1/task.routes');
const notificationRoutes = require('./src/routes/v1/notification.routes');
const adminRoutes = require('./src/routes/v1/admin.routes');
const swaggerSpec = require('./src/swagger/swagger');

dotenv.config();

const app = express();

connectDB();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    errors: ['Rate limit exceeded (100 requests per 15 minutes)']
  }
});

app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(limiter);

app.get('/health', (req, res) => {
  return res.status(200).json({
    success: true,
    data: { status: 'ok' },
    message: 'Server is healthy'
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Route not found',
    errors: [`Cannot ${req.method} ${req.originalUrl}`]
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    errors: [process.env.NODE_ENV === 'development' ? err.stack : 'Unexpected error occurred']
  });
});

const http = require('http');
const { initSocket } = require('./src/config/socket');
const startDeadlineScan = require('./src/services/deadlineDaemon');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);
startDeadlineScan();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
