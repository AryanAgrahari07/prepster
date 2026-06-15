const express = require('express');
const router = express.Router();
const Company = require('./company.model');
const Question = require('../aptitude/question.model');
const QuizSession = require('../aptitude/quizSession.model');
const { authenticate, optionalAuth, requirePro } = require('../../middleware/auth');
const { AppError } = require('../../middleware/errorHandler');
const { SESSION_STATUS, SESSION_TYPES, REDIS_KEYS } = require('../../shared/constants');
const { cacheMiddleware } = require('../../middleware/cache');

// ── Helper: build filter for company-specific PYQ questions only ──────────────
// We ONLY show TalentBattle_Scraped questions in the company question bank.
// This avoids the thousands of aptitude questions that are broadly tagged with
// every company name by the post-processor.
function companyPYQFilter(slug) {
  return {
    source: 'TalentBattle_Scraped',
    companies: new RegExp(`^${slug}$`, 'i'),
    isActive: true,
  };
}

// ─── GET /v1/companies ────────────────────────────────────────────────────────
// Cached for 10 minutes — rarely changes
router.get('/', cacheMiddleware('companies:list', 600), async (req, res, next) => {
  try {
    const filter = { isActive: true };
    // Optional stream filter: ?stream=engineering | mba | both
    if (req.query.stream && ['engineering', 'mba'].includes(req.query.stream)) {
      filter.$or = [
        { targetStream: req.query.stream },
        { targetStream: 'both' },
      ];
    }
    const companies = await Company.find(filter)
      .select('name slug logo sector targetStream packageInfo.fresher totalQuestions')
      .lean();
    res.json({ success: true, data: { companies } });
  } catch (err) { next(err); }
});

// ─── GET /v1/companies/:slug ──────────────────────────────────────────────────
// Cached per slug for 5 minutes
router.get('/:slug', optionalAuth, cacheMiddleware(req => REDIS_KEYS.companyTrack(req.params.slug), 300), async (req, res, next) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug, isActive: true }).lean();
    if (!company) throw new AppError('Company track not found', 404, 4004);

    // Only count the actual company-specific PYQ questions (not generic aptitude)
    const totalQuestions = await Question.countDocuments(companyPYQFilter(req.params.slug));

    res.json({ success: true, data: { company, totalQuestions } });
  } catch (err) { next(err); }
});

// ─── GET /v1/companies/:slug/questions/preview (Public — 3 sample Qs) ─────────
router.get('/:slug/questions/preview', optionalAuth, async (req, res, next) => {
  try {
    const questions = await Question.aggregate([
      { $match: companyPYQFilter(req.params.slug) },
      { $sample: { size: 3 } },
      { $project: { correctOption: 0, explanation: 0 } }
    ]);
    res.json({ success: true, data: { questions } });
  } catch (err) { next(err); }
});

// ─── GET /v1/companies/:slug/questions (Pro only) ─────────────────────────────
router.get('/:slug/questions', authenticate, requirePro, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const questions = await Question.aggregate([
      { $match: companyPYQFilter(req.params.slug) },
      { $sample: { size: limit } },
      { $project: { correctOption: 0, explanation: 0 } }
    ]);
    res.json({ success: true, data: { questions } });
  } catch (err) { next(err); }
});

// ─── GET /v1/companies/:slug/mock-tests (Pro only) ───────────────────────────
router.get('/:slug/mock-tests', authenticate, requirePro, async (req, res, next) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug, isActive: true })
      .select('name slug')
      .lean();
    if (!company) throw new AppError('Company track not found', 404, 4004);

    const questionCount = await Question.countDocuments(companyPYQFilter(req.params.slug));

    // Generate a standard mock test descriptor for this company
    const mockTests = questionCount > 0 ? [
      {
        id: `${req.params.slug}-mock-1`,
        name: `${company.name} Full Mock Test`,
        description: `Simulates the actual ${company.name} aptitude test pattern`,
        questionCount: Math.min(30, questionCount),
        durationMinutes: 60,
        type: 'full-mock',
      },
      ...(questionCount >= 15 ? [{
        id: `${req.params.slug}-mock-2`,
        name: `${company.name} Quick Practice`,
        description: `15-question focused practice set`,
        questionCount: 15,
        durationMinutes: 30,
        type: 'quick',
      }] : []),
    ] : [];

    res.json({ success: true, data: { mockTests, company: company.name } });
  } catch (err) { next(err); }
});

// ─── POST /v1/companies/:slug/mock-tests/:id/start (Pro only) ─────────────────
router.post('/:slug/mock-tests/:mockId/start', authenticate, requirePro, async (req, res, next) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug, isActive: true })
      .select('name slug')
      .lean();
    if (!company) throw new AppError('Company track not found', 404, 4004);

    const isQuick = req.params.mockId.endsWith('-mock-2');
    const questionCount = isQuick ? 15 : 30;
    const timeLimitSeconds = isQuick ? 30 * 60 : 60 * 60;

    const questions = await Question.aggregate([
      { $match: companyPYQFilter(req.params.slug) },
      { $sample: { size: questionCount } },
      { $project: { _id: 1 } }
    ]);

    if (questions.length === 0) {
      throw new AppError('No questions available for this company mock test yet', 404, 4004);
    }

    const session = await QuizSession.create({
      userId: req.user._id,
      sessionType: SESSION_TYPES.COMPANY_MOCK,
      companySlug: req.params.slug,
      status: SESSION_STATUS.IN_PROGRESS,
      questions: questions.map(q => ({ questionId: q._id })),
      timeLimitSeconds,
    });

    res.status(201).json({ success: true, data: { sessionId: session._id } });
  } catch (err) { next(err); }
});

// ─── POST /v1/companies/:slug/experiences ──────────────────────────────────────
router.post('/:slug/experiences', authenticate, async (req, res, next) => {
  try {
    const { title, content, roleOffered, offerStatus } = req.body;
    
    if (!title || !content) {
      throw new AppError('Title and content are required', 400, 4000);
    }

    const company = await Company.findOneAndUpdate(
      { slug: req.params.slug, isActive: true },
      {
        $push: {
          interviewExperiences: {
            userId: req.user._id,
            title,
            content,
            roleOffered,
            offerStatus,
            status: 'approved', // Auto-approve for MVP
            submittedAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!company) throw new AppError('Company track not found', 404, 4004);

    res.status(201).json({ success: true, message: 'Experience submitted successfully' });
  } catch (err) { next(err); }
});

// ─── GET /v1/companies/:slug/progress ────────────────────────────────────────
router.get('/:slug/progress', authenticate, async (req, res, next) => {
  try {
    const UserAnalytics = require('../aptitude/userAnalytics.model');

    const [completedSessions, analytics, totalQuestions] = await Promise.all([
      QuizSession.countDocuments({
        userId: req.user._id,
        companySlug: req.params.slug,
        status: SESSION_STATUS.COMPLETED,
      }),
      UserAnalytics.findOne({ userId: req.user._id }).select('companyReadiness').lean(),
      Question.countDocuments(companyPYQFilter(req.params.slug)),
    ]);

    const readinessScore = analytics?.companyReadiness?.[req.params.slug] || 0;

    res.json({
      success: true,
      data: {
        slug: req.params.slug,
        completedSessions,
        readinessScore,
        totalQuestionsAvailable: totalQuestions,
      },
    });
  } catch (err) { next(err); }
});

module.exports = router;
