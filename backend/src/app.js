const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/v1/auth.routes');
const taskRoutes = require('./routes/v1/task.routes');
const boardRoutes = require('./routes/v1/board.routes');
const notificationRoutes = require('./routes/v1/notification.routes');
const adminRoutes = require('./routes/v1/admin.routes');
const swaggerSpec = require('./swagger/swagger');

const app = express();

// Auth endpoints (login/register) get a tight limiter to blunt credential
// stuffing / brute-force attempts. Everything else under /api/v1 is normal
// authenticated read/write traffic (dashboard, boards, notifications, the
// realtime UI polling on every page nav) and needs a much larger budget so
// ordinary usage doesn't get mistaken for abuse and blocked with a 429.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    errors: ['Rate limit exceeded (30 requests per 15 minutes)']
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    errors: ['Rate limit exceeded (500 requests per 15 minutes)']
  }
});

app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());
app.use(cors());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(express.json());

app.get('/health', (req, res) => {
  return res.status(200).json({
    success: true,
    data: { status: 'ok' },
    message: 'Server is healthy'
  });
});

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/tasks', apiLimiter, taskRoutes);
app.use('/api/v1/boards', apiLimiter, boardRoutes);
app.use('/api/v1/notifications', apiLimiter, notificationRoutes);
app.use('/api/v1/admin', apiLimiter, adminRoutes);
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

module.exports = app;
