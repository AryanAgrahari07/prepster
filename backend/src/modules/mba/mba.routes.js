const express = require('express');
const router = express.Router();
const mbaController = require('./mba.controller');
const { authenticate } = require('../../middleware/auth'); // Adjust path as necessary based on structure

// GD Routes
router.get('/gd', authenticate, mbaController.getGdTopics);
router.get('/gd/:id', authenticate, mbaController.getGdTopicById);

// PI Routes
router.get('/pi', authenticate, mbaController.getPiQuestions);

// Case Studies Routes
router.get('/cases', authenticate, mbaController.getCaseStudies);
router.get('/cases/:id', authenticate, mbaController.getCaseStudyById);

// WAT Routes
router.get('/wat', authenticate, mbaController.getWatTopics);
router.get('/wat/:id', authenticate, mbaController.getWatTopicById);

// Session Tracking
router.post('/sessions', authenticate, mbaController.startMbaSession);
router.patch('/sessions/:id/finish', authenticate, mbaController.finishMbaSession);

// Sector Routes
router.get('/sectors', authenticate, mbaController.getSectors);
router.get('/sectors/:slug', authenticate, mbaController.getSectorBySlug);

// Guesstimate Routes
router.get('/guesstimates', authenticate, mbaController.getGuesstimates);
router.get('/guesstimates/:id', authenticate, mbaController.getGuesstimatById);

// Analytics
router.get('/analytics/me', authenticate, mbaController.getMbaAnalytics);

// Mock Interview Routes
router.post('/mock-interview/start',           authenticate, mbaController.startMockInterview);
router.get('/mock-interview',                  authenticate, mbaController.listMockInterviews);
router.patch('/mock-interview/:id/answer',     authenticate, mbaController.submitMockInterviewAnswer);
router.post('/mock-interview/:id/finish',      authenticate, mbaController.finishMockInterview);
router.get('/mock-interview/:id',              authenticate, mbaController.getMockInterviewById);

module.exports = router;
