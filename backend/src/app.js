require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const logger = require('./config/logger');

const app = express();

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://prepster.online',
  'https://www.prepster.online',
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true, // Allow HttpOnly cookies (refresh token)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// ─── Cookie Parser (for HttpOnly refresh token cookie) ───────────────────────
app.use(cookieParser());

// ─── Passport (Google OAuth) ──────────────────────────────────────────────────
app.use(passport.initialize());

// ─── Request Logging ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Health Check (no auth, no rate limit) ────────────────────────────────────
app.get('/health', async (req, res) => {
  const mongoose = require('mongoose');
  const { getRedis } = require('./config/redis');

  let redisStatus = 'disconnected';
  try {
    const r = getRedis();
    await r.set('health_check', '1');
    redisStatus = 'connected';
  } catch (_) {}

  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    redis: redisStatus,
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── Global Rate Limit on all /v1 routes ─────────────────────────────────────
app.use('/v1', apiLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/v1/auth', require('./modules/auth/auth.routes'));
app.use('/v1/users', require('./modules/user/user.routes'));
app.use('/v1/aptitude', require('./modules/aptitude/aptitude.routes'));
app.use('/v1/companies', require('./modules/company/company.routes'));
app.use('/v1/jobs', require('./modules/jobs/jobs.routes'));
app.use('/v1/applications', require('./modules/jobs/applications.routes'));
app.use('/v1/employer', require('./modules/employer/employer.routes'));
app.use('/v1/subscriptions', require('./modules/subscription/subscription.routes'));
app.use('/v1/plans', require('./modules/subscription/plans.routes'));
app.use('/v1/coupons', require('./modules/subscription/coupons.routes'));
app.use('/v1/admin', require('./modules/admin/admin.routes'));
app.use('/v1/webhooks', require('./modules/subscription/webhooks.routes'));
app.use('/v1/notifications', require('./modules/notifications/announcements.routes'));
app.use('/v1/blogs', require('./modules/blog/blog.routes'));

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 4004, message: `Route ${req.method} ${req.path} not found`, field: null },
  });
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

module.exports = app;
