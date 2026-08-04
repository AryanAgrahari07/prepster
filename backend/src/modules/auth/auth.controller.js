const authService = require('./auth.service');
const emailService = require('../notifications/email.service');
const logger = require('../../config/logger');

// Cookie options for refresh token
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/',
};

// ─── POST /v1/auth/register ───────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, college, branch, graduationYear } = req.body;
    const { user, otp } = await authService.register({
      firstName, lastName, email, password, college, branch, graduationYear,
    });

    // Send OTP email (fire-and-forget)
    emailService.sendOtpEmail(user, otp).catch(err =>
      logger.error('Failed to send OTP email:', err.message)
    );

    res.status(201).json({
      success: true,
      message: 'Account created! Please check your email to verify your account.',
      data: {
        userId: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /v1/auth/verify-otp ──────────────────────────────────────────────────
const verifyOtp = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    const user = await authService.verifyOtp(userId, otp);

    // Generate JWT tokens to auto-login the user after verification
    const accessToken = authService.generateAccessToken(user._id, user.role);
    const refreshToken = authService.generateRefreshToken(user._id);
    await authService.storeRefreshToken(user._id.toString(), refreshToken);

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({
      success: true,
      message: 'Email verified successfully! Welcome to Prepster.',
      data: {
        accessToken,
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
          subscription: user.subscription,
          streak: user.streak,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /v1/auth/login ──────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login({ email, password });

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
          subscription: user.subscription,
          streak: user.streak,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /v1/auth/refresh ────────────────────────────────────────────────────
const refresh = async (req, res, next) => {
  try {
    const incomingRefresh = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incomingRefresh) {
      return res.status(401).json({
        success: false,
        error: { code: 4001, message: 'No refresh token provided', field: null },
      });
    }

    const { accessToken, refreshToken } = await authService.refreshTokens(incomingRefresh);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    next(err);
  }
};

// ─── POST /v1/auth/logout ─────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user._id);
    res.clearCookie('refreshToken', { path: '/' });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── POST /v1/auth/forgot-password ───────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    if (result) {
      emailService.sendPasswordResetEmail(result.user, result.resetToken).catch(err =>
        logger.error('Failed to send password reset email:', err.message)
      );
    }
    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /v1/auth/reset-password ────────────────────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    res.json({ success: true, message: 'Password reset successful. Please log in.' });
  } catch (err) {
    next(err);
  }
};

// ─── GET /v1/auth/google/callback (Passport callback) ────────────────────────
const googleCallback = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = req.authResult;
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    // Redirect to frontend with access token as query param (short-lived, one-time use)
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/google/success?token=${accessToken}`
    );
  } catch (err) {
    next(err);
  }
};

module.exports = { register, verifyOtp, login, refresh, logout, forgotPassword, resetPassword, googleCallback };
