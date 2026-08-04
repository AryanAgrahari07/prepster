const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../user/user.model');
const { getRedis } = require('../../config/redis');
const { AppError } = require('../../middleware/errorHandler');
const { APP_ERRORS, REDIS_KEYS } = require('../../shared/constants');

const SALT_ROUNDS = 12;
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

// ─── Email Normalizer ─────────────────────────────────────────────────────────
// Gmail (and Googlemail) ignores dots in the local part of the address, so
// "aryan.agrahari.52666@gmail.com" === "aryanagrahari52666@gmail.com".
// We strip dots from the local part for these domains to produce a single
// canonical address before any DB lookup or user creation.
const normalizeEmail = (raw) => {
  if (!raw || typeof raw !== 'string') return raw;
  const lower = raw.trim().toLowerCase();
  const [local, domain] = lower.split('@');
  if (!domain) return lower;
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    // Remove all dots from the local part (Gmail ignores them)
    return `${local.replace(/\./g, '')}@${domain}`;
  }
  return lower;
};


// ─── Token Helpers ────────────────────────────────────────────────────────────
const generateAccessToken = (userId, role) =>
  jwt.sign({ userId, role }, process.env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });

const generateRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });

const storeRefreshToken = async (userId, token) => {
  const redis = getRedis();
  await redis.setex(REDIS_KEYS.refreshToken(userId), REFRESH_TTL_SECONDS, token);
};

const deleteRefreshToken = async (userId) => {
  const redis = getRedis();
  await redis.del(REDIS_KEYS.refreshToken(userId));
};

// ─── Register ─────────────────────────────────────────────────────────────────
const register = async ({ firstName, lastName, email, password, college, branch, graduationYear }) => {
  email = normalizeEmail(email);
  const existing = await User.findOne({ email }).lean();
  if (existing) {
    throw new AppError('An account with this email already exists', 409, 4009, 'email');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    email,
    passwordHash,
    profile: { firstName: firstName || '', lastName: lastName || '', college, branch, graduationYear },
  });

  // Generate 6-digit email verification OTP (stored in Redis for 10m)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const redis = getRedis();
  await redis.setex(REDIS_KEYS.emailVerify(user._id.toString()), 600, otp);

  return { user, otp };
};

// ─── Verify OTP ─────────────────────────────────────────────────────────────
const verifyOtp = async (userId, otp) => {
  const redis = getRedis();
  const storedOtp = await redis.get(REDIS_KEYS.emailVerify(userId));
  
  if (!storedOtp) {
    throw new AppError('OTP has expired. Please request a new one.', 400, 4011);
  }
  
  if (storedOtp !== otp) {
    throw new AppError('Invalid OTP. Please try again.', 400, 4011);
  }

  const user = await User.findByIdAndUpdate(userId, { isEmailVerified: true }, { new: true });
  await redis.del(REDIS_KEYS.emailVerify(userId));
  
  return user;
};

// ─── Login ────────────────────────────────────────────────────────────────────
const login = async ({ email, password }) => {
  email = normalizeEmail(email);
  const user = await User.findOne({ email, isDeleted: false });
  if (!user) throw AppError.fromAppError(APP_ERRORS.INVALID_TOKEN);

  if (!user.passwordHash) {
    throw new AppError('This account uses Google sign-in. Please login with Google.', 400, 4012);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new AppError('Invalid email or password', 401, 4001);

  if (!user.isEmailVerified) {
    throw new AppError('Please verify your email before logging in. Check your inbox for the verification link.', 403, 4014);
  }

  await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  await storeRefreshToken(user._id.toString(), refreshToken);

  return { user, accessToken, refreshToken };
};

// ─── Refresh Token ────────────────────────────────────────────────────────────
const refreshTokens = async (incomingRefresh) => {
  let decoded;
  try {
    decoded = jwt.verify(incomingRefresh, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw AppError.fromAppError(APP_ERRORS.INVALID_TOKEN);
  }

  const redis = getRedis();
  const stored = await redis.get(REDIS_KEYS.refreshToken(decoded.userId));
  if (!stored || stored !== incomingRefresh) {
    throw AppError.fromAppError(APP_ERRORS.INVALID_TOKEN);
  }

  const user = await User.findById(decoded.userId).select('role isDeleted').lean();
  if (!user || user.isDeleted) throw AppError.fromAppError(APP_ERRORS.INVALID_TOKEN);

  const accessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id);
  await storeRefreshToken(decoded.userId, newRefreshToken);

  return { accessToken, refreshToken: newRefreshToken };
};

// ─── Logout ───────────────────────────────────────────────────────────────────
const logout = async (userId) => {
  await deleteRefreshToken(userId.toString());
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
const forgotPassword = async (email) => {
  email = normalizeEmail(email);
  const user = await User.findOne({ email, isDeleted: false }).lean();
  if (!user) return null; // Silent fail — don't reveal if email exists

  const resetToken = crypto.randomBytes(32).toString('hex');
  const redis = getRedis();
  await redis.setex(REDIS_KEYS.passwordReset(resetToken), 3600, user._id.toString()); // 1h

  return { user, resetToken };
};

// ─── Reset Password ───────────────────────────────────────────────────────────
const resetPassword = async (token, newPassword) => {
  const redis = getRedis();
  const userId = await redis.get(REDIS_KEYS.passwordReset(token));
  if (!userId) throw new AppError('Reset link is invalid or has expired', 400, 4013);

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await User.findByIdAndUpdate(userId, { passwordHash });
  await redis.del(REDIS_KEYS.passwordReset(token));
  // Invalidate any existing sessions
  await deleteRefreshToken(userId);
};

// ─── Google OAuth upsert ──────────────────────────────────────────────────────
const findOrCreateGoogleUser = async ({ googleId, email, firstName, lastName, avatar }) => {
  email = normalizeEmail(email);
  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      if (avatar && !user.profile.avatar) user.profile.avatar = avatar;
      await user.save();
    }
  } else {
    user = await User.create({
      email,
      googleId,
      isEmailVerified: true,
      profile: { firstName: firstName || '', lastName: lastName || '', avatar },
    });
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  await storeRefreshToken(user._id.toString(), refreshToken);

  return { user, accessToken, refreshToken };
};

module.exports = {
  register,
  verifyOtp,
  login,
  refreshTokens,
  logout,
  forgotPassword,
  resetPassword,
  findOrCreateGoogleUser,
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
};
