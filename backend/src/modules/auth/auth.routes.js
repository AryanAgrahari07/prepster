const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const router = express.Router();

const authController = require('./auth.controller');
const { validate } = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
} = require('../../middleware/rateLimiter');
const {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  verifyOtpRules,
} = require('./auth.validators');
const { findOrCreateGoogleUser } = require('./auth.service');

// ─── Google OAuth Strategy Setup ─────────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const result = await findOrCreateGoogleUser({
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            avatar: profile.photos?.[0]?.value,
          });
          done(null, result);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
} else {
  console.warn('⚠️  GOOGLE_CLIENT_ID missing — Google OAuth is disabled');
}

// ─── Routes ───────────────────────────────────────────────────────────────────
// POST /v1/auth/register
router.post('/register', registerLimiter, registerRules, validate, authController.register);

// POST /v1/auth/verify-otp
router.post('/verify-otp', verifyOtpRules, validate, authController.verifyOtp);

// POST /v1/auth/login
router.post('/login', loginLimiter, loginRules, validate, authController.login);

// POST /v1/auth/refresh
router.post('/refresh', authController.refresh);

// POST /v1/auth/logout  (requires auth)
router.post('/logout', authenticate, authController.logout);

// POST /v1/auth/forgot-password
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordRules, validate, authController.forgotPassword);

// POST /v1/auth/reset-password
router.post('/reset-password', resetPasswordRules, validate, authController.resetPassword);

// GET /v1/auth/google  → redirect to Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// GET /v1/auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/auth/login?error=oauth` }),
  (req, res, next) => {
    req.authResult = req.user; // passport puts it in req.user
    authController.googleCallback(req, res, next);
  }
);

module.exports = router;
