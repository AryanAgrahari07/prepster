const jwt = require('jsonwebtoken');
const User = require('../modules/user/user.model');
const { AppError } = require('./errorHandler');
const { APP_ERRORS, ROLES, PLANS } = require('../shared/constants');

/**
 * authenticate — verifies Bearer JWT, attaches req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.fromAppError(APP_ERRORS.INVALID_TOKEN);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.userId)
      .select('-passwordHash')
      .lean();

    if (!user || user.isDeleted) {
      throw AppError.fromAppError(APP_ERRORS.INVALID_TOKEN);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.isOperational) return next(err);
    next(AppError.fromAppError(APP_ERRORS.INVALID_TOKEN));
  }
};

/**
 * requirePro — must come after authenticate
 * Checks subscription plan and expiry
 */
const requirePro = (req, res, next) => {
  const { subscription } = req.user;
  const isPro =
    subscription?.plan === PLANS.PRO &&
    subscription?.status === 'active' &&
    new Date(subscription?.expiresAt) > new Date();

  if (!isPro) {
    return next(AppError.fromAppError(APP_ERRORS.PRO_REQUIRED));
  }
  next();
};

/**
 * requireRole(...roles) — must come after authenticate
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return next(
      new AppError('You do not have permission to access this resource', 403, 4010)
    );
  }
  next();
};

/**
 * optionalAuth — attaches req.user if token is present, but does NOT block if missing
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash').lean();
    if (user && !user.isDeleted) req.user = user;
  } catch (_) {
    // Silently ignore — optional auth
  }
  next();
};

module.exports = { authenticate, requirePro, requireRole, optionalAuth };
