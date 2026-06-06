const express = require('express');
const router = express.Router();
const Application = require('./application.model');
const { authenticate } = require('../../middleware/auth');
const { AppError } = require('../../middleware/errorHandler');

// GET /v1/applications/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .populate('jobId', 'title companyName companyLogo location type workMode')
      .sort({ createdAt: -1 })
      .lean();
      
    res.json({ success: true, data: { applications } });
  } catch (err) { next(err); }
});

// PATCH /v1/applications/:id/withdraw
router.patch('/:id/withdraw', authenticate, async (req, res, next) => {
  try {
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'withdrawn', statusUpdatedAt: new Date() },
      { new: true }
    );
    if (!application) throw new AppError('Application not found', 404, 4004);
    res.json({ success: true, data: { application } });
  } catch (err) { next(err); }
});

module.exports = router;
