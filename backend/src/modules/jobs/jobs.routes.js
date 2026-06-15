const express = require('express');
const router = express.Router();
const Job = require('./job.model');
const { authenticate, optionalAuth, requirePro } = require('../../middleware/auth');
const { AppError } = require('../../middleware/errorHandler');
const { cacheMiddleware, jobsFeedKey } = require('../../middleware/cache');

// GET /v1/jobs
// Cached per unique filter combination for 2 minutes
router.get('/', optionalAuth, cacheMiddleware(jobsFeedKey, 120), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = { status: 'active' };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.workMode) filter.workMode = req.query.workMode;
    if (req.query.batchYear) filter['eligibility.batchYears'] = parseInt(req.query.batchYear);
    if (req.query.minCtc) filter['ctc.min'] = { $gte: parseFloat(req.query.minCtc) };
    if (req.query.q) {
      filter.$or = [
        { title: { $regex: req.query.q, $options: 'i' } },
        { companyName: { $regex: req.query.q, $options: 'i' } }
      ];
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      Job.countDocuments(filter),
    ]);

    res.json({ success: true, data: { jobs }, pagination: { page, limit, total, hasNext: skip + limit < total } });
  } catch (err) { next(err); }
});

// GET /v1/jobs/:id
// Cached per job ID for 5 minutes
router.get('/:id', optionalAuth, cacheMiddleware(req => `job:${req.params.id}`, 300), async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, status: 'active' }).lean();
    if (!job) throw new AppError('Job not found', 404, 4004);
    res.json({ success: true, data: { job } });
  } catch (err) { next(err); }
});

const Application = require('./application.model');

// POST /v1/jobs/:id/apply (Pro only)
router.post('/:id/apply', authenticate, requirePro, async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, status: 'active' });
    if (!job) throw new AppError('Job not found or inactive', 404, 4004);

    const existingApp = await Application.findOne({ jobId: job._id, userId: req.user._id });
    if (existingApp) throw new AppError('You have already applied for this job', 400, 4009);

    const resumeUrl = req.user.profile?.resumeUrl || req.body.resumeUrl;
    if (!resumeUrl) {
      throw new AppError('Resume is required to apply. Please upload your resume in your profile first.', 400, 4010);
    }

    const application = await Application.create({
      jobId: job._id,
      userId: req.user._id,
      employerId: job.postedBy,   // Required for employer-side applicant lookup
      resumeUrl,
      status: 'applied',
    });

    res.status(201).json({ success: true, data: { applicationId: application._id } });
  } catch (err) { next(err); }
});

module.exports = router;
