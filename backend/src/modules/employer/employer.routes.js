const express = require('express');
const router = express.Router();
const Job = require('../jobs/job.model');
const Application = require('../jobs/application.model');
const { authenticate, requireRole } = require('../../middleware/auth');
const { AppError } = require('../../middleware/errorHandler');
const { validate } = require('../../middleware/validate');
const { createJobRules, updateApplicationRules } = require('../jobs/jobs.validators');

// Require employer or admin role for all routes here
router.use(authenticate, requireRole('employer', 'admin', 'superadmin'));

// POST /v1/employer/jobs
router.post('/jobs', createJobRules, validate, async (req, res, next) => {
  try {
    const job = await Job.create({
      ...req.body,
      postedBy: req.user._id,
    });
    res.status(201).json({ success: true, data: { job } });
  } catch (err) { next(err); }
});

// GET /v1/employer/jobs
router.get('/jobs', async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 }).lean();
    
    // Get application counts for each job
    const jobIds = jobs.map(j => j._id);
    const appCounts = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } }
    ]);
    
    const countMap = appCounts.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {});
    
    const enrichedJobs = jobs.map(job => ({
      ...job,
      applicationCount: countMap[job._id] || 0
    }));

    res.json({ success: true, data: { jobs: enrichedJobs } });
  } catch (err) { next(err); }
});

// GET /v1/employer/jobs/:id
router.get('/jobs/:id', async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id }).lean();
    if (!job) throw new AppError('Job not found', 404, 4004);
    res.json({ success: true, data: { job } });
  } catch (err) { next(err); }
});

// PATCH /v1/employer/jobs/:id
router.patch('/jobs/:id', async (req, res, next) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!job) throw new AppError('Job not found or unauthorized', 404, 4004);
    res.json({ success: true, data: { job } });
  } catch (err) { next(err); }
});

// GET /v1/employer/jobs/:id/applicants
router.get('/jobs/:id/applicants', async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
    if (!job) throw new AppError('Job not found or unauthorized', 404, 4004);

    const applications = await Application.find({ jobId: job._id })
      .populate('userId', 'email profile')  // model field is userId
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: { job, applications } });
  } catch (err) { next(err); }
});

// PATCH /v1/employer/applications/:id
router.patch('/applications/:id', updateApplicationRules, validate, async (req, res, next) => {
  try {
    const { status } = req.body;
    
    // Note: status validation is ideally in a validation middleware, but adding simple check here
    const validStatuses = ['applied', 'under-review', 'shortlisted', 'rejected', 'hired', 'withdrawn'];
    if (!validStatuses.includes(status)) throw new AppError('Invalid status', 400, 4000);

    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, employerId: req.user._id },
      { status, statusUpdatedAt: new Date() },
      { new: true }
    );
    
    if (!application) throw new AppError('Application not found or unauthorized', 404, 4004);

    res.json({ success: true, data: { application } });
  } catch (err) { next(err); }
});

module.exports = router;
