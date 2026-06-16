const express = require('express');
const router = express.Router();
const mbaController = require('./mba.controller');
const { authenticate, optionalAuth } = require('../../middleware/auth');

// ── Public browse routes (optionalAuth — guests can read, sessions need login) ──

// GD Routes
router.get('/gd',     optionalAuth, mbaController.getGdTopics);
router.get('/gd/:id', optionalAuth, mbaController.getGdTopicById);

// PI Routes
router.get('/pi', optionalAuth, mbaController.getPiQuestions);

// Case Studies Routes
router.get('/cases',     optionalAuth, mbaController.getCaseStudies);
router.get('/cases/:id', optionalAuth, mbaController.getCaseStudyById);

// WAT Routes
router.get('/wat',     optionalAuth, mbaController.getWatTopics);
router.get('/wat/:id', optionalAuth, mbaController.getWatTopicById);

// Sector Routes
router.get('/sectors',       optionalAuth, mbaController.getSectors);
router.get('/sectors/:slug', optionalAuth, mbaController.getSectorBySlug);

// Guesstimate Routes
router.get('/guesstimates',     optionalAuth, mbaController.getGuesstimates);
router.get('/guesstimates/:id', optionalAuth, mbaController.getGuesstimatById);

// ── Protected routes (require login) ──

// Session Tracking
router.post('/sessions',             authenticate, mbaController.startMbaSession);
router.patch('/sessions/:id/finish', authenticate, mbaController.finishMbaSession);

// Analytics
router.get('/analytics/me', authenticate, mbaController.getMbaAnalytics);

// Mock Interview Routes
router.post('/mock-interview/start',          authenticate, mbaController.startMockInterview);
router.get('/mock-interview',                 authenticate, mbaController.listMockInterviews);
router.patch('/mock-interview/:id/answer',    authenticate, mbaController.submitMockInterviewAnswer);
router.post('/mock-interview/:id/finish',     authenticate, mbaController.finishMockInterview);
router.get('/mock-interview/:id',             authenticate, mbaController.getMockInterviewById);

module.exports = router;
