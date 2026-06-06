const rateLimit = require('express-rate-limit');
const { APP_ERRORS } = require('../shared/constants');

const makeRateLimitResponse = (req, res) => {
  res.status(429).json({
    success: false,
    error: {
      code: APP_ERRORS.RATE_LIMITED.code,
      message: APP_ERRORS.RATE_LIMITED.message,
      field: null,
    },
  });
};

// ─── Auth Routes ──────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  keyGenerator: (req) => req.ip,
  handler: makeRateLimitResponse,
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  keyGenerator: (req) => req.ip,
  handler: makeRateLimitResponse,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => `${req.ip}:${req.body?.email || ''}`,
  handler: makeRateLimitResponse,
});

// ─── General API (per user) ───────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  handler: makeRateLimitResponse,
  skip: (req) => process.env.NODE_ENV === 'test', // skip in tests
});

// ─── Apply endpoint ───────────────────────────────────────────────────────────
const applyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  handler: makeRateLimitResponse,
});

// ─── Subscription ─────────────────────────────────────────────────────────────
const subscriptionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  handler: makeRateLimitResponse,
});

// ─── Admin ────────────────────────────────────────────────────────────────────
const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  handler: makeRateLimitResponse,
});

module.exports = {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  apiLimiter,
  applyLimiter,
  subscriptionLimiter,
  adminLimiter,
};
