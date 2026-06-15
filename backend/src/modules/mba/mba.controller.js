const GdTopic = require('./models/gdTopic.model');
const PiQuestion = require('./models/piQuestion.model');
const CaseStudy = require('./models/caseStudy.model');
const WatTopic = require('./models/watTopic.model');
const MbaSession = require('./models/mbaSession.model');
const Sector = require('./models/sector.model');
const Guesstimate = require('./models/guesstimate.model');
const MbaAnalytics = require('./models/mbaAnalytics.model');
const MockInterview = require('./models/mockInterview.model');

// --- GD Topics ---
exports.getGdTopics = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;

    const topics = await GdTopic.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: topics });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.getGdTopicById = async (req, res) => {
  try {
    const topic = await GdTopic.findById(req.params.id);
    if (!topic) return res.status(404).json({ success: false, error: { message: 'GD Topic not found' } });
    res.json({ success: true, data: topic });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// --- PI Questions ---
exports.getPiQuestions = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.type) filter.type = req.query.type;

    const questions = await PiQuestion.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// --- Case Studies ---
exports.getCaseStudies = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.sector) filter.sector = req.query.sector;
    if (req.query.type) filter.type = req.query.type;

    const cases = await CaseStudy.find(filter).select('-solution -structuredApproach').sort({ createdAt: -1 });
    res.json({ success: true, data: cases });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.getCaseStudyById = async (req, res) => {
  try {
    const caseStudy = await CaseStudy.findById(req.params.id);
    if (!caseStudy) return res.status(404).json({ success: false, error: { message: 'Case Study not found' } });

    // Freemium protection logic
    const isPro = req.user && req.user.subscription && req.user.subscription.plan === 'pro';
    if (!caseStudy.isFree && !isPro) {
      // Hide solution for free users
      const lockedCase = caseStudy.toObject();
      delete lockedCase.solution;
      lockedCase.isLocked = true;
      return res.json({ success: true, data: lockedCase });
    }

    res.json({ success: true, data: caseStudy });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// --- WAT Topics ---
exports.getWatTopics = async (req, res) => {
  try {
    const topics = await WatTopic.find({ isActive: true }).select('-sampleEssay').sort({ createdAt: -1 });
    res.json({ success: true, data: topics });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.getWatTopicById = async (req, res) => {
  try {
    const topic = await WatTopic.findById(req.params.id);
    if (!topic) return res.status(404).json({ success: false, error: { message: 'WAT Topic not found' } });
    res.json({ success: true, data: topic });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// --- Sessions Tracking ---
exports.startMbaSession = async (req, res) => {
  try {
    const { sessionType, gdTopicId, piQuestionId, caseStudyId, watTopicId } = req.body;
    
    const newSession = new MbaSession({
      userId: req.user._id,
      sessionType,
      gdTopicId,
      piQuestionId,
      caseStudyId,
      watTopicId,
      status: 'in-progress'
    });

    await newSession.save();
    res.status(201).json({ success: true, data: newSession });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.finishMbaSession = async (req, res) => {
  try {
    const { submission, selfRating, timeTakenSeconds } = req.body;
    
    const session = await MbaSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ success: false, error: { message: 'Session not found' } });

    session.status = 'completed';
    session.completedAt = Date.now();
    
    if (submission) session.submission = submission;
    if (selfRating) session.selfRating = selfRating;
    if (timeTakenSeconds) session.timeTakenSeconds = timeTakenSeconds;

    await session.save();
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// --- Sectors ---
exports.getSectors = async (req, res) => {
  try {
    const sectors = await Sector.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: sectors });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.getSectorBySlug = async (req, res) => {
  try {
    const sector = await Sector.findOne({ slug: req.params.slug, isActive: true });
    if (!sector) return res.status(404).json({ success: false, error: { message: 'Sector not found' } });
    res.json({ success: true, data: sector });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// --- Guesstimates ---
exports.getGuesstimates = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;

    // List view: hide solution details
    const guesstimates = await Guesstimate.find(filter)
      .select('-solutionSteps -keyAssumptions -finalAnswer')
      .sort({ difficulty: 1, createdAt: -1 });
    res.json({ success: true, data: guesstimates });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.getGuesstimatById = async (req, res) => {
  try {
    const g = await Guesstimate.findById(req.params.id);
    if (!g) return res.status(404).json({ success: false, error: { message: 'Guesstimate not found' } });

    // Freemium check — only Pro users get full solution
    const isPro = req.user && req.user.subscription && req.user.subscription.plan === 'pro';
    if (!g.isFree && !isPro) {
      const locked = g.toObject();
      delete locked.solutionSteps;
      delete locked.finalAnswer;
      delete locked.keyAssumptions;
      locked.isLocked = true;
      return res.json({ success: true, data: locked });
    }

    res.json({ success: true, data: g });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// --- MBA Analytics ---
exports.getMbaAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate session counts live from MbaSession
    const [sessionStats, recentRaw] = await Promise.all([
      MbaSession.aggregate([
        { $match: { userId, status: 'completed' } },
        { $group: {
          _id: '$sessionType',
          count: { $sum: 1 },
          avgRating: { $avg: '$selfRating' },
        }},
      ]),
      // Last 30 days activity
      MbaSession.aggregate([
        {
          $match: {
            userId,
            status: 'completed',
            completedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
            types: { $addToSet: '$sessionType' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Reshape session stats into a keyed object
    const statsByType = { gd: 0, pi: 0, case: 0, wat: 0, guesstimate: 0 };
    let totalRatingSum = 0;
    let ratedSessions = 0;

    sessionStats.forEach(s => {
      statsByType[s._id] = s.count;
      if (s.avgRating) {
        totalRatingSum += s.avgRating * s.count;
        ratedSessions += s.count;
      }
    });

    const totalSessions = Object.values(statsByType).reduce((a, b) => a + b, 0);
    const avgSelfRating = ratedSessions > 0 ? +(totalRatingSum / ratedSessions).toFixed(1) : null;

    res.json({
      success: true,
      data: {
        totalSessions,
        avgSelfRating,
        byType: statsByType,
        recentActivity: recentRaw.map(d => ({
          date: d._id,
          count: d.count,
          types: d.types,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// --- Mock Interviews ---

// Start: picks N random PI questions and creates a session
exports.startMockInterview = async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 8;

    // Sample random active PI questions
    const questions = await PiQuestion.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: count } },
      { $project: { _id: 1, question: 1, type: 1 } },
    ]);

    if (questions.length === 0) {
      return res.status(404).json({ success: false, error: { message: 'No PI questions available. Please add some first.' } });
    }

    const session = await MockInterview.create({
      userId: req.user._id,
      questionIds: questions.map(q => q._id),
      answers: questions.map(q => ({
        piQuestionId: q._id,
        questionText: q.question,
        userAnswer: '',
        timeTakenSeconds: 0,
      })),
      status: 'in-progress',
    });

    res.status(201).json({ success: true, data: { session, questions } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Save answer for a specific question index
exports.submitMockInterviewAnswer = async (req, res) => {
  try {
    const { index, userAnswer, selfRating, timeTakenSeconds } = req.body;
    const session = await MockInterview.findOne({ _id: req.params.id, userId: req.user._id, status: 'in-progress' });
    if (!session) return res.status(404).json({ success: false, error: { message: 'Session not found or already completed' } });

    if (index == null || index < 0 || index >= session.answers.length) {
      return res.status(400).json({ success: false, error: { message: 'Invalid question index' } });
    }

    session.answers[index].userAnswer = userAnswer || '';
    if (selfRating)        session.answers[index].selfRating        = selfRating;
    if (timeTakenSeconds)  session.answers[index].timeTakenSeconds  = timeTakenSeconds;

    await session.save();
    res.json({ success: true, data: { index, saved: true } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Finish: compute aggregate scores, mark completed
exports.finishMockInterview = async (req, res) => {
  try {
    const session = await MockInterview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ success: false, error: { message: 'Session not found' } });

    session.status = 'completed';
    session.completedAt = new Date();

    const rated = session.answers.filter(a => a.selfRating);
    session.avgSelfRating = rated.length
      ? +(rated.reduce((s, a) => s + a.selfRating, 0) / rated.length).toFixed(1)
      : null;

    session.totalTimeTakenSeconds = session.answers.reduce((s, a) => s + (a.timeTakenSeconds || 0), 0);

    await session.save();
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Get a session by ID (for review)
exports.getMockInterviewById = async (req, res) => {
  try {
    const session = await MockInterview.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!session) return res.status(404).json({ success: false, error: { message: 'Session not found' } });
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// List past sessions for current user
exports.listMockInterviews = async (req, res) => {
  try {
    const sessions = await MockInterview
      .find({ userId: req.user._id, status: 'completed' })
      .select('avgSelfRating totalTimeTakenSeconds answers startedAt completedAt')
      .sort({ completedAt: -1 })
      .limit(20)
      .lean();
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};


