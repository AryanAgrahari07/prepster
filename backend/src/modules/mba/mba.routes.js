const express = require('express');
const router = express.Router();
const mbaController = require('./mba.controller');
const { protect } = require('../../middleware/auth'); // Adjust path as necessary based on structure

// GD Routes
router.get('/gd', protect, mbaController.getGdTopics);
router.get('/gd/:id', protect, mbaController.getGdTopicById);

// PI Routes
router.get('/pi', protect, mbaController.getPiQuestions);

// Case Studies Routes
router.get('/cases', protect, mbaController.getCaseStudies);
router.get('/cases/:id', protect, mbaController.getCaseStudyById);

// WAT Routes
router.get('/wat', protect, mbaController.getWatTopics);
router.get('/wat/:id', protect, mbaController.getWatTopicById);

// Session Tracking
router.post('/sessions', protect, mbaController.startMbaSession);
router.patch('/sessions/:id/finish', protect, mbaController.finishMbaSession);

// Sector Routes
router.get('/sectors', protect, mbaController.getSectors);
router.get('/sectors/:slug', protect, mbaController.getSectorBySlug);

// Guesstimate Routes
router.get('/guesstimates', protect, mbaController.getGuesstimates);
router.get('/guesstimates/:id', protect, mbaController.getGuesstimatById);

// Analytics
router.get('/analytics/me', protect, mbaController.getMbaAnalytics);

// Mock Interview Routes
router.post('/mock-interview/start',           protect, mbaController.startMockInterview);
router.get('/mock-interview',                  protect, mbaController.listMockInterviews);
router.patch('/mock-interview/:id/answer',     protect, mbaController.submitMockInterviewAnswer);
router.post('/mock-interview/:id/finish',      protect, mbaController.finishMockInterview);
router.get('/mock-interview/:id',              protect, mbaController.getMockInterviewById);

module.exports = router;
