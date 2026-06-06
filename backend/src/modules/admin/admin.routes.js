const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { createJobRules } = require('../jobs/jobs.validators');
const { ROLES } = require('../../shared/constants');
const User = require('../user/user.model');

// All admin routes require authentication + admin role
router.use(authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN));

// ─── PLATFORM STATS ──────────────────────────────────────────────────────────
// GET /v1/admin/stats — platform overview
router.get('/stats', async (req, res, next) => {
  try {
    const Question = require('../aptitude/question.model');
    const Job = require('../jobs/job.model');
    const Application = require('../jobs/application.model');

    const [totalUsers, proUsers, freeUsers, totalQuestions, activeJobs, totalApplications] = await Promise.all([
      User.countDocuments({ isDeleted: false }),
      User.countDocuments({ isDeleted: false, 'subscription.plan': 'pro', 'subscription.status': 'active' }),
      User.countDocuments({ isDeleted: false, 'subscription.plan': 'free' }),
      Question.countDocuments({ isActive: true }),
      Job.countDocuments({ status: 'active' }),
      Application.countDocuments({}),
    ]);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSignups = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    res.json({
      success: true,
      data: { totalUsers, proUsers, freeUsers, totalQuestions, activeJobs, totalApplications, recentSignups }
    });
  } catch (err) { next(err); }
});

// GET /v1/admin/analytics — signup + activity trends
router.get('/analytics', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Daily signups
    const signups = await User.aggregate([
      { $match: { createdAt: { $gte: since }, isDeleted: false } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } },
    ]);

    // Pro conversion over time
    const proConversions = await User.aggregate([
      { $match: { 'subscription.startedAt': { $gte: since }, 'subscription.plan': 'pro' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$subscription.startedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } },
    ]);

    // College-wise aggregation
    const collegeWise = await User.aggregate([
      { $match: { isDeleted: false, 'profile.college': { $exists: true, $ne: '' } } },
      { $group: { _id: '$profile.college', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { college: '$_id', count: 1, _id: 0 } }
    ]);

    // Year-wise aggregation
    const yearWise = await User.aggregate([
      { $match: { isDeleted: false, 'profile.graduationYear': { $exists: true, $ne: null } } },
      { $group: { _id: '$profile.graduationYear', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { year: '$_id', count: 1, _id: 0 } }
    ]);

    res.json({ success: true, data: { signups, proConversions, collegeWise, yearWise } });
  } catch (err) { next(err); }
});

// ─── USERS ────────────────────────────────────────────────────────────────────
// GET /v1/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = { isDeleted: false };
    if (req.query.role) filter.role = req.query.role;
    if (req.query.plan) filter['subscription.plan'] = req.query.plan;
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { email: searchRegex },
        { 'profile.firstName': searchRegex },
        { 'profile.lastName': searchRegex },
        { 'profile.college': searchRegex },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).select('-passwordHash').skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: { users }, pagination: { page, limit, total, hasNext: skip + limit < total } });
  } catch (err) { next(err); }
});

// GET /v1/admin/users/:id — full user detail
router.get('/users/:id', async (req, res, next) => {
  try {
    const QuizSession = require('../aptitude/quizSession.model');
    const Application = require('../jobs/application.model');

    const user = await User.findById(req.params.id).select('-passwordHash').lean();
    if (!user) return res.status(404).json({ success: false, error: { code: 4004, message: 'User not found' } });

    const [recentSessions, recentApplications] = await Promise.all([
      QuizSession.find({ userId: req.params.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('sessionType status score createdAt companySlug')
        .lean(),
      Application.find({ userId: req.params.id })
        .sort({ appliedAt: -1 })
        .limit(5)
        .populate('jobId', 'title companyName')
        .lean(),
    ]);

    res.json({ success: true, data: { user, recentSessions, recentApplications } });
  } catch (err) { next(err); }
});

// PATCH /v1/admin/users/:id
router.patch('/users/:id', async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.role) updates.role = req.body.role;
    if (req.body.plan) {
      updates['subscription.plan'] = req.body.plan;
      if (req.body.plan === 'pro') {
        updates['subscription.status'] = 'active';
        updates['subscription.startedAt'] = new Date();
        updates['subscription.expiresAt'] = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      }
    }
    if (req.body.subscriptionStatus) updates['subscription.status'] = req.body.subscriptionStatus;
    if (req.body.isDeleted !== undefined) {
      updates.isDeleted = req.body.isDeleted;
      if (req.body.isDeleted) updates.deletedAt = new Date();
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, error: { code: 4004, message: 'User not found' } });
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
});

// DELETE /v1/admin/users/:id — hard ban
router.delete('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
      deletedAt: new Date(),
      'subscription.status': 'cancelled',
    }, { new: true });
    if (!user) return res.status(404).json({ success: false, error: { code: 4004, message: 'User not found' } });
    res.json({ success: true, message: 'User banned successfully' });
  } catch (err) { next(err); }
});

// ─── QUESTIONS ────────────────────────────────────────────────────────────────
const Question = require('../aptitude/question.model');

// GET /v1/admin/questions
router.get('/questions', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = { isActive: true };
    if (req.query.topic) filter.topic = req.query.topic;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    if (req.query.company) filter.companies = req.query.company;
    if (req.query.search) {
      filter.text = new RegExp(req.query.search, 'i');
    }

    const [questions, total] = await Promise.all([
      Question.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      Question.countDocuments(filter),
    ]);
    res.json({ success: true, data: { questions }, pagination: { page, limit, total, hasNext: skip + limit < total } });
  } catch (err) { next(err); }
});

// POST /v1/admin/questions
router.post('/questions', async (req, res, next) => {
  try {
    const question = await Question.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Question created', data: { question } });
  } catch (err) { next(err); }
});

// GET /v1/admin/questions/:id — single question detail
router.get('/questions/:id', async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id).lean();
    if (!question) return res.status(404).json({ success: false, error: { code: 4004, message: 'Question not found' } });
    res.json({ success: true, data: { question } });
  } catch (err) { next(err); }
});

// POST /v1/admin/questions/bulk
router.post('/questions/bulk', async (req, res, next) => {
  try {
    if (!Array.isArray(req.body.questions)) {
      return res.status(400).json({ success: false, error: { code: 4008, message: 'Expected an array of questions' } });
    }

    const REQUIRED = ['text', 'correctOption', 'explanation', 'topic', 'difficulty'];
    const validRows = [];
    const errors = [];

    req.body.questions.forEach((q, i) => {
      const missing = REQUIRED.filter(f => !q[f]);
      const hasOptions = Array.isArray(q.options) && q.options.length === 4;
      if (missing.length || !hasOptions) {
        errors.push({ row: i + 1, missing: missing.concat(!hasOptions ? ['options (need 4)'] : []) });
      } else {
        validRows.push({ ...q, createdBy: req.user._id });
      }
    });

    if (validRows.length === 0) {
      return res.status(400).json({ success: false, error: { code: 4009, message: 'No valid rows to import' }, errors });
    }

    const result = await Question.insertMany(validRows);
    res.status(201).json({
      success: true,
      message: `${result.length} questions imported successfully`,
      data: { imported: result.length, skipped: errors.length, errors },
    });
  } catch (err) { next(err); }
});

// PUT /v1/admin/questions/:id
router.put('/questions/:id', async (req, res, next) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!question) return res.status(404).json({ success: false, error: { code: 4004, message: 'Question not found' } });
    res.json({ success: true, message: 'Question updated', data: { question } });
  } catch (err) { next(err); }
});

// DELETE /v1/admin/questions/:id
router.delete('/questions/:id', async (req, res, next) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, { isActive: false });
    if (!question) return res.status(404).json({ success: false, error: { code: 4004, message: 'Question not found' } });
    res.json({ success: true, message: 'Question deleted' });
  } catch (err) { next(err); }
});

// ─── COMPANY TRACKS ───────────────────────────────────────────────────────────
const Company = require('../company/company.model');

// GET /v1/admin/companies
router.get('/companies', async (req, res, next) => {
  try {
    const companies = await Company.find().sort({ name: 1 }).lean();
    res.json({ success: true, data: { companies } });
  } catch (err) { next(err); }
});

// GET /v1/admin/companies/:id
router.get('/companies/:id', async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).lean();
    if (!company) return res.status(404).json({ success: false, error: { code: 4004, message: 'Company not found' } });
    res.json({ success: true, data: { company } });
  } catch (err) { next(err); }
});

// POST /v1/admin/companies
router.post('/companies', async (req, res, next) => {
  try {
    const company = await Company.create(req.body);
    res.status(201).json({ success: true, message: 'Company track created', data: { company } });
  } catch (err) { next(err); }
});

// PUT /v1/admin/companies/:id
router.put('/companies/:id', async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!company) return res.status(404).json({ success: false, error: { code: 4004, message: 'Company not found' } });
    res.json({ success: true, message: 'Company track updated', data: { company } });
  } catch (err) { next(err); }
});

// PATCH /v1/admin/companies/:id
router.patch('/companies/:id', async (req, res, next) => {
  try {
    const allowed = {};
    if (req.body.isActive !== undefined) allowed.isActive = req.body.isActive;
    if (req.body.name) allowed.name = req.body.name;
    if (req.body.sector) allowed.sector = req.body.sector;
    const company = await Company.findByIdAndUpdate(req.params.id, allowed, { new: true });
    if (!company) return res.status(404).json({ success: false, error: { code: 4004, message: 'Company not found' } });
    res.json({ success: true, data: { company } });
  } catch (err) { next(err); }
});

// DELETE /v1/admin/companies/:id
router.delete('/companies/:id', async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, { isActive: false });
    if (!company) return res.status(404).json({ success: false, error: { code: 4004, message: 'Company not found' } });
    res.json({ success: true, message: 'Company track deactivated' });
  } catch (err) { next(err); }
});

// ─── MOCK TESTS ───────────────────────────────────────────────────────────────
const MockTest = require('./mockTest.model');

// GET /v1/admin/mock-tests
router.get('/mock-tests', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.company) filter.companySlug = req.query.company;
    const mockTests = await MockTest.find(filter)
      .populate('questions', 'text topic difficulty')
      .sort({ companySlug: 1, createdAt: -1 })
      .lean();
    res.json({ success: true, data: { mockTests } });
  } catch (err) { next(err); }
});

// POST /v1/admin/mock-tests
router.post('/mock-tests', async (req, res, next) => {
  try {
    const mockTest = await MockTest.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Mock test created', data: { mockTest } });
  } catch (err) { next(err); }
});

// GET /v1/admin/mock-tests/:id
router.get('/mock-tests/:id', async (req, res, next) => {
  try {
    const mockTest = await MockTest.findById(req.params.id)
      .populate('questions', 'text topic difficulty subTopic')
      .lean();
    if (!mockTest) return res.status(404).json({ success: false, error: { code: 4004, message: 'Mock test not found' } });
    res.json({ success: true, data: { mockTest } });
  } catch (err) { next(err); }
});

// PUT /v1/admin/mock-tests/:id
router.put('/mock-tests/:id', async (req, res, next) => {
  try {
    const mockTest = await MockTest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!mockTest) return res.status(404).json({ success: false, error: { code: 4004, message: 'Mock test not found' } });
    res.json({ success: true, message: 'Mock test updated', data: { mockTest } });
  } catch (err) { next(err); }
});

// DELETE /v1/admin/mock-tests/:id
router.delete('/mock-tests/:id', async (req, res, next) => {
  try {
    const mockTest = await MockTest.findByIdAndDelete(req.params.id);
    if (!mockTest) return res.status(404).json({ success: false, error: { code: 4004, message: 'Mock test not found' } });
    res.json({ success: true, message: 'Mock test deleted' });
  } catch (err) { next(err); }
});

// ─── JOBS ─────────────────────────────────────────────────────────────────────
const Job = require('../jobs/job.model');
const { runJobScraper } = require('../../jobs/scrapeJobsCron');

// POST /v1/admin/jobs/scrape
router.post('/jobs/scrape', async (req, res, next) => {
  try {
    const result = await runJobScraper();
    if (result.success) {
      res.json({ success: true, message: `Successfully imported ${result.importedCount} new jobs.` });
    } else {
      res.status(500).json({ success: false, error: { message: result.error } });
    }
  } catch (err) { next(err); }
});

// GET /v1/admin/jobs
router.get('/jobs', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [{ title: searchRegex }, { companyName: searchRegex }];
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('postedBy', 'email profile.firstName profile.lastName')
        .skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      Job.countDocuments(filter),
    ]);
    res.json({ success: true, data: { jobs }, pagination: { page, limit, total, hasNext: skip + limit < total } });
  } catch (err) { next(err); }
});

// GET /v1/admin/jobs/:id
router.get('/jobs/:id', async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).lean();
    if (!job) return res.status(404).json({ success: false, error: { code: 4004, message: 'Job not found' } });
    res.json({ success: true, data: { job } });
  } catch (err) { next(err); }
});

// POST /v1/admin/jobs
router.post('/jobs', createJobRules, validate, async (req, res, next) => {
  try {
    const job = await Job.create({
      ...req.body,
      postedBy: req.user._id,
    });
    res.status(201).json({ success: true, message: 'Job created', data: { job } });
  } catch (err) { next(err); }
});

// PUT /v1/admin/jobs/:id
router.put('/jobs/:id', createJobRules, validate, async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!job) return res.status(404).json({ success: false, error: { code: 4004, message: 'Job not found' } });
    res.json({ success: true, message: 'Job updated', data: { job } });
  } catch (err) { next(err); }
});

// PATCH /v1/admin/jobs/:id
router.patch('/jobs/:id', async (req, res, next) => {
  try {
    const allowed = {};
    if (req.body.status !== undefined) allowed.status = req.body.status;
    if (req.body.featured !== undefined) allowed.featured = req.body.featured;
    const job = await Job.findByIdAndUpdate(req.params.id, allowed, { new: true });
    if (!job) return res.status(404).json({ success: false, error: { code: 4004, message: 'Job not found' } });
    res.json({ success: true, data: { job } });
  } catch (err) { next(err); }
});

// DELETE /v1/admin/jobs/:id
router.delete('/jobs/:id', async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ success: false, error: { code: 4004, message: 'Job not found' } });
    res.json({ success: true, message: 'Job deleted' });
  } catch (err) { next(err); }
});

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────
// GET /v1/admin/applications
router.get('/applications', async (req, res, next) => {
  try {
    const Application = require('../jobs/application.model');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.jobId) filter.jobId = req.query.jobId;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('userId', 'email profile.firstName profile.lastName profile.college')
        .populate('jobId', 'title companyName type')
        .skip(skip).limit(limit).sort({ appliedAt: -1 }).lean(),
      Application.countDocuments(filter),
    ]);
    res.json({ success: true, data: { applications }, pagination: { page, limit, total, hasNext: skip + limit < total } });
  } catch (err) { next(err); }
});

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
// GET /v1/admin/subscriptions
router.get('/subscriptions', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = { 'subscription.plan': 'pro' };
    if (req.query.status) filter['subscription.status'] = req.query.status;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('email profile.firstName profile.lastName subscription createdAt')
        .skip(skip).limit(limit).sort({ 'subscription.startedAt': -1 }).lean(),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: { subscriptions: users }, pagination: { page, limit, total, hasNext: skip + limit < total } });
  } catch (err) { next(err); }
});

// GET /v1/admin/revenue — revenue metrics
router.get('/revenue', async (req, res, next) => {
  try {
    const activeProCount = await User.countDocuments({
      'subscription.plan': 'pro',
      'subscription.status': 'active',
      isDeleted: false,
    });

    // Monthly conversions for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyConversions = await User.aggregate([
      { $match: { 'subscription.startedAt': { $gte: sixMonthsAgo }, 'subscription.plan': 'pro' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$subscription.startedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        activeProCount,
        estimatedMRR: activeProCount * 299, // Rs. 299/month (monthly plan assumed)
        monthlyConversions,
      },
    });
  } catch (err) { next(err); }
});

// ─── COUPONS ──────────────────────────────────────────────────────────────────
const Coupon = require('../subscription/coupon.model');

// GET /v1/admin/coupons
router.get('/coupons', async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: { coupons } });
  } catch (err) { next(err); }
});

// POST /v1/admin/coupons
router.post('/coupons', async (req, res, next) => {
  try {
    const coupon = await Coupon.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Coupon created', data: { coupon } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, error: { code: 4009, message: 'Coupon code already exists' } });
    }
    next(err);
  }
});

// PATCH /v1/admin/coupons/:id — toggle active or update fields
router.patch('/coupons/:id', async (req, res, next) => {
  try {
    const allowed = {};
    if (req.body.isActive !== undefined) allowed.isActive = req.body.isActive;
    if (req.body.maxUses !== undefined) allowed.maxUses = req.body.maxUses;
    if (req.body.expiresAt !== undefined) allowed.expiresAt = req.body.expiresAt;
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, allowed, { new: true });
    if (!coupon) return res.status(404).json({ success: false, error: { code: 4004, message: 'Coupon not found' } });
    res.json({ success: true, data: { coupon } });
  } catch (err) { next(err); }
});

// DELETE /v1/admin/coupons/:id
router.delete('/coupons/:id', async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, error: { code: 4004, message: 'Coupon not found' } });
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) { next(err); }
});

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────
const Announcement = require('./announcement.model');

// GET /v1/admin/announcements
router.get('/announcements', async (req, res, next) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: { announcements } });
  } catch (err) { next(err); }
});

// POST /v1/admin/announcements
router.post('/announcements', async (req, res, next) => {
  try {
    const announcement = await Announcement.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Announcement created', data: { announcement } });
  } catch (err) { next(err); }
});

// PATCH /v1/admin/announcements/:id
router.patch('/announcements/:id', async (req, res, next) => {
  try {
    const allowed = {};
    if (req.body.isActive !== undefined) allowed.isActive = req.body.isActive;
    if (req.body.expiresAt !== undefined) allowed.expiresAt = req.body.expiresAt;
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, allowed, { new: true });
    if (!announcement) return res.status(404).json({ success: false, error: { code: 4004, message: 'Announcement not found' } });
    res.json({ success: true, data: { announcement } });
  } catch (err) { next(err); }
});

// DELETE /v1/admin/announcements/:id
router.delete('/announcements/:id', async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, error: { code: 4004, message: 'Announcement not found' } });
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) { next(err); }
});

// ─── BLOGS ────────────────────────────────────────────────────────────────────
const Blog = require('../blog/blog.model');

// GET /v1/admin/blogs
router.get('/blogs', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.q) {
      filter.$or = [
        { title: { $regex: req.query.q, $options: 'i' } },
        { slug: { $regex: req.query.q, $options: 'i' } }
      ];
    }

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .populate('author', 'profile.firstName profile.lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(filter),
    ]);

    res.json({ success: true, data: { blogs }, pagination: { page, limit, total, hasNext: skip + limit < total } });
  } catch (err) { next(err); }
});

// GET /v1/admin/blogs/:id
router.get('/blogs/:id', async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id).lean();
    if (!blog) return res.status(404).json({ success: false, error: { code: 4004, message: 'Blog not found' } });
    res.json({ success: true, data: { blog } });
  } catch (err) { next(err); }
});

// POST /v1/admin/blogs
router.post('/blogs', async (req, res, next) => {
  try {
    const blog = await Blog.create({ ...req.body, author: req.user._id });
    res.status(201).json({ success: true, message: 'Blog created', data: { blog } });
  } catch (err) { next(err); }
});

// PUT /v1/admin/blogs/:id
router.put('/blogs/:id', async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!blog) return res.status(404).json({ success: false, error: { code: 4004, message: 'Blog not found' } });
    res.json({ success: true, message: 'Blog updated', data: { blog } });
  } catch (err) { next(err); }
});

// DELETE /v1/admin/blogs/:id
router.delete('/blogs/:id', async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, error: { code: 4004, message: 'Blog not found' } });
    res.json({ success: true, message: 'Blog deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
